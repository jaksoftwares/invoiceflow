'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';
import { useSettings } from '@/lib/hooks/useSettings';
import { useLogout } from '@/lib/hooks/useLogout';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { MAIN_NAVIGATION, LANDING_NAVIGATION } from '@/lib/constants/navigation';

interface HeaderProps {
 isOpen?: boolean;
 onMobileMenuToggle?: (isOpen: boolean) => void;
}

const Header = ({ isOpen: propIsOpen, onMobileMenuToggle }: HeaderProps) => {
 const pathname = usePathname();
 const router = useRouter();
 const { user } = useAuth();
 const { profile, loading } = useSettings();
 const [isScrolled, setIsScrolled] = useState(false);
 const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
 const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] = useState(false);

 // Use prop if provided, otherwise use internal state
 const isMobileMenuOpen = propIsOpen !== undefined ? propIsOpen : internalIsMobileMenuOpen;

 useEffect(() => {
 const handleScroll = () => {
 setIsScrolled(window.scrollY > 10);
 };
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const handleMobileMenuToggle = () => {
 const newState = !isMobileMenuOpen;
 setInternalIsMobileMenuOpen(newState);
 onMobileMenuToggle?.(newState);
 };

 const { logout, loading: isLoggingOut } = useLogout({
    onSuccess: () => setIsUserMenuOpen(false)
  });

  const handleLogout = async () => {
    await logout();
  };

 const isActivePath = (path: string) => {
 if (path === '/invoice-management') {
 return pathname === path || pathname === '/create-invoice';
 }
 return pathname === path;
 };

 const Logo = () => (
 <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
 <img src="/assets/logo.png" alt="InvoiceFlow" className="h-8 w-auto" />
 <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
 InvoiceFlow
 </span>
 </Link>
 );

 if (!user) {
 return (
 <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-card/80 backdrop-blur-md border-b border-border shadow-sm py-2' : 'bg-transparent py-4'}`}>
 <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
 <Logo />
 
 <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
 {LANDING_NAVIGATION.map((item) => (
 <Link
 key={item.path}
 href={`/${item.path}`}
 className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
 >
 <span>{item.label}</span>
 </Link>
 ))}
 </nav>
 <div className="flex items-center gap-4">
 <Link href="/auth/login" className="hidden sm:block px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-smooth">
 Login
 </Link>
 <Link href="/auth/signup" className="hidden sm:block px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] transition-smooth">
 Get Started
 </Link>
 <button
 onClick={handleMobileMenuToggle}
 className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-divider transition-all ${isMobileMenuOpen ? 'bg-primary text-white' : 'bg-muted/50 text-foreground hover:bg-muted'}`}
 >
 <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
 </button>
 </div>
 </div>
 </header>
 );
 }

 return (
 <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-card/90 backdrop-blur-lg border-b border-border py-2' : 'bg-card border-b border-border py-3'}`}>
 <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 relative">
 <Logo />
 
 <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 overflow-x-auto no-scrollbar mask-edges">
 {MAIN_NAVIGATION.map((item) => (
 <Link
 key={item.path}
 href={item.path}
 className={`flex items-center justify-center lg:px-4 lg:py-2 rounded-xl text-sm font-bold transition-smooth ${
 isActivePath(item.path)
 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
 : 'text-muted-foreground hover:bg-muted hover:text-foreground'
 }`}
 title={item.label}
 >
 <span className="whitespace-nowrap">{item.label}</span>
 </Link>
 ))}
 </nav>

 <div className="flex items-center gap-2 sm:gap-4">
 <div className="relative">
 <button
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 className="group flex items-center gap-2 p-1 rounded-2xl bg-muted/50 border border-transparent hover:border-border hover:bg-muted transition-all"
 >
 <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
 {profile?.avatar_url ? (
 <Image src={profile.avatar_url} alt="Profile" width={36} height={36} className="w-full h-full object-cover" />
 ) : (
 <span className="text-sm font-bold text-primary">
 {profile?.first_name?.[0]?.toUpperCase() || 'U'}
 </span>
 )}
 </div>
 <Icon name="ChevronDownIcon" size={14} className={`text-muted-foreground transition-transform duration-300 mr-1 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
 </button>

 {isUserMenuOpen && (
 <>
 <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserMenuOpen(false)} />
 <div className="absolute right-0 top-full mt-3 w-64 bg-card border border-border/60 rounded-2xl shadow-elevation-4 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden">
 <div className="px-4 py-3 bg-muted/30 border-b border-border/40">
 <p className="text-sm font-bold text-foreground truncate">{profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Business Owner'}</p>
 <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
 </div>
 <div className="p-1">
 <Link
 href="/user-profile-settings"
 className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-smooth"
 onClick={() => setIsUserMenuOpen(false)}
 >
 <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
 <Icon name="UserCircleIcon" size={18} />
 </div>
 <span>Profile Settings</span>
 </Link>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/5 rounded-xl transition-smooth"
 >
 <div className="w-8 h-8 rounded-lg bg-destructive/5 flex items-center justify-center text-destructive">
 <Icon name="ArrowRightOnRectangleIcon" size={18} />
 </div>
 <span>Sign Out</span>
 </button>
 </div>
 </div>
 </>
 )}
 </div>
 
 <button
 onClick={handleMobileMenuToggle}
 className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-border shadow-sm transition-all ${isMobileMenuOpen ? 'bg-primary text-white border-primary' : 'bg-card text-foreground hover:bg-muted'}`}
 >
 <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
 </button>
 </div>
 </div>
 </header>
 );
};
export default Header;
