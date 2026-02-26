import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import ProductManagementInteractive from './components/ProductManagementInteractive';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types/database';

export const metadata: Metadata = {
  title: 'Product & Service Management - InvoiceFlow',
  description: 'Manage your products and services for quick invoice generation and inventory tracking.',
};

async function getInitialProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch initial products:', error);
    return [];
  }

  return products || [];
}

export default async function ProductManagementPage() {
  const initialProducts = await getInitialProducts();

  return (
    <NavigationWrapper>
      <ProductManagementInteractive initialProducts={initialProducts} />
    </NavigationWrapper>
  );
}
