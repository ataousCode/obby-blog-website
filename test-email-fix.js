// Test script to check EmailClient import and functionality
const { EmailClient } = require('./dist/email-client.js');

console.log('EmailClient imported:', EmailClient);

if (EmailClient) {
  try {
    const emailClient = new EmailClient();
    console.log('EmailClient instance created:', emailClient);
    
    // Test sending an email
    emailClient.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email</p>',
      text: 'This is a test email'
    }).then(result => {
      console.log('Email sent result:', result);
    }).catch(error => {
      console.error('Email sending error:', error);
    });
  } catch (error) {
    console.error('Error creating EmailClient instance:', error);
  }
} else {
  console.error('EmailClient is undefined');
}