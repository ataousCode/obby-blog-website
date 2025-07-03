import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { EmailClient } from '@/lib/email-client';

const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['signup', 'signin', 'reset-password']),
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createEmailClient() {
  return new EmailClient();
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
    const emailClient = createEmailClient();
    
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

    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
