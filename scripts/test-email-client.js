// Test script for email client
require('dotenv').config({ path: '.env.production' });
const { EmailClient } = require('../lib/email-client');

async function testEmailClient() {
  console.log('Testing email client with the following environment variables:');
  console.log('EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST);
  console.log('EMAIL_SERVER_PORT:', process.env.EMAIL_SERVER_PORT);
  console.log('EMAIL_SERVER_USER:', process.env.EMAIL_SERVER_USER ? '✓ Set' : '✗ Not set');
  console.log('EMAIL_SERVER_PASSWORD:', process.env.EMAIL_SERVER_PASSWORD ? '✓ Set' : '✗ Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);

  try {
    console.log('\nCreating EmailClient instance...');
    const emailClient = new EmailClient();

    console.log('\nTesting SMTP connection...');
    try {
      await emailClient.testConnection();
      console.log('✅ SMTP connection test successful!');
    } catch (error) {
      console.error('❌ SMTP connection test failed:', error);
      console.error('Error details:', error.message);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      return;
    }

    console.log('\nSending test email...');
    const testEmail = process.argv[2] || process.env.EMAIL_SERVER_USER;
    if (!testEmail) {
      console.error('❌ No test email provided. Please provide an email address as an argument or set EMAIL_SERVER_USER.');
      return;
    }

    const result = await emailClient.sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@myblog.local',
      to: testEmail,
      subject: 'Test Email from EmailClient',
      text: 'This is a test email sent from the EmailClient test script.',
      html: '<h1>Test Email</h1><p>This is a test email sent from the EmailClient test script.</p>'
    });

    console.log('✅ Email sent successfully!', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testEmailClient();