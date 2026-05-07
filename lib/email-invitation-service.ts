import { Invitation } from './invitation-service';

export interface EmailInvitationRequest {
  toEmail: string;
  invitationLink: string;
  invitedByName: string;
  invitedByAvatar?: string;
}

export class EmailInvitationService {
  /**
   * Generate HTML email template
   */
  private static generateEmailTemplate(
    invitationLink: string,
    invitedByName: string,
    invitedByAvatar?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0a7ea4; }
            .content { margin: 20px 0; line-height: 1.6; }
            .button { display: inline-block; background-color: #0a7ea4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">TSV Keeper</div>
            </div>
            
            <div class="content">
              <p>Привет! 👋</p>
              
              <p><strong>${invitedByName}</strong> приглашает вас присоединиться к TSV Keeper - приложению для безопасного общения.</p>
              
              <p>Нажмите на кнопку ниже, чтобы принять приглашение:</p>
              
              <center>
                <a href="${invitationLink}" class="button">Принять приглашение</a>
              </center>
              
              <p>Или скопируйте эту ссылку в браузер:</p>
              <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
                ${invitationLink}
              </p>
              
              <p><strong>⏰ Важно:</strong> Это приглашение действует только 12 часов!</p>
              
              <p>Если вы не ожидали это приглашение, просто проигнорируйте это письмо.</p>
            </div>
            
            <div class="footer">
              <p>© 2026 TSV Keeper. Все права защищены.</p>
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email
   */
  private static generatePlainTextEmail(
    invitationLink: string,
    invitedByName: string
  ): string {
    return `
Привет!

${invitedByName} приглашает вас присоединиться к TSV Keeper - приложению для безопасного общения.

Нажмите на эту ссылку, чтобы принять приглашение:
${invitationLink}

⏰ ВАЖНО: Это приглашение действует только 12 часов!

Если вы не ожидали это приглашение, просто проигнорируйте это письмо.

---
© 2026 TSV Keeper
Это автоматическое письмо, пожалуйста, не отвечайте на него.
    `;
  }

  /**
   * Send invitation email
   */
  static async sendInvitationEmail(request: EmailInvitationRequest): Promise<boolean> {
    try {
      const htmlContent = this.generateEmailTemplate(
        request.invitationLink,
        request.invitedByName,
        request.invitedByAvatar
      );

      const plainTextContent = this.generatePlainTextEmail(
        request.invitationLink,
        request.invitedByName
      );

      // In production, this would call a backend API or Firebase Cloud Function
      // For now, we'll simulate the email sending
      console.log('📧 Email invitation prepared:', {
        to: request.toEmail,
        subject: `${request.invitedByName} приглашает вас в TSV Keeper`,
        htmlLength: htmlContent.length,
        textLength: plainTextContent.length,
      });

      // Simulate API call to backend
      const response = await this.callEmailAPI({
        to: request.toEmail,
        subject: `${request.invitedByName} приглашает вас в TSV Keeper`,
        htmlContent,
        plainTextContent,
        invitationLink: request.invitationLink,
      });

      if (response.success) {
        console.log('✅ Email invitation sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send email:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }

  /**
   * Call email API (would be implemented in backend)
   */
  private static async callEmailAPI(emailData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // This would call a Firebase Cloud Function or backend API
      // For now, we'll return a successful response for testing
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Verify email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Send bulk invitations
   */
  static async sendBulkInvitations(
    emails: string[],
    invitationLink: string,
    invitedByName: string
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const email of emails) {
      if (!this.isValidEmail(email)) {
        results.failed++;
        results.errors.push(`Invalid email: ${email}`);
        continue;
      }

      const success = await this.sendInvitationEmail({
        toEmail: email,
        invitationLink,
        invitedByName,
      });

      if (success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to: ${email}`);
      }
    }

    return results;
  }
}
