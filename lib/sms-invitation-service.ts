import { Invitation } from './invitation-service';

export interface SMSInvitationRequest {
  toPhoneNumber: string;
  invitationLink: string;
  invitedByName: string;
}

export class SMSInvitationService {
  /**
   * Generate SMS message
   */
  private static generateSMSMessage(
    invitationLink: string,
    invitedByName: string
  ): string {
    return `${invitedByName} приглашает вас в TSV Keeper! 🎉\n\nПринять приглашение:\n${invitationLink}\n\n⏰ Действует 12 часов`;
  }

  /**
   * Send invitation SMS
   */
  static async sendInvitationSMS(request: SMSInvitationRequest): Promise<boolean> {
    try {
      const message = this.generateSMSMessage(request.invitationLink, request.invitedByName);

      // Validate phone number
      if (!this.isValidPhoneNumber(request.toPhoneNumber)) {
        console.error('Invalid phone number:', request.toPhoneNumber);
        return false;
      }

      console.log('📱 SMS invitation prepared:', {
        to: request.toPhoneNumber,
        message: message,
        messageLength: message.length,
      });

      // Simulate API call to backend
      const response = await this.callSMSAPI({
        to: request.toPhoneNumber,
        message,
        invitationLink: request.invitationLink,
      });

      if (response.success) {
        console.log('✅ SMS invitation sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send SMS:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending invitation SMS:', error);
      return false;
    }
  }

  /**
   * Call SMS API (would be implemented in backend)
   */
  private static async callSMSAPI(smsData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // This would call a Firebase Cloud Function or backend API (Twilio, etc.)
      // For now, we'll return a successful response for testing
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if it's between 10-15 digits (international standard)
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Format phone number to international format
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Add + prefix if not present
    if (!phoneNumber.startsWith('+')) {
      return `+${cleaned}`;
    }

    return phoneNumber;
  }

  /**
   * Send bulk SMS invitations
   */
  static async sendBulkSMSInvitations(
    phoneNumbers: string[],
    invitationLink: string,
    invitedByName: string
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const phoneNumber of phoneNumbers) {
      if (!this.isValidPhoneNumber(phoneNumber)) {
        results.failed++;
        results.errors.push(`Invalid phone number: ${phoneNumber}`);
        continue;
      }

      const success = await this.sendInvitationSMS({
        toPhoneNumber: phoneNumber,
        invitationLink,
        invitedByName,
      });

      if (success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to: ${phoneNumber}`);
      }
    }

    return results;
  }

  /**
   * Get SMS character count and SMS parts needed
   */
  static calculateSMSParts(message: string): { characters: number; parts: number } {
    const characters = message.length;
    // Standard SMS is 160 characters, but with special characters it's 70
    const singleSMSLimit = 160;
    const multiSMSLimit = 153; // 160 - 7 for concatenation header

    let parts = 1;
    if (characters > singleSMSLimit) {
      parts = Math.ceil((characters - singleSMSLimit) / multiSMSLimit) + 1;
    }

    return { characters, parts };
  }
}
