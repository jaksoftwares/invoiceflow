import type { Metadata } from 'next';
import '../styles/index.css';
import { SupabaseAuthProvider } from '../components/providers/SupabaseAuthProvider';
import { ToastProvider } from '../components/providers/ToastProvider';

export const metadata: Metadata = {
  title: 'Invoice Flow',
  description: 'Invoice management dashboard',
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
            {children}
          </SupabaseAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
