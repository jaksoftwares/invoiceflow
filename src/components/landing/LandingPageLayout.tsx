'use client'

import { useState } from 'react'
import Header from '@/components/common/Header'
import MobileMenu from '@/components/common/MobileMenu'
import FooterSection from '@/components/landing/FooterSection'
import { useAuth } from '@/components/providers/SupabaseAuthProvider'

export default function LandingPageLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const { user } = useAuth()
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

 return (
 <div className="flex flex-col min-h-screen bg-background">
 <Header isOpen={isMobileMenuOpen} onMobileMenuToggle={setIsMobileMenuOpen} />
 <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
 <main className="flex-grow pt-16">
 {children}
 </main>
 <FooterSection />
 </div>
 )
}
