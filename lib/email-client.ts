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
      user: process.env.EMAIL_SERVER_USER || '',
      password: process.env.EMAIL_SERVER_PASSWORD || '',
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 465,
      ssl: process.env.EMAIL_SECURE === 'true',
      tls: process.env.EMAIL_SECURE !== 'true'
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

      console.log('Sending email with emailjs using Gmail SMTP...');
      console.log(`Host: ${this.client.smtp.host}, Port: ${this.client.smtp.port}, Secure: ${this.client.smtp.ssl}`);
      console.log(`From: ${options.from}, To: ${options.to}`);
      
      const result = await this.client.sendAsync(message);
      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

export { EmailClient };