import type { Metadata } from 'next';
import '../styles/index.css';
import { SupabaseAuthProvider } from '../components/providers/SupabaseAuthProvider';
import { SettingsProvider } from '../components/providers/SettingsProvider';
import { ToastProvider } from '../components/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Invoice Flow | Professional Invoice Management',
  description: 'Streamline your business with Invoice Flow. Manage clients, products, and invoices with ease in our modern dashboard.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <SupabaseAuthProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </SupabaseAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
