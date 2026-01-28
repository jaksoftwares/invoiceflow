'use client'

import Header from '@/components/common/Header'
import FooterSection from '@/components/landing/FooterSection'
import { useAuth } from '@/components/providers/SupabaseAuthProvider'

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <FooterSection />
    </div>
  )
}
