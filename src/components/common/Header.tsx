'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
}

interface HeaderProps {
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'HomeIcon' },
    { label: 'Invoices', path: '/invoice-management', icon: 'DocumentTextIcon' },
    { label: 'Clients', path: '/client-management', icon: 'UsersIcon' },
    { label: 'Reports', path: '/reports-analytics', icon: 'ChartBarIcon' },
  ];

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActivePath = (path: string) => {
    if (path === '/invoice-management') {
      return pathname === path || pathname === '/create-invoice';
    }
    return pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-card shadow-elevation-2">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="text-xl font-heading font-semibold text-foreground hidden sm:block">
              InvoiceFlow
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActivePath(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted hover:-translate-y-[1px]'
                }`}
              >
                <Icon name={item.icon as any} size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/create-invoice"
            className="hidden sm:flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 active:scale-[0.97]"
          >
            <Icon name="PlusIcon" size={20} />
            <span>New Invoice</span>
          </Link>

          <div className="relative">
            <button
              onClick={handleUserMenuToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-smooth hover:bg-muted"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Icon name="UserIcon" size={18} className="text-primary-foreground" />
              </div>
              <Icon
                name="ChevronDownIcon"
                size={16}
                className={`hidden sm:block text-foreground transition-smooth ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[1100]"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover rounded-md shadow-elevation-3 py-2 z-[1200] animate-scale-in">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">Business Owner</p>
                    <p className="text-xs text-muted-foreground mt-1">owner@invoiceflow.com</p>
                  </div>
                  <Link
                    href="/user-profile-settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Icon name="CogIcon" size={18} />
                    <span>Settings</span>
                  </Link>
                  <button
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth w-full"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleMobileMenuToggle}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-smooth"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;