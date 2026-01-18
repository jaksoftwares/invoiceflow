'use client';

import { useState } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Header onMobileMenuToggle={setIsMobileMenuOpen} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="pt-16">
        {children}
      </div>
    </>
  );
};

export default NavigationWrapper;