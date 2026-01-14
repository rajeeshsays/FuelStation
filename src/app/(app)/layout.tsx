
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Nav } from '@/components/nav';
import { SidebarLogo } from '@/components/sidebar-logo';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { UserProfile } from '@/components/user-profile';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:justify-center">
            <SidebarLogo />
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-lg">FMS</span>
                <span className="text-sm text-muted-foreground">Fuel Manager</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Nav />
        </SidebarContent>
        <SidebarFooter>
           <UserProfile
              user={{
                firstName: session.firstName || 'User',
                lastName: session.lastName || '',
                email: session.email,
              }}
            />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:border-none">
            <SidebarTrigger className="md:hidden"/>
            <div>{/* Header actions can go here */}</div>
        </header>
        <main className="flex-1 p-4">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
