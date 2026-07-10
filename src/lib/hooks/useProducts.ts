import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

interface UseProductsOptions {
 autoFetch?: boolean;
}

interface UseProductsReturn {
 products: Product[];
 loading: boolean;
 error: string | null;
 refetch: () => Promise<void>;
 createProduct: (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Product | null>;
 updateProduct: (id: string, productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Product | null>;
 deleteProduct: (id: string) => Promise<boolean>;
 getProduct: (id: string) => Promise<Product | null>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
 const { autoFetch = true } = options;

 const [products, setProducts] = useState<Product[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const fetchProducts = useCallback(async () => {
 setLoading(true);
 setError(null);

 try {
 const response = await fetch('/api/products');

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to fetch products');
 }

 const data = await response.json();
 setProducts(data.products || []);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'An error occurred');
 setProducts([]);
 } finally {
 setLoading(false);
 }
 }, []);

 const refetch = useCallback(async () => {
 await fetchProducts();
 }, [fetchProducts]);

 const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
 try {
 const response = await fetch('/api/products', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(productData),
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to create product');
 }

 const newProduct = await response.json();
 setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
 toast.success('Product created successfully');
 return newProduct;
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
 toast.error(errorMessage);
 return null;
 }
 }, []);

 const updateProduct = useCallback(async (id: string, productData: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Product | null> => {
 try {
 const response = await fetch(`/api/products/${id}`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(productData),
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to update product');
 }

 const updatedProduct = await response.json();
 setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p).sort((a, b) => a.name.localeCompare(b.name)));
 toast.success('Product updated successfully');
 return updatedProduct;
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
 toast.error(errorMessage);
 return null;
 }
 }, []);

 const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
 try {
 const response = await fetch(`/api/products/${id}`, {
 method: 'DELETE',
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.error || 'Failed to delete product');
 }

 setProducts(prev => prev.filter(p => p.id !== id));
 toast.success('Product deleted successfully');
 return true;
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
 toast.error(errorMessage);
 return false;
 }
 }, []);

 const getProduct = useCallback(async (id: string): Promise<Product | null> => {
 try {
 const response = await fetch(`/api/products/${id}`);
 if (!response.ok) throw new Error('Failed to fetch product');
 return await response.json();
 } catch (err) {
 return null;
 }
 }, []);

 useEffect(() => {
 if (autoFetch) {
 fetchProducts();
 }
 }, [fetchProducts, autoFetch]);

 return {
 products,
 loading,
 error,
 refetch,
 createProduct,
 updateProduct,
 deleteProduct,
 getProduct,
 };
}
