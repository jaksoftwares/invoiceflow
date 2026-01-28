import type { Metadata } from 'next';
import LandingPageLayout from '@/components/landing/LandingPageLayout'
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import ScreenshotsSection from '@/components/landing/ScreenshotsSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';


export const metadata: Metadata = {
  title: 'Invoiceflow - Business Invoice Creation, Tracking & Management',
  description: 'Streamline your invoicing process with Invoiceflow. Create, track, and manage invoices effortlessly. Perfect for businesses and freelancers.',
  keywords: 'invoice, invoicing, business, management, tracking, creation, freelancers, automation',
  openGraph: {
    title: 'Invoiceflow - Simplify Your Invoicing',
    description: 'Professional invoice management tool for modern businesses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoiceflow - Invoice Management Made Easy',
    description: 'Create, track, and manage invoices with ease.',
  },
};

export default function LandingPage() {
  return (
    <LandingPageLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <ScreenshotsSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
    </LandingPageLayout>
  );
}