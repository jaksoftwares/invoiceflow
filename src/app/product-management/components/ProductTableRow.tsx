'use client';

import Icon from '@/components/ui/AppIcon';
import type { Product } from '@/types/database';

interface ProductTableRowProps {
 product: Product;
 currency: string;
 onEdit: () => void;
 onDelete: () => void;
}

const ProductTableRow = ({ product, currency, onEdit, onDelete }: ProductTableRowProps) => {
 const formatPrice = (price: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency,
 minimumFractionDigits: 2,
 }).format(price);
 };
 return (
 <tr className="hover:bg-muted/50 transition-smooth group">
 <td className="px-6 py-4">
 <div>
 <div className="font-medium text-foreground">{product.name}</div>
 {product.description && (
 <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
 )}
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
 {product.category || 'Uncategorized'}
 </span>
 </td>
 <td className="px-6 py-4 text-sm text-foreground">
 {product.unit}
 </td>
 <td className="px-6 py-4 text-sm font-semibold text-foreground">
 {formatPrice(Number(product.price))}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
 <button
 onClick={onEdit}
 className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-md transition-smooth"
 title="Edit"
 >
 <Icon name="PencilSquareIcon" size={18} />
 </button>
 <button
 onClick={onDelete}
 className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-smooth"
 title="Delete"
 >
 <Icon name="TrashIcon" size={18} />
 </button>
 </div>
 </td>
 </tr>
 );
};

export default ProductTableRow;
