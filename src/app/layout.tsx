import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/index.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
import { SupabaseAuthProvider } from '../components/providers/SupabaseAuthProvider';
import { SettingsProvider } from '../components/providers/SettingsProvider';
import { ToastProvider } from '../components/providers/ToastProvider';
import NextTopLoader from 'nextjs-toploader';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
 title: 'Invoice Flow | Professional Invoice Management',
 description: 'Streamline your business with Invoice Flow. Manage clients, products, and invoices with ease in our modern dashboard.',
 icons: {
 icon: '/favicon.ico',
 apple: '/apple-icon.png',
 },
};

export default async function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const cookieStore = cookies();
 
 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 getAll: () => cookieStore.getAll(),
 },
 }
 );

 const { data: { session } } = await supabase.auth.getSession();
 const { data: { user } } = await supabase.auth.getUser();
 
 // Only pass the session down if it is cryptographically verified by the server
 const safeSession = user ? session : null;

 return (
 <html lang="en" className={`${inter.variable} font-sans`}>
 <body className="font-sans antialiased">
 <NextTopLoader color="#1E3A5F" showSpinner={false} height={3} />
 <ToastProvider>
 <SupabaseAuthProvider initialSession={safeSession}>
 <SettingsProvider>
 {children}
 </SettingsProvider>
 </SupabaseAuthProvider>
 </ToastProvider>
 </body>
 </html>
 );
}
