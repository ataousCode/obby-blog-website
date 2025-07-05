import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['signup', 'signin', 'reset-password']),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createEmailClient() {
  try {
    const { ResendEmailClient } = await import('@/lib/resend-client');
    return new ResendEmailClient();
  } catch (error) {
    console.error('Error creating ResendEmailClient instance:', error);
    throw new Error(`Failed to create ResendEmailClient: ${error instanceof Error ? error.message : String(error)}`);
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
    console.log('Creating Resend email client...');
    const emailClient = await createEmailClient();
    
    console.log('Resend email client created, preparing to send email...');
    console.log('Email environment variables:', {
      resendApiKey: process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set',
      from: process.env.EMAIL_FROM
    });
    
    // Test connection (Resend doesn't need SMTP connection testing)
    try {
      console.log('Testing Resend client...');
      await emailClient.testConnection();
      console.log('Resend client test passed, proceeding to send email');
    } catch (connError) {
      console.error('Resend client test failed:', connError);
      throw new Error(`Resend client failed: ${connError instanceof Error ? connError.message : String(connError)}`);
    }
    
    await emailClient.sendEmail({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: email,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully via Resend client');
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
