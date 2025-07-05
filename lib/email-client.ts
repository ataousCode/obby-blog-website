import { SMTPClient } from 'emailjs';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailClient {
  private client: SMTPClient | null = null;
  private config: {
    user: string;
    password: string;
    host: string;
    port: number;
    ssl: boolean;
    tls: boolean;
    timeout: number;
  };

  constructor() {
    this.config = {
      user: process.env.EMAIL_SERVER_USER || '',
      password: process.env.EMAIL_SERVER_PASSWORD || '',
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 465,
      ssl: process.env.EMAIL_SECURE === 'true',
      tls: process.env.EMAIL_SECURE !== 'true',
      timeout: 30000
    };
    
    console.log('Initializing EmailClient with config:', {
      host: this.config.host,
      port: this.config.port,
      user: process.env.EMAIL_SERVER_USER ? '✓ Set' : '✗ Not set',
      password: process.env.EMAIL_SERVER_PASSWORD ? '✓ Set' : '✗ Not set',
      ssl: this.config.ssl,
      tls: this.config.tls
    });
  }
  
  // Initialize SMTP client
  async initClient(): Promise<SMTPClient> {
    if (this.client) return this.client;
    
    try {
      console.log('Initializing SMTP client with config:', {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        ssl: this.config.ssl,
        tls: this.config.tls
      });
      
      const client = new SMTPClient(this.config);
      this.client = client;
      return client;
    } catch (error) {
      console.error('Failed to initialize SMTP client:', error);
      throw new Error(`SMTP client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test connection to SMTP server
  async testConnection(): Promise<boolean> {
    const client = await this.initClient();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('SMTP connection test timeout after 15 seconds'));
      }, 15000);
      
      try {
        // Send a test message to verify connection
        const testMessage = {
          text: 'Connection test',
          from: process.env.EMAIL_FROM || this.config.user,
          to: this.config.user, // Send test to self
          subject: 'SMTP Connection Test'
        };
        
        client.send(testMessage, (err: Error | null, message: any) => {
          clearTimeout(timeout);
          if (err) {
            console.error('SMTP connection test failed:', err);
            reject(err);
          } else {
            console.log('SMTP connection test successful:', message);
            resolve(true);
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error during SMTP connection test:', error);
        reject(error);
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; result?: any }> {
    try {
      // Validate required fields
      if (!options.to) throw new Error('Recipient email (to) is required');
      if (!options.from) throw new Error('Sender email (from) is required');
      if (!options.subject) throw new Error('Email subject is required');
      if (!options.text && !options.html) throw new Error('Email content (text or html) is required');
      
      // Initialize client if not already done
      const client = await this.initClient();
      
      // Create message object for emailjs
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
      console.log(`Using configured SMTP settings from environment variables`);
      console.log(`From: ${options.from}, To: ${options.to}`);
      
      if (!this.client) {
         throw new Error('SMTP client not initialized');
       }
       
       // Send email with timeout handling
       const result = await new Promise((resolve, reject) => {
         const timeout = setTimeout(() => {
           reject(new Error('Email sending timeout after 30 seconds'));
         }, 30000);
         
         this.client!.send(message, (err: Error | null, sentMessage: any) => {
           clearTimeout(timeout);
           if (err) {
             reject(err);
           } else {
             resolve(sentMessage);
           }
         });
       });
      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', (error as any).code);
      }
      
      // Provide more helpful error messages based on common error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === 'ECONNREFUSED') {
          throw new Error(`Connection to SMTP server refused. Check host and port settings.`);
        } else if (errorCode === 'ETIMEDOUT') {
          throw new Error(`Connection to SMTP server timed out. Check network and firewall settings.`);
        } else if (errorCode === 'EAUTH') {
          throw new Error(`Authentication failed. Check username and password.`);
        } else if (errorCode === 'ESOCKET') {
          throw new Error(`Socket error when connecting to SMTP server. Check SSL/TLS settings.`);
        }
      }
      
      throw error;
    }
  }
}

export { EmailClient };