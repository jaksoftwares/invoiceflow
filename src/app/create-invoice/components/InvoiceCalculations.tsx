'use client';

import type { InvoiceItem } from '@/types/database';

interface InvoiceCalculationsProps {
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  currency: string;
  onTaxRateChange: (rate: number) => void;
  onDiscountChange: (discount: number) => void;
  onCurrencyChange: (currency: string) => void;
}

const InvoiceCalculations = ({
  items,
  taxRate,
  discount,
  currency,
  onTaxRateChange,
  onDiscountChange,
  onCurrencyChange,
}: InvoiceCalculationsProps) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="currency" className="block text-sm font-medium text-foreground">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name} ({curr.code})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="discount" className="block text-sm font-medium text-foreground">
            Discount (%)
          </label>
          <input
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="taxRate" className="block text-sm font-medium text-foreground">
            Tax Rate (%)
          </label>
          <input
            id="taxRate"
            type="number"
            value={taxRate}
            onChange={(e) => onTaxRateChange(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          />
        </div>
      </div>

      <div className="bg-muted rounded-md p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Subtotal:</span>
          <span className="text-sm font-medium text-foreground data-text">{formatCurrency(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Discount ({discount}%):</span>
            <span className="text-sm font-medium text-success data-text">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Tax ({taxRate}%):</span>
            <span className="text-sm font-medium text-foreground data-text">{formatCurrency(taxAmount)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-lg font-heading font-semibold text-foreground">Total:</span>
            <span className="text-2xl font-heading font-bold text-primary data-text">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCalculations;