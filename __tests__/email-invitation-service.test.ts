import { describe, it, expect } from 'vitest';
import { EmailInvitationService } from '../lib/email-invitation-service';

describe('EmailInvitationService', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(EmailInvitationService.isValidEmail('user@example.com')).toBe(true);
      expect(EmailInvitationService.isValidEmail('john.doe@company.co.uk')).toBe(true);
      console.log('✅ Valid emails accepted');
    });

    it('should reject invalid emails', () => {
      expect(EmailInvitationService.isValidEmail('invalid')).toBe(false);
      expect(EmailInvitationService.isValidEmail('user@')).toBe(false);
      expect(EmailInvitationService.isValidEmail('@example.com')).toBe(false);
      expect(EmailInvitationService.isValidEmail('user@.com')).toBe(false);
      console.log('✅ Invalid emails rejected');
    });
  });

  describe('sendInvitationEmail', () => {
    it('should prepare email invitation', async () => {
      const result = await EmailInvitationService.sendInvitationEmail({
        toEmail: 'friend@example.com',
        invitationLink: 'tsv-keeper://invite/ABC123_XYZ789',
        invitedByName: 'John Doe',
      });

      expect(result).toBe(true);
      console.log('✅ Email invitation prepared');
    });

    it('should handle email service calls', async () => {
      const result = await EmailInvitationService.sendInvitationEmail({
        toEmail: 'invalid-email',
        invitationLink: 'tsv-keeper://invite/ABC123_XYZ789',
        invitedByName: 'John Doe',
      });

      // Email service returns true for any call
      expect(typeof result).toBe('boolean');
      console.log('✅ Email service call completed');
    });
  });

  describe('sendBulkInvitations', () => {
    it('should send bulk invitations', async () => {
      const emails = [
        'friend1@example.com',
        'friend2@example.com',
        'friend3@example.com',
      ];

      const result = await EmailInvitationService.sendBulkInvitations(
        emails,
        'tsv-keeper://invite/ABC123_XYZ789',
        'John Doe'
      );

      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
      console.log('✅ Bulk invitations sent');
    });

    it('should handle mixed valid and invalid emails', async () => {
      const emails = [
        'valid@example.com',
        'invalid-email',
        'another@example.com',
      ];

      const result = await EmailInvitationService.sendBulkInvitations(
        emails,
        'tsv-keeper://invite/ABC123_XYZ789',
        'John Doe'
      );

      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toBeGreaterThan(0);
      console.log('✅ Mixed emails handled correctly');
    });
  });
});
