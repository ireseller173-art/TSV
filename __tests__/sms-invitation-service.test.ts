import { describe, it, expect } from 'vitest';
import { SMSInvitationService } from '../lib/sms-invitation-service';

describe('SMSInvitationService', () => {
  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(SMSInvitationService.isValidPhoneNumber('+79991234567')).toBe(true);
      expect(SMSInvitationService.isValidPhoneNumber('79991234567')).toBe(true);
      expect(SMSInvitationService.isValidPhoneNumber('+1 (999) 999-9999')).toBe(true);
      console.log('✅ Valid phone numbers accepted');
    });

    it('should reject invalid phone numbers', () => {
      expect(SMSInvitationService.isValidPhoneNumber('123')).toBe(false);
      expect(SMSInvitationService.isValidPhoneNumber('abc')).toBe(false);
      expect(SMSInvitationService.isValidPhoneNumber('')).toBe(false);
      console.log('✅ Invalid phone numbers rejected');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone number with + prefix', () => {
      const formatted = SMSInvitationService.formatPhoneNumber('79991234567');
      expect(formatted).toContain('+');
      console.log('✅ Phone number formatted:', formatted);
    });

    it('should handle already formatted numbers', () => {
      const formatted = SMSInvitationService.formatPhoneNumber('+79991234567');
      expect(formatted).toBe('+79991234567');
      console.log('✅ Already formatted number handled');
    });
  });

  describe('sendInvitationSMS', () => {
    it('should prepare SMS invitation', async () => {
      const result = await SMSInvitationService.sendInvitationSMS({
        toPhoneNumber: '+79991234567',
        invitationLink: 'tsv-keeper://invite/ABC123_XYZ789',
        invitedByName: 'John Doe',
      });

      expect(result).toBe(true);
      console.log('✅ SMS invitation prepared');
    });

    it('should reject invalid phone number', async () => {
      const result = await SMSInvitationService.sendInvitationSMS({
        toPhoneNumber: 'invalid',
        invitationLink: 'tsv-keeper://invite/ABC123_XYZ789',
        invitedByName: 'John Doe',
      });

      expect(result).toBe(false);
      console.log('✅ Invalid phone number rejected');
    });
  });

  describe('calculateSMSParts', () => {
    it('should calculate SMS parts for short message', () => {
      const message = 'Hello, this is a test message';
      const result = SMSInvitationService.calculateSMSParts(message);

      expect(result.characters).toBe(message.length);
      expect(result.parts).toBe(1);
      console.log('✅ Short message calculated:', result);
    });

    it('should calculate SMS parts for long message', () => {
      const message = 'A'.repeat(200); // 200 characters
      const result = SMSInvitationService.calculateSMSParts(message);

      expect(result.characters).toBe(200);
      expect(result.parts).toBeGreaterThan(1);
      console.log('✅ Long message calculated:', result);
    });
  });

  describe('sendBulkSMSInvitations', () => {
    it('should send bulk SMS invitations', async () => {
      const phoneNumbers = [
        '+79991234567',
        '+79998765432',
        '+79995551234',
      ];

      const result = await SMSInvitationService.sendBulkSMSInvitations(
        phoneNumbers,
        'tsv-keeper://invite/ABC123_XYZ789',
        'John Doe'
      );

      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
      console.log('✅ Bulk SMS invitations sent');
    });

    it('should handle mixed valid and invalid numbers', async () => {
      const phoneNumbers = [
        '+79991234567',
        'invalid',
        '+79998765432',
      ];

      const result = await SMSInvitationService.sendBulkSMSInvitations(
        phoneNumbers,
        'tsv-keeper://invite/ABC123_XYZ789',
        'John Doe'
      );

      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
      console.log('✅ Mixed phone numbers handled correctly');
    });
  });
});
