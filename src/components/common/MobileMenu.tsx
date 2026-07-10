'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';
import { useSettings } from '@/lib/hooks/useSettings';
import { useLogout } from '@/lib/hooks/useLogout';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { MAIN_NAVIGATION, MOBILE_QUICK_ACTIONS, LANDING_NAVIGATION } from '@/lib/constants/navigation';

interface MobileMenuProps {
 isOpen: boolean;
 onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
 const pathname = usePathname();
 const router = useRouter();
 const { user } = useAuth();
 const { profile } = useSettings();

 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => { document.body.style.overflow = 'unset'; };
 }, [isOpen]);

 const { logout, loading: isLoggingOut } = useLogout({
   onSuccess: () => onClose()
 });

 const handleLogout = async () => {
   await logout();
 };

 const isActive = (path: string) => pathname === path;

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[1000] lg:hidden">
 {/* Glasmorphism Backdrop */}
 <div 
 className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
 onClick={onClose}
 />
 
 {/* Side Drawer */}
 <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
 {/* Drawer Header */}
 <div className="p-6 flex items-center justify-between border-b border-border/50">
 <div className="flex items-center gap-3">
 <img src="/assets/logo.png" alt="InvoiceFlow" className="h-8 w-auto" />
 <span className="font-bold text-lg tracking-tight">InvoiceFlow</span>
 </div>
 <button onClick={onClose} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-all">
 <Icon name="XMarkIcon" size={24} />
 </button>
 </div>

 {/* User Info Section */}
 {user && (
 <div className="p-6 bg-muted/20">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-white/50 flex items-center justify-center overflow-hidden shadow-sm">
 {profile?.avatar_url ? (
 <Image src={profile.avatar_url} alt="Profile" width={56} height={56} className="w-full h-full object-cover" />
 ) : (
 <span className="text-xl font-bold text-primary">
 {profile?.first_name?.[0]?.toUpperCase() || 'U'}
 </span>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-base font-bold text-foreground truncate">
 {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Business Owner'}
 </p>
 <p className="text-xs text-muted-foreground truncate font-medium">{user?.email}</p>
 </div>
 </div>
 </div>
 )}

 {/* Navigation Section */}
 <nav className="flex-1 overflow-y-auto p-4 space-y-1">
 {user ? (
 <>
 <div className="px-3 mb-2">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Main Navigation</p>
 </div>
 
 {MAIN_NAVIGATION.map((item) => (
 <Link
 key={item.path}
 href={item.path}
 onClick={onClose}
 className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${
 isActive(item.path)
 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
 : 'text-muted-foreground hover:bg-muted hover:text-foreground'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive(item.path) ? 'bg-white/20' : 'bg-muted/50'}`}>
 <Icon name={item.icon as any} size={20} />
 </div>
 <div className="flex-1">
 <span>{item.label}</span>
 </div>
 </Link>
 ))}

 <div className="pt-4 px-3 mb-2">
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
 </div>
 
 {MOBILE_QUICK_ACTIONS.map((item) => (
 <Link
 key={item.path}
 href={item.path}
 onClick={onClose}
 className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold bg-accent/5 text-accent border border-accent/10 hover:bg-accent/10 transition-all"
 >
 <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
 <Icon name={item.icon as any} size={20} />
 </div>
 <span>{item.label}</span>
 </Link>
 ))}
 </>
 ) : (
 <>
 {LANDING_NAVIGATION.map((item) => (
 <Link
 key={item.path}
 href={`/${item.path}`}
 onClick={onClose}
 className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
 >
 <div className="flex-1">
 <span>{item.label}</span>
 </div>
 </Link>
 ))}
 </>
 )}
 </nav>

 {/* Drawer Footer */}
 <div className="p-4 border-t border-border/50">
 {user ? (
 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-base font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all active:scale-[0.98]"
 >
 <Icon name="ArrowRightOnRectangleIcon" size={24} />
 <span>Sign Out</span>
 </button>
 ) : (
 <div className="flex flex-col gap-3">
 <Link href="/auth/login" onClick={onClose} className="w-full py-3 text-center rounded-xl font-bold bg-background border border-border shadow-sm hover:bg-muted transition-all text-foreground">Login</Link>
 <Link href="/auth/signup" onClick={onClose} className="w-full py-3 text-center rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">Get Started</Link>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default MobileMenu;
