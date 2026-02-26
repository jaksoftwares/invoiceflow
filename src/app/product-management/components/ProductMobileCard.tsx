'use client';

import Icon from '@/components/ui/AppIcon';
import type { Product } from '@/types/database';

interface ProductMobileCardProps {
  product: Product;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductMobileCard = ({ product, currency, onEdit, onDelete }: ProductMobileCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-1 p-4 border border-border">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-foreground">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category || 'Uncategorized'}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-foreground">
            {formatPrice(Number(product.price))}
          </div>
          <div className="text-xs text-muted-foreground">per {product.unit}</div>
        </div>
      </div>
      
      {product.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic">
          {product.description}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-accent transition-smooth"
        >
          <Icon name="PencilSquareIcon" size={16} />
          <span>Edit</span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive transition-smooth"
        >
          <Icon name="TrashIcon" size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ProductMobileCard;
