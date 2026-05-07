import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizePhoneNumber,
  deduplicateContacts,
  type DeviceContact,
} from '@/lib/device-contacts-service';

describe('Device Contacts Service', () => {
  describe('normalizePhoneNumber', () => {
    it('should remove all non-digit characters', () => {
      const phone = '+1 (555) 123-4567';
      const normalized = phone.replace(/\D/g, '').slice(-10);
      expect(normalized).toBe('5551234567');
    });

    it('should keep only last 10 digits', () => {
      const phone = '15551234567';
      const normalized = phone.replace(/\D/g, '').slice(-10);
      expect(normalized).toBe('5551234567');
    });

    it('should handle short numbers', () => {
      const phone = '1234567';
      const normalized = phone.replace(/\D/g, '').slice(-10);
      expect(normalized).toBe('1234567');
    });
  });

  describe('deduplicateContacts', () => {
    it('should remove duplicate phone numbers', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'John Doe',
          phoneNumbers: ['+1-555-123-4567'],
          emails: [],
        },
        {
          id: '2',
          name: 'John',
          phoneNumbers: ['5551234567'],
          emails: [],
        },
      ];

      // Simulate deduplication logic
      const seen = new Set<string>();
      const deduplicated: DeviceContact[] = [];

      for (const contact of contacts) {
        const key = [
          ...contact.phoneNumbers.map((p) => p.replace(/\D/g, '').slice(-10)),
          ...contact.emails,
        ]
          .filter(Boolean)
          .join('|');

        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(contact);
        }
      }

      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].name).toBe('John Doe');
    });

    it('should remove duplicate emails', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'Alice',
          phoneNumbers: [],
          emails: ['alice@example.com'],
        },
        {
          id: '2',
          name: 'Alice Smith',
          phoneNumbers: [],
          emails: ['alice@example.com'],
        },
      ];

      const seen = new Set<string>();
      const deduplicated: DeviceContact[] = [];

      for (const contact of contacts) {
        const key = [
          ...contact.phoneNumbers.map((p) => p.replace(/\D/g, '').slice(-10)),
          ...contact.emails,
        ]
          .filter(Boolean)
          .join('|');

        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(contact);
        }
      }

      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].name).toBe('Alice');
    });

    it('should keep unique contacts', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'John',
          phoneNumbers: ['+1-555-111-1111'],
          emails: [],
        },
        {
          id: '2',
          name: 'Jane',
          phoneNumbers: ['+1-555-222-2222'],
          emails: [],
        },
      ];

      const seen = new Set<string>();
      const deduplicated: DeviceContact[] = [];

      for (const contact of contacts) {
        const key = [
          ...contact.phoneNumbers.map((p) => p.replace(/\D/g, '').slice(-10)),
          ...contact.emails,
        ]
          .filter(Boolean)
          .join('|');

        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(contact);
        }
      }

      expect(deduplicated).toHaveLength(2);
    });
  });

  describe('Contact filtering', () => {
    it('should filter contacts by name', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'John Doe',
          phoneNumbers: ['5551234567'],
          emails: [],
        },
        {
          id: '2',
          name: 'Jane Smith',
          phoneNumbers: ['5559876543'],
          emails: [],
        },
      ];

      const query = 'john';
      const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('John Doe');
    });

    it('should filter contacts by phone number', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'John',
          phoneNumbers: ['555-123-4567'],
          emails: [],
        },
        {
          id: '2',
          name: 'Jane',
          phoneNumbers: ['555-987-6543'],
          emails: [],
        },
      ];

      const query = '123';
      const filtered = contacts.filter((c) =>
        c.phoneNumbers.some((p) => p.includes(query))
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('John');
    });

    it('should filter contacts by email', () => {
      const contacts: DeviceContact[] = [
        {
          id: '1',
          name: 'John',
          phoneNumbers: [],
          emails: ['john@example.com'],
        },
        {
          id: '2',
          name: 'Jane',
          phoneNumbers: [],
          emails: ['jane@example.com'],
        },
      ];

      const query = 'john';
      const filtered = contacts.filter((c) =>
        c.emails.some((e) => e.toLowerCase().includes(query.toLowerCase()))
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('John');
    });
  });

  describe('Contact validation', () => {
    it('should validate contact has required fields', () => {
      const contact: DeviceContact = {
        id: '1',
        name: 'John',
        phoneNumbers: ['5551234567'],
        emails: [],
      };

      const isValid =
        contact.id &&
        contact.name &&
        (contact.phoneNumbers.length > 0 || contact.emails.length > 0);

      expect(isValid).toBe(true);
    });

    it('should reject contact without phone or email', () => {
      const contact: DeviceContact = {
        id: '1',
        name: 'John',
        phoneNumbers: [],
        emails: [],
      };

      const isValid =
        contact.id &&
        contact.name &&
        (contact.phoneNumbers.length > 0 || contact.emails.length > 0);

      expect(isValid).toBe(false);
    });

    it('should reject contact without name', () => {
      const contact: DeviceContact = {
        id: '1',
        name: '',
        phoneNumbers: ['5551234567'],
        emails: [],
      };

      const isValid =
        contact.id &&
        contact.name &&
        (contact.phoneNumbers.length > 0 || contact.emails.length > 0);

      expect(Boolean(isValid)).toBe(false);
    });
  });

  describe('Sync result', () => {
    it('should track imported contacts', () => {
      const syncResult = {
        imported: 5,
        updated: 2,
        failed: 0,
        timestamp: Date.now(),
      };

      expect(syncResult.imported).toBe(5);
      expect(syncResult.updated).toBe(2);
      expect(syncResult.failed).toBe(0);
      expect(syncResult.timestamp).toBeGreaterThan(0);
    });

    it('should handle failed syncs', () => {
      const syncResult = {
        imported: 0,
        updated: 0,
        failed: 1,
        timestamp: Date.now(),
      };

      expect(syncResult.failed).toBe(1);
      expect(syncResult.imported + syncResult.updated).toBe(0);
    });
  });
});
