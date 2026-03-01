'use client';

import { useState } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';
import DashboardFooter from './DashboardFooter';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header isOpen={isMobileMenuOpen} onMobileMenuToggle={setIsMobileMenuOpen} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="pt-16 min-h-screen bg-background flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
        <DashboardFooter />
      </div>
    </>
  );
};

export default NavigationWrapper;