import { describe, it, expect } from 'vitest';
import { InvitationService, Invitation } from '../lib/invitation-service';

describe('InvitationService - Unit Tests', () => {
  describe('Invitation Code Generation', () => {
    it('should generate invitation code with correct format', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url',
        'friend@example.com'
      );

      expect(invitation).not.toBeNull();
      expect(invitation?.code).toBeDefined();
      expect(invitation?.code.length).toBeGreaterThan(0);
      expect(invitation?.code).toMatch(/^[A-Z0-9_]+$/);
      console.log('✅ Invitation code generated:', invitation?.code);
    });

    it('should generate unique codes', async () => {
      const inv1 = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      const inv2 = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      expect(inv1?.code).not.toBe(inv2?.code);
      console.log('✅ Unique codes generated');
    });
  });

  describe('Invitation Link Generation', () => {
    it('should create valid invitation link', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      expect(invitation?.invitationLink).toBeDefined();
      expect(invitation?.invitationLink).toContain('invite');
      expect(invitation?.invitationLink).toContain(invitation?.code);
      console.log('✅ Invitation link created:', invitation?.invitationLink);
    });
  });

  describe('Invitation Expiration', () => {
    it('should set expiration to 12 hours', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      const expectedExpiry = 12 * 60 * 60 * 1000; // 12 hours in ms
      const actualExpiry = invitation!.expiresAt - invitation!.createdAt;

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry - 100);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 100);
      console.log('✅ Expiration set to 12 hours');
    });

    it('should mark invitation as pending on creation', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      expect(invitation?.status).toBe('pending');
      console.log('✅ Invitation status is pending');
    });
  });

  describe('Invitation Data', () => {
    it('should store inviter information', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url_123',
        'friend@example.com'
      );

      expect(invitation?.invitedBy).toBe('user_123');
      expect(invitation?.invitedByName).toBe('John Doe');
      expect(invitation?.invitedByAvatar).toBe('avatar_url_123');
      expect(invitation?.inviteeEmail).toBe('friend@example.com');
      console.log('✅ Inviter information stored');
    });

    it('should support SMS invitations', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url',
        undefined,
        '+79991234567'
      );

      expect(invitation?.inviteeSms).toBe('+79991234567');
      console.log('✅ SMS invitation supported');
    });
  });

  describe('Invitation Validation Logic', () => {
    it('should validate invitation structure', async () => {
      const invitation = await InvitationService.createInvitation(
        'user_123',
        'John Doe',
        'avatar_url'
      );

      if (invitation) {
        const validation = await InvitationService.validateInvitation(invitation.code);
        expect(validation).toHaveProperty('valid');
        expect(validation).toHaveProperty('reason');
        console.log('✅ Invitation validation structure correct');
      }
    });

    it('should return validation result for any code', async () => {
      const validation = await InvitationService.validateInvitation('INVALID_CODE');

      expect(validation).toHaveProperty('valid');
      expect(typeof validation.valid).toBe('boolean');
      console.log('✅ Validation returns result for any code');
    });
  });

  describe('Invitation Statistics', () => {
    it('should calculate invitation stats', async () => {
      const stats = await InvitationService.getInvitationStats('user_999');

      expect(stats.total).toBeDefined();
      expect(stats.pending).toBeDefined();
      expect(stats.accepted).toBeDefined();
      expect(stats.expired).toBeDefined();
      expect(stats.rejected).toBeDefined();
      console.log('✅ Invitation statistics calculated');
    });
  });

  describe('Invitation Cleanup', () => {
    it('should have cleanup function', async () => {
      const cleanedCount = await InvitationService.cleanupExpiredInvitations();

      expect(typeof cleanedCount).toBe('number');
      expect(cleanedCount).toBeGreaterThanOrEqual(0);
      console.log('✅ Cleanup function works');
    });
  });
});
