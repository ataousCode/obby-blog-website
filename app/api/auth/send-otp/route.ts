import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Import EmailClient with a dynamic import to handle both TS and JS versions
let EmailClient: any;
try {
  // Try to import from the JS version first (for production)
  EmailClient = require('@/lib/email-client').EmailClient;
} catch (error) {
  // Fall back to the TS version (for development)
  console.warn('Failed to import EmailClient from JS, trying TS version');
  import('@/lib/email-client').then(module => {
    EmailClient = module.EmailClient;
  }).catch(err => {
    console.error('Failed to import EmailClient:', err);
  });
}

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['signup', 'signin', 'reset-password']),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createEmailClient() {
  if (!EmailClient) {
    throw new Error('EmailClient is not available - check email client imports');
  }
  try {
    return new EmailClient();
  } catch (error) {
    console.error('Error creating EmailClient instance:', error);
    throw new Error(`Failed to create EmailClient: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function sendOTPEmail(email: string, otp: string, type: string) {
  const subjectMap: Record<string, string> = {
    signup: 'Complete Your Registration - Verify Email',
    signin: 'Sign In Verification Code',
    'reset-password': 'Password Reset Verification Code',
  };
  
  const subject = subjectMap[type] || 'Verification Code';

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif;">
      <h2>${subject}</h2>
      <p>Your verification code is:</p>
      <h1 style="background:#667eea;color:#fff;padding:10px;text-align:center;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    </body>
    </html>
  `;

  const text = `Your verification code is: ${otp}\nThis code expires in 10 minutes.`;

  try {
    console.log('Creating email client...');
    const emailClient = createEmailClient();
    
    console.log('Email client created, preparing to send email...');
    console.log('Email environment variables:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER ? '✓ Set' : '✗ Not set',
      password: process.env.EMAIL_SERVER_PASSWORD ? '✓ Set' : '✗ Not set',
      from: process.env.EMAIL_FROM,
      secure: process.env.EMAIL_SECURE
    });
    
    // Test SMTP connection before sending
    try {
      console.log('Testing SMTP connection...');
      await emailClient.testConnection();
      console.log('SMTP connection test passed, proceeding to send email');
    } catch (connError) {
      console.error('SMTP connection test failed:', connError);
      throw new Error(`SMTP connection failed: ${connError instanceof Error ? connError.message : String(connError)}`);
    }
    
    await emailClient.sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@myblog.local',
      to: email,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully via emailjs client');
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code:', (error as any).code);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sendOtpSchema.parse(body);
    const { email, type } = validatedData;

    if (type === 'signup') {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }
    }

    if (type === 'signin' || type === 'reset-password') {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        return NextResponse.json({ error: 'No account found' }, { status: 404 });
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires: expiresAt },
    });

    await sendOTPEmail(email, otp, type);

    return NextResponse.json(
      { message: 'Verification code sent', expiresAt: expiresAt.toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    
    // Provide more detailed error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to send verification code: ${error instanceof Error ? error.message : String(error)}` 
      : 'Failed to send verification code';
    
    // Include error code if available
    const errorResponse: { error: string; code?: string } = { error: errorMessage };
    if (error && typeof error === 'object' && 'code' in error) {
      errorResponse.code = (error as any).code;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
