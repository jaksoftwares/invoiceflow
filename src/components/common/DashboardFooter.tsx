'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardFooter() {
 const pathname = usePathname();

 // Only show on dashboard pages (not on auth pages)
 const isAuthPage = pathname.startsWith('/auth');
 if (isAuthPage) return null;

 return (
 <footer className="bg-card border-t border-border mt-auto">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-2">
 <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
 <rect width="40" height="40" rx="8" fill="var(--color-primary)" />
 <path
 d="M12 20L16 16L20 20L24 16L28 20"
 stroke="var(--color-primary-foreground)"
 strokeWidth="2.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 <path
 d="M12 26H28"
 stroke="var(--color-accent)"
 strokeWidth="2.5"
 strokeLinecap="round"
 />
 </svg>
 <span className="text-sm text-muted-foreground">
 © {new Date().getFullYear()} InvoiceFlow
 </span>
 </div>

 <nav className="flex items-center gap-6">
 <Link
 href="/user-profile-settings"
 className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
 >
 Settings
 </Link>
 <Link
 href="/auth/login"
 className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
 >
 Help
 </Link>
 <Link
 href="/"
 className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
 >
 Privacy
 </Link>
 </nav>
 </div>
 </div>
 </footer>
 );
}
