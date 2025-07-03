import * as net from 'net';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class SimpleSmtpClient {
  private host: string;
  private port: number;

  constructor(host: string = 'localhost', port: number = 2525) {
    this.host = host;
    this.port = port;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let step = 0;
      const commands = [
        `HELO ${this.host}`,
        `MAIL FROM:<${options.from}>`,
        `RCPT TO:<${options.to}>`,
        'DATA',
        this.buildEmailData(options),
        'QUIT'
      ];

      socket.setTimeout(30000);

      socket.on('connect', () => {
        console.log('Connected to SMTP server');
      });

      socket.on('data', (data) => {
        const response = data.toString();
        console.log('SMTP Response:', response);

        if (response.startsWith('220') && step === 0) {
          // Server ready, send HELO
          socket.write(commands[step] + '\r\n');
          step++;
        } else if (response.startsWith('250') || response.startsWith('354')) {
          if (step < commands.length) {
            if (commands[step] === 'QUIT') {
              socket.write(commands[step] + '\r\n');
              socket.end();
              resolve();
            } else {
              socket.write(commands[step] + '\r\n');
              step++;
            }
          }
        } else if (response.startsWith('221')) {
          // Goodbye message
          socket.end();
          resolve();
        } else if (response.startsWith('4') || response.startsWith('5')) {
          // Error response
          reject(new Error(`SMTP Error: ${response}`));
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        reject(error);
      });

      socket.on('timeout', () => {
        console.error('Socket timeout');
        socket.destroy();
        reject(new Error('SMTP connection timeout'));
      });

      socket.on('close', () => {
        console.log('Connection closed');
      });

      socket.connect(this.port, this.host);
    });
  }

  private buildEmailData(options: EmailOptions): string {
    const boundary = 'boundary_' + Date.now();
    let emailData = `From: ${options.from}\r\n`;
    emailData += `To: ${options.to}\r\n`;
    emailData += `Subject: ${options.subject}\r\n`;
    emailData += `MIME-Version: 1.0\r\n`;
    
    if (options.html && options.text) {
      emailData += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
      emailData += `--${boundary}\r\n`;
      emailData += `Content-Type: text/plain; charset=utf-8\r\n\r\n`;
      emailData += `${options.text}\r\n`;
      emailData += `--${boundary}\r\n`;
      emailData += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      emailData += `${options.html}\r\n`;
      emailData += `--${boundary}--\r\n`;
    } else if (options.html) {
      emailData += `Content-Type: text/html; charset=utf-8\r\n\r\n`;
      emailData += `${options.html}\r\n`;
    } else {
      emailData += `Content-Type: text/plain; charset=utf-8\r\n\r\n`;
      emailData += `${options.text || ''}\r\n`;
    }
    
    emailData += '\r\n.'; // End of data marker
    return emailData;
  }
}