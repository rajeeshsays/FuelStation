'use client';

import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
    return (
        <form action={logout}>
            <Button variant="ghost" type="submit" className="w-full justify-start text-sm p-2 h-auto">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
            </Button>
        </form>
    );
}
