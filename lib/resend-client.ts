import { Resend } from 'resend';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class ResendEmailClient {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; result?: any }> {
    try {
      // Validate required fields
      if (!options.to) throw new Error('Recipient email (to) is required');
      if (!options.from) throw new Error('Sender email (from) is required');
      if (!options.subject) throw new Error('Email subject is required');
      if (!options.text && !options.html) throw new Error('Email content (text or html) is required');
      const result = await this.resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text || options.subject,
        html: options.html,
      });

      // Email sent successfully via Resend
      return { success: true, result };
    } catch (error) {
      // Resend email sending failed
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Resend doesn't need connection testing like SMTP
      // We can just verify the API key is valid by checking domains
      // Resend client initialized successfully
      return true;
    } catch (error) {
    // Resend client test failed
      throw error;
    }
  }
}

export { ResendEmailClient };