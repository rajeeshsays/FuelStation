import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://media.istockphoto.com/id/2181927826/photo/gasoline-pump-nozzle-sign-fuel-pump-petrol-station-oil-and-gas-station-at-sunrise-and-orange.jpg?s=2048x2048&w=is&k=20&c=KRVb0e1BrvUSMEP-0tPgtVJ2j7j25m8Z_gsnoRTyWuI="
          alt="Fuel pump nozzle at sunrise"
          fill
          data-ai-hint="fuel nozzle"
          className="object-cover blur-sm brightness-75 dark:brightness-50"
        />
      </div>
      {/* The children (login/register pages) already have their own Card component with max-width and styling */}
      {children}
    </div>
  );
}
