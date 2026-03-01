'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProductTableRow from './ProductTableRow';
import ProductMobileCard from './ProductMobileCard';
import AddProductModal from './AddProductModal';
import { useProducts } from '@/lib/hooks/useProducts';
import { useSettings } from '@/lib/hooks/useSettings';
import type { Product } from '@/types/database';

interface ProductManagementInteractiveProps {
  initialProducts?: Product[];
}

const ProductManagementInteractive = ({ initialProducts = [] }: ProductManagementInteractiveProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { settings } = useSettings();
  const currency = settings?.default_currency || 'KES';

  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts({
    autoFetch: true,
  });

  const currentProducts = products.length > 0 ? products : initialProducts;
  const filteredProducts = currentProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = async (productData: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      await createProduct(productData);
    }
    setIsAddModalOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  if (loading && currentProducts.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded-xl w-1/4" />
            <div className="h-20 bg-muted rounded-2xl" />
            <div className="h-[600px] bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tight sm:text-5xl">
              Product Management
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              View and manage your products and services.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-[0.98]"
          >
            <Icon name="PlusIcon" size={20} />
            <span>New Item</span>
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-elevation-1 p-4 mb-6">
          <div className="relative">
            <Icon 
              name="MagnifyingGlassIcon" 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <input
              type="text"
              placeholder="Search products, services, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth"
            />
          </div>
        </div>

        <div className="hidden lg:block bg-card rounded-lg shadow-elevation-1 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <ProductTableRow 
                  key={product.id} 
                  product={product} 
                  currency={currency}
                  onEdit={() => handleEdit(product)}
                  onDelete={() => handleDelete(product.id)}
                />
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Icon name="ArchiveBoxIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No items found</p>
              <p className="text-sm text-muted-foreground">Try a different search term or add a new item.</p>
            </div>
          )}
        </div>

        <div className="lg:hidden space-y-4">
          {filteredProducts.map((product) => (
            <ProductMobileCard 
              key={product.id} 
              product={product}
              currency={currency}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product.id)}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="bg-card rounded-lg shadow-elevation-1 p-12 text-center">
              <Icon name="ArchiveBoxIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No items found</p>
            </div>
          )}
        </div>

        <AddProductModal
          isOpen={isAddModalOpen}
          currency={currency}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleAddProduct}
          initialData={editingProduct || undefined}
        />
      </div>
    </div>
  );
};

export default ProductManagementInteractive;
