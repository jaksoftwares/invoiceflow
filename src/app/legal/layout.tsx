import LandingPageLayout from '@/components/landing/LandingPageLayout';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingPageLayout>
      <div className="bg-slate-50 min-h-screen py-24">
        {children}
      </div>
    </LandingPageLayout>
  );
}
