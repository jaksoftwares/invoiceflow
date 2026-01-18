'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
    { label: 'Invoice Management', path: '/invoice-management', icon: 'DocumentTextIcon' },
    { label: 'Create Invoice', path: '/create-invoice', icon: 'PlusCircleIcon' },
    { label: 'Client Management', path: '/client-management', icon: 'UsersIcon' },
    { label: 'Reports & Analytics', path: '/reports-analytics', icon: 'ChartBarIcon' },
    { label: 'Settings', path: '/user-profile-settings', icon: 'CogIcon' },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isActivePath = (path: string) => pathname === path;

  return (
    <>
      <div
        className="fixed inset-0 bg-background z-[1100] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-16 right-0 bottom-0 w-full max-w-sm bg-card z-[1200] lg:hidden shadow-elevation-4 ${
          isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'
        }`}
      >
        <nav className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-smooth ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item.icon as any} size={24} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto p-6 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Icon name="UserIcon" size={20} className="text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Business Owner</p>
                <p className="text-xs text-muted-foreground">owner@invoiceflow.com</p>
              </div>
            </div>
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-muted transition-smooth w-full"
              onClick={() => {
                onClose();
              }}
            >
              <Icon name="ArrowRightOnRectangleIcon" size={24} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;