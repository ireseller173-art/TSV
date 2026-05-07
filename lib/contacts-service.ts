/**
 * Contacts Service
 * Manages contact operations including phone book import
 */

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  isFavorite: boolean;
  isBlocked: boolean;
  createdAt: number;
  lastModified: number;
}

export interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number: string; label?: string }>;
  emails?: Array<{ email: string; label?: string }>;
}

/**
 * Contacts Service
 */
export const contactsService = {
  /**
   * Create a new contact
   */
  createContact(
    name: string,
    phone: string,
    email?: string,
    avatar?: string
  ): Contact {
    return {
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      email,
      phone,
      avatar,
      isFavorite: false,
      isBlocked: false,
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
  },

  /**
   * Update contact
   */
  updateContact(contact: Contact, updates: Partial<Contact>): Contact {
    return {
      ...contact,
      ...updates,
      lastModified: Date.now(),
    };
  },

  /**
   * Toggle favorite status
   */
  toggleFavorite(contact: Contact): Contact {
    return this.updateContact(contact, { isFavorite: !contact.isFavorite });
  },

  /**
   * Toggle block status
   */
  toggleBlock(contact: Contact): Contact {
    return this.updateContact(contact, { isBlocked: !contact.isBlocked });
  },

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    // Simple validation - at least 7 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  },

  /**
   * Validate email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Format phone number
   */
  formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1 (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.substring(1, 4)}) ${digits.substring(4, 7)}-${digits.substring(7)}`;
    }
    return phone;
  },

  /**
   * Normalize phone number for comparison
   */
  normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  },

  /**
   * Search contacts
   */
  searchContacts(contacts: Contact[], query: string): Contact[] {
    const lowerQuery = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.phone.includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Sort contacts
   */
  sortContacts(contacts: Contact[], sortBy: 'name' | 'recent' | 'favorite' = 'name'): Contact[] {
    const sorted = [...contacts];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return sorted.sort((a, b) => b.lastModified - a.lastModified);
      case 'favorite':
        return sorted.sort((a, b) => {
          if (a.isFavorite === b.isFavorite) {
            return a.name.localeCompare(b.name);
          }
          return a.isFavorite ? -1 : 1;
        });
      default:
        return sorted;
    }
  },

  /**
   * Filter contacts
   */
  filterContacts(
    contacts: Contact[],
    options: {
      showBlocked?: boolean;
      showFavorites?: boolean;
      showAll?: boolean;
    }
  ): Contact[] {
    let filtered = contacts;

    if (!options.showAll) {
      if (!options.showBlocked) {
        filtered = filtered.filter((c) => !c.isBlocked);
      }
      if (options.showFavorites) {
        filtered = filtered.filter((c) => c.isFavorite);
      }
    }

    return filtered;
  },

  /**
   * Get contact by phone number
   */
  getContactByPhone(contacts: Contact[], phone: string): Contact | undefined {
    const normalized = this.normalizePhoneNumber(phone);
    return contacts.find((c) => this.normalizePhoneNumber(c.phone) === normalized);
  },

  /**
   * Get contact by email
   */
  getContactByEmail(contacts: Contact[], email: string): Contact | undefined {
    const lowerEmail = email.toLowerCase();
    return contacts.find((c) => c.email?.toLowerCase() === lowerEmail);
  },

  /**
   * Merge phone contacts with app contacts
   */
  mergePhoneContacts(
    phoneContacts: PhoneContact[],
    appContacts: Contact[]
  ): { newContacts: Contact[]; existingMatches: Array<{ phone: PhoneContact; app: Contact }> } {
    const newContacts: Contact[] = [];
    const existingMatches: Array<{ phone: PhoneContact; app: Contact }> = [];

    phoneContacts.forEach((phoneContact) => {
      const primaryPhone = phoneContact.phoneNumbers?.[0]?.number;
      const primaryEmail = phoneContact.emails?.[0]?.email;

      if (primaryPhone) {
        const existing = this.getContactByPhone(appContacts, primaryPhone);
        if (existing) {
          existingMatches.push({ phone: phoneContact, app: existing });
        } else {
          const newContact = this.createContact(
            phoneContact.name,
            primaryPhone,
            primaryEmail
          );
          newContacts.push(newContact);
        }
      }
    });

    return { newContacts, existingMatches };
  },

  /**
   * Deduplicate contacts
   */
  deduplicateContacts(contacts: Contact[]): Contact[] {
    const seen = new Set<string>();
    return contacts.filter((contact) => {
      const key = this.normalizePhoneNumber(contact.phone);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * Export contacts as CSV
   */
  exportContactsAsCSV(contacts: Contact[]): string {
    const headers = ['Name', 'Phone', 'Email', 'Favorite', 'Blocked'];
    const rows = contacts.map((c) => [
      c.name,
      c.phone,
      c.email || '',
      c.isFavorite ? 'Yes' : 'No',
      c.isBlocked ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    return csv;
  },

  /**
   * Import contacts from CSV
   */
  importContactsFromCSV(csv: string): Contact[] {
    const lines = csv.split('\n');
    const contacts: Contact[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        const contact = this.createContact(parts[0], parts[1], parts[2]);
        if (parts[3]?.toLowerCase() === 'yes') {
          contact.isFavorite = true;
        }
        if (parts[4]?.toLowerCase() === 'yes') {
          contact.isBlocked = true;
        }
        contacts.push(contact);
      }
    }

    return this.deduplicateContacts(contacts);
  },
};
