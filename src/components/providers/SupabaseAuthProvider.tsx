'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext<{ user: User | null; session: Session | null }>({ user: null, session: null })

export const useAuth = () => useContext(AuthContext)

export function SupabaseAuthProvider({ children, initialSession }: { children: React.ReactNode, initialSession: Session | null }) {
 const [session, setSession] = useState<Session | null>(initialSession)
 const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
 const router = useRouter()

 useEffect(() => {
 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 setSession(session)
 setUser(session?.user ?? null)

 if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
 router.refresh()
 }
 })

 return () => subscription.unsubscribe()
 }, [router])

 return <AuthContext.Provider value={{ user, session }}>{children}</AuthContext.Provider>
}