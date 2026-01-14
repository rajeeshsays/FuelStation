
'use client';

import { useFormStatus, useFormState } from 'react-dom';
import { login, type LoginState } from '@/app/(auth)/actions';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <Button className="w-full" type="submit" disabled={pending}>{pending ? "Logging in..." : "Login"}</Button>;
}

export default function LoginPage() {
    const initialState: LoginState = { message: '' };
    const [state, formAction] = useFormState(login, initialState);

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {state?.message && !state.success && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                        {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
                    </div>
                    <SubmitButton />
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="underline">
                        Register
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
