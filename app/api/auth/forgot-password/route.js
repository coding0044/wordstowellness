import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify().then(() => {
  console.log('✅ SMTP transporter initialized successfully');
}).catch((err) => {
  console.error('❌ SMTP transporter verification failed:', err);
});

async function sendOTPEmail(email, otp, name) {
  const mailOptions = {
    from: `"wordstowellness" <${emailUser}>`,
    to: email,
    subject: 'Password Reset OTP - Your Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - wordstowellness</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: white; padding: 20px; text-align: center; font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #667eea; border-radius: 10px; margin: 20px 0; border: 2px dashed #667eea; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>wordstowellness - Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${name || 'User'},</p>
            <p>We received a request to reset your password. Use the OTP below to verify your identity:</p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0 0 20px;">
                <li>This OTP is valid for <strong>10 minutes</strong></li>
                <li>Never share this OTP with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>For security reasons, do not forward this email to anyone.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} wordstowellness. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Please provide an email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive an OTP.' 
      });
    }

    if (user.otpExpire && user.otp) {
      const timeSinceLastOTP = Date.now() - (user.otpExpire - 10 * 60 * 1000);
      if (timeSinceLastOTP < 60000) {
        return NextResponse.json(
          { message: 'Please wait 60 seconds before requesting another OTP' },
          { status: 429 }
        );
      }
    }

    const otp = user.generateOTP();
    await user.save();

    try {
      await sendOTPEmail(email, otp, user.name);
      console.log(`✅ OTP sent to: ${email}`);
      console.log(`🔑 OTP: ${otp}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError?.message || emailError, emailError?.stack || '');
      return NextResponse.json(
        { message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully! Please check your email.',
    });

  } catch (error) {
    console.error('Forgot password error:', error?.message || error, error?.stack || '');
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}