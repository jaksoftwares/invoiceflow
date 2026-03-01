'use client'

import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Brand Logo and Text in Top Left */}
      <div className="fixed top-8 left-8 z-[100]">
        <Link href="/" className="flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div className="relative w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 overflow-hidden">
             <Image 
                src="/assets/logo.png" 
                alt="InvoiceFlow Logo" 
                width={28} 
                height={28}
                className="object-contain"
                priority
             />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            InvoiceFlow
          </span>
        </Link>
      </div>
      
      {/* Auth Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
