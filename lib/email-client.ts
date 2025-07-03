import { SMTPClient } from 'emailjs';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailClient {
  private client: SMTPClient;

  constructor() {
    this.client = new SMTPClient({
      user: '',
      password: '',
      host: 'localhost',
      port: 2525,
      ssl: false,
      tls: false
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; result?: any }> {
    try {
      const message = {
        text: options.text || '',
        from: options.from,
        to: options.to,
        subject: options.subject,
        attachment: options.html ? [
          {
            data: options.html,
            alternative: true
          }
        ] : undefined
      };

      console.log('Sending email with emailjs...');
      const result = await this.client.sendAsync(message);
      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}

export { EmailClient };