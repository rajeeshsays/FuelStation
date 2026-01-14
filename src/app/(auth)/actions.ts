
'use server';

import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import connectToDatabase from '@/lib/db';
import UserModel, { type IUser } from '@/models/User';
import { generateToken } from '@/lib/jwt';
import { sendOtpEmail } from '@/lib/email';

const SALT_ROUNDS = 10;
const AUTHORIZED_EMAIL = process.env.AUTHORIZED_EMAIL!;
const JWT_SECRET = process.env.JWT_SECRET!;

if (!AUTHORIZED_EMAIL && process.env.NODE_ENV === 'production') {
    throw new Error('Missing AUTHORIZED_EMAIL environment variable');
}
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('Missing JWT_SECRET environment variable');
}

// --- Schemas ---
const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});


const OTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits long.'),
});

const LoginSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(1, 'Password is required.'),
});


// --- State Types ---
export type RegisterState = {
  message: string;
  success: boolean;
  isOtpStep: boolean;
  email?: string;
  errors?: Record<string, string[] | undefined>;
};

export type LoginState = {
    message: string;
    success?: boolean;
    errors?: Record<string, string[] | undefined>;
};


// --- Server Actions ---
export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  await connectToDatabase();

  const otp = formData.get('otp');

  if (otp) {
    // --- OTP Verification Step ---
    const email = formData.get('verification_email') as string;
    const validatedOtp = OTPSchema.safeParse({ email, otp: otp as string });
    
    if (!validatedOtp.success) {
      return { ...prevState, isOtpStep: true, email, message: 'Invalid OTP format.', errors: validatedOtp.error.flatten().fieldErrors };
    }

    try {
      const user = await UserModel.findOne({ email: validatedOtp.data.email });
      if (!user || user.otp !== validatedOtp.data.otp || !user.otpExpires || user.otpExpires < new Date()) {
        return { ...prevState, isOtpStep: true, email, message: 'Invalid or expired OTP. Please try again.' };
      }

      user.isActive = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      
      return { message: 'Registration successful! You will be redirected to the login page.', success: true, isOtpStep: false };

    } catch (error) {
      return { ...prevState, isOtpStep: true, email, message: 'An error occurred during verification.' };
    }
  } else {
    // --- Initial Registration Step ---
    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { success: false, isOtpStep: false, message: 'Invalid data.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password, firstName, lastName, phoneNumber } = validatedFields.data;

    if (email.toLowerCase() !== AUTHORIZED_EMAIL?.toLowerCase()) {
      return { success: false, isOtpStep: false, message: `Registration is only allowed for the authorized email address.` };
    }

    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser && existingUser.isActive) {
        return { success: false, isOtpStep: false, message: 'An active account with this email already exists.' };
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newOtp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      if (existingUser) {
        existingUser.password = hashedPassword;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.phoneNumber = phoneNumber;
        existingUser.otp = newOtp;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();
      } else {
        await UserModel.create({
          firstName,
          lastName,
          email,
          phoneNumber,
          password: hashedPassword,
          otp: newOtp,
          otpExpires,
          isActive: false,
        });
      }
      
      try {
        await sendOtpEmail(email, newOtp);
      } catch (error: any) {
        console.error('Registration failed at email step:', error);
        return { success: false, isOtpStep: false, message: error.message };
      }

      return {
        message: 'An OTP has been sent to your email. Please check your inbox to complete registration.',
        success: true,
        isOtpStep: true,
        email: email,
      };
    } catch (error: any) {
      console.error('Registration Error:', error);
      return { success: false, isOtpStep: false, message: `An unexpected error occurred: ${error.message}` };
    }
  }
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { message: 'Invalid data.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { email, password } = validatedFields.data;

    try {
        await connectToDatabase();
        const user: IUser | null = await UserModel.findOne({ email, isActive: true });
        if (!user || !user.password) {
            return { message: 'Invalid email or password.', success: false };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { message: 'Invalid email or password.', success: false };
        }

        const token = await generateToken({ 
            userId: user._id.toString(), 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        cookies().set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return { message: `An unexpected error occurred during login: ${error.message}`, success: false };
    }

    redirect('/dashboard');
}

export async function logout() {
    cookies().delete('session');
    redirect('/login');
}
