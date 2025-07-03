// CommonJS version of the email client
// Using dynamic import for ESM-only emailjs package

class EmailClient {
  constructor() {
    // Client will be initialized lazily when needed
    this.client = null;
    this.config = {
      user: process.env.EMAIL_SERVER_USER || '',
      password: process.env.EMAIL_SERVER_PASSWORD || '',
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 465,
      ssl: process.env.EMAIL_SECURE === 'true',
      tls: process.env.EMAIL_SECURE !== 'true',
      timeout: 10000 // 10 second timeout
    };
    
    // Log SMTP configuration (without sensitive data)
    console.log('Initializing EmailClient with config:', {
      host: this.config.host,
      port: this.config.port,
      user: process.env.EMAIL_SERVER_USER ? '✓ Set' : '✗ Not set',
      password: process.env.EMAIL_SERVER_PASSWORD ? '✓ Set' : '✗ Not set',
      ssl: this.config.ssl,
      tls: this.config.tls
    });
  }
  
  // Initialize SMTP client with dynamic import
  async initClient() {
    if (this.client) return this.client;
    
    try {
      // Dynamically import emailjs (ESM module)
      const { SMTPClient } = await import('emailjs');
      this.client = new SMTPClient(this.config);
      return this.client;
    } catch (error) {
      console.error('Failed to initialize SMTP client:', error);
      throw new Error(`SMTP client initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Test connection to SMTP server
  async testConnection() {
    const client = await this.initClient();
    
    return new Promise((resolve, reject) => {
      try {
        client.smtp.connect((err) => {
          if (err) {
            console.error('SMTP connection test failed:', err);
            reject(err);
          } else {
            console.log('SMTP connection test successful');
            // Disconnect after successful test
            client.smtp.quit();
            resolve(true);
          }
        });
      } catch (error) {
        console.error('Error during SMTP connection test:', error);
        reject(error);
      }
    });
  }

  async sendEmail(options) {
    try {
      // Validate required fields
      if (!options.to) throw new Error('Recipient email (to) is required');
      if (!options.from) throw new Error('Sender email (from) is required');
      if (!options.subject) throw new Error('Email subject is required');
      if (!options.text && !options.html) throw new Error('Email content (text or html) is required');
      
      // Initialize client if not already done
      const client = await this.initClient();
      
      // Dynamically import Message from emailjs
      const { Message } = await import('emailjs');
      
      // Create a proper Message instance
      const message = new Message({
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
      });

      console.log('Sending email with emailjs using Gmail SMTP...');
      console.log(`Using configured SMTP settings from environment variables`);
      console.log(`From: ${options.from}, To: ${options.to}`);
      
      // Add timeout for sending email
      const sendWithTimeout = async () => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Email sending timed out after 30 seconds'));
          }, 30000); // 30 second timeout
          
          client.sendAsync(message)
            .then(result => {
              clearTimeout(timeoutId);
              resolve(result);
            })
            .catch(err => {
              clearTimeout(timeoutId);
              reject(err);
            });
        });
      };
      
      const result = await sendWithTimeout();
      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', error.code);
      }
      
      // Provide more helpful error messages based on common error codes
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code;
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

module.exports = { EmailClient };