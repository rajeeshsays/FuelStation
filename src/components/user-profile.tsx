
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/logout-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';

interface UserProfileProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const { firstName, lastName, email } = user;

  return (
    <Popover>
      <PopoverTrigger asChild className="cursor-pointer w-full">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-sidebar-accent">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center overflow-hidden">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                <span className="text-lg">👤</span>
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-medium text-sm truncate">{firstName} {lastName}</span>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" side="top" align="start">
        <div className="p-2">
          <div className="font-semibold">{firstName} {lastName}</div>
          <div className="text-sm text-muted-foreground">{email}</div>
        </div>
        <Separator className="my-1" />
        <ThemeToggle />
        <LogoutButton />
      </PopoverContent>
    </Popover>
  );
}
