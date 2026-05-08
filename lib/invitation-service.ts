/**
 * Invitation Service
 * Manages user invitations via SMS, Email, and referral links
 */

export interface Invitation {
  id: string;
  invitedBy: string;
  invitedEmail?: string;
  invitedPhone?: string;
  token: string;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: number;
}

const INVITATION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

export const invitationService = {
  /**
   * Generate invitation token
   */
  generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  /**
   * Create invitation
   */
  async createInvitation(
    invitedBy: string,
    invitedEmail?: string,
    invitedPhone?: string
  ): Promise<Invitation> {
    const invitation: Invitation = {
      id: `inv_${Date.now()}`,
      invitedBy,
      invitedEmail,
      invitedPhone,
      token: this.generateToken(),
      expiresAt: Date.now() + INVITATION_EXPIRY_MS,
      status: 'pending',
      createdAt: Date.now(),
    };

    // TODO: Save to Firebase Firestore
    return invitation;
  },

  /**
   * Generate invitation link
   */
  generateInvitationLink(token: string, baseUrl: string = 'https://tsv-keeper.app'): string {
    return `${baseUrl}/invite/${token}`;
  },

  /**
   * Verify invitation token
   */
  async verifyInvitation(token: string): Promise<Invitation | null> {
    // TODO: Query Firebase Firestore
    return null;
  },

  /**
   * Accept invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<boolean> {
    try {
      const invitation = await this.verifyInvitation(token);

      if (!invitation) {
        return false;
      }

      if (invitation.status !== 'pending') {
        return false;
      }

      if (Date.now() > invitation.expiresAt) {
        return false;
      }

      // TODO: Update invitation status and create connection between users
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Send invitation via SMS
   */
  async sendSMSInvitation(phoneNumber: string, invitationLink: string): Promise<boolean> {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Send invitation via Email
   */
  async sendEmailInvitation(email: string, invitationLink: string, inviterName: string): Promise<boolean> {
    try {
      // TODO: Integrate with email service (SendGrid, Firebase Functions, etc.)
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get user's pending invitations
   */
  async getPendingInvitations(userId: string): Promise<Invitation[]> {
    // TODO: Query Firebase Firestore
    return [];
  },

  /**
   * Check if invitation is expired
   */
  isExpired(invitation: Invitation): boolean {
    return Date.now() > invitation.expiresAt;
  },
};
