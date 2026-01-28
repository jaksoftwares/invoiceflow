'use client';

import { useState } from 'react';
import Header from './Header';
import MobileMenu from './MobileMenu';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const NavigationWrapper = ({ children }: NavigationWrapperProps) => {
  return (
    <>
      {children}
    </>
  );
};

export default NavigationWrapper;