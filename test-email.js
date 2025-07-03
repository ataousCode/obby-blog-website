const { EmailClient } = require('./lib/email-client.js');

async function testEmailJs() {
  console.log('Testing emailjs client with MailHog...');
  
  const emailClient = new EmailClient();
  
  try {
    console.log('Sending test email...');
    
    await emailClient.sendEmail({
      from: 'test@myblog.local',
      to: 'test@example.com',
      subject: 'Test Email - EmailJS Client',
      text: 'This is a test email using the EmailJS client.',
      html: '<p>This is a test email using the <strong>EmailJS client</strong>.</p>'
    });
    
    console.log('Email sent successfully!');
    
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmailJs();