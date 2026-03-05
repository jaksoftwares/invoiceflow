import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicInvoiceUI from './PublicInvoiceUI';

interface PublicInvoicePageProps {
  params: {
    slug: string;
  };
}

export default async function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const supabase = createClient();

  // Use the secure RPC function specifically designed for public access
  const { data: result, error } = await supabase.rpc('get_public_invoice', {
    p_identifier: params.slug
  });

  if (error || !result) {
    console.error('Invoice fetch error:', error);
    notFound();
  }

  return (
    <PublicInvoiceUI 
      invoice={result.invoice}
      businessProfile={result.business}
      client={result.client}
      items={result.items}
    />
  );
}
