
'use client';

import { useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { register, type RegisterState } from '@/app/(auth)/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';

function SubmitButton({ isOtpStep }: { isOtpStep: boolean }) {
    const { pending } = useFormStatus();
    const text = isOtpStep ? 'Verify OTP' : 'Create an account';
    const pendingText = isOtpStep ? 'Verifying...' : 'Creating...';
    return <Button className="w-full" type="submit" disabled={pending}>{pending ? pendingText : text}</Button>;
}

export default function RegisterPage() {
    const router = useRouter();
    const initialState: RegisterState = { message: '', success: false, isOtpStep: false };
    const [state, formAction] = useFormState(register, initialState);

    useEffect(() => {
        if (state.success && !state.isOtpStep) {
            // After successful OTP verification, redirect immediately.
            router.push('/login');
        }
    }, [state.success, state.isOtpStep, router]);

    return (
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <CardTitle className="text-xl">Sign Up</CardTitle>
                <CardDescription>
                    {state.isOtpStep ? "Enter the OTP sent to your email." : "Enter your information to create an account."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {/* Error/Info Message */}
                    {state?.message && (
                         <Alert variant={state.success ? 'default' : 'destructive'}>
                            {state.success ? <Terminal className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>{state.success ? 'Heads Up!' : 'Error'}</AlertTitle>
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    
                    {state.isOtpStep ? (
                        <>
                            <input type="hidden" name="verification_email" value={state.email || ''} />
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input id="otp" name="otp" type="text" required autoComplete="one-time-code" />
                                {state.errors?.otp && <p className="text-sm text-destructive">{state.errors.otp[0]}</p>}
                            </div>
                        </>
                    ) : (
                        <>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" name="firstName" required />
                                    {state.errors?.firstName && <p className="text-sm text-destructive">{state.errors.firstName[0]}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" name="lastName" required />
                                    {state.errors?.lastName && <p className="text-sm text-destructive">{state.errors.lastName[0]}</p>}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                                {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" type="tel" required />
                                {state.errors?.phoneNumber && <p className="text-sm text-destructive">{state.errors.phoneNumber[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                                {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required />
                                {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>}
                            </div>
                        </>
                    )}

                    <SubmitButton isOtpStep={state.isOtpStep} />
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
