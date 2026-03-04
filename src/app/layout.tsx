import type { Metadata } from 'next';
import '../styles/index.css';
import { SupabaseAuthProvider } from '../components/providers/SupabaseAuthProvider';
import { SettingsProvider } from '../components/providers/SettingsProvider';
import { ToastProvider } from '../components/providers/ToastProvider';
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

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <SupabaseAuthProvider initialSession={session}>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </SupabaseAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
