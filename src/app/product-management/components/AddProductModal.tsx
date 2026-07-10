'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Product } from '@/types/database';

interface AddProductModalProps {
 isOpen: boolean;
 currency: string;
 onClose: () => void;
 onSubmit: (data: any) => Promise<void>;
 initialData?: Product;
}

const AddProductModal = ({ isOpen, currency, onClose, onSubmit, initialData }: AddProductModalProps) => {
 const [formData, setFormData] = useState({
 name: '',
 description: '',
 price: 0,
 unit: 'item',
 category: '',
 });
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 if (initialData) {
 setFormData({
 name: initialData.name,
 description: initialData.description || '',
 price: Number(initialData.price),
 unit: initialData.unit,
 category: initialData.category || '',
 });
 } else {
 setFormData({
 name: '',
 description: '',
 price: 0,
 unit: 'item',
 category: '',
 });
 }
 }, [initialData, isOpen]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: name === 'price' ? parseFloat(value) || 0 : value
 }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 await onSubmit(formData);
 onClose();
 } catch (error) {
 console.error(error);
 } finally {
 setIsSubmitting(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
 <div className="relative bg-card w-full max-w-lg rounded-xl shadow-elevation-3 border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
 <div className="flex items-center justify-between p-6 border-b border-border">
 <h2 className="text-xl font-semibold text-foreground">
 {initialData ? 'Edit Item' : 'Add New Item'}
 </h2>
 <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-smooth">
 <Icon name="XMarkIcon" size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Name *</label>
 <input
 required
 name="name"
 value={formData.name}
 onChange={handleChange}
 placeholder="e.g. Web Design Service, Laptop Stand"
 className="w-full px-4 py-2 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Price ({currency}) *</label>
 <div className="relative">
 <input
 required
 type="number"
 step="0.01"
 name="price"
 value={formData.price}
 onChange={handleChange}
 className="w-full px-4 py-2 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Unit</label>
 <input
 name="unit"
 value={formData.unit}
 onChange={handleChange}
 placeholder="e.g. item, hour, day"
 className="w-full px-4 py-2 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Category</label>
 <input
 name="category"
 value={formData.category}
 onChange={handleChange}
 placeholder="e.g. Services, Hardware"
 className="w-full px-4 py-2 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground">Description</label>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleChange}
 rows={3}
 placeholder="Detailed description of the product or service..."
 className="w-full px-4 py-2 bg-muted border-none rounded-md focus:ring-2 focus:ring-accent transition-smooth resize-none"
 />
 </div>

 <div className="pt-4 flex gap-3">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 px-4 py-2.5 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-smooth"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-md font-medium hover:brightness-110 disabled:opacity-50 transition-smooth shadow-elevation-1"
 >
 {isSubmitting ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default AddProductModal;
