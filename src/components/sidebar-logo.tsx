
'use client';

import Image from 'next/image';
import { useState } from 'react';

export function SidebarLogo() {
  const [error, setError] = useState(false);

  // If the logo fails to load (e.g., doesn't exist at /logo.png),
  // this component will render the fallback "O" icon.
  if (error) {
    return (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            O
        </div>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Ceypetco Logo"
      width={32}
      height={32}
      className="w-8 h-8 object-contain"
      onError={() => setError(true)}
      priority // Preload the logo as it's important for the layout
    />
  );
}
