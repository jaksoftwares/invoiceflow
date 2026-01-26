'use client';

import { useState, useEffect } from 'react';
import type { Client, InvoiceItem } from '@/types/database';

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
}

interface InvoicePreviewProps {
  client: Client | null;
  details: InvoiceDetails;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  currency: string;
  notes: string;
  terms: string;
  selectedTemplate: string;
}

const InvoicePreview = ({
  client,
  details,
  items,
  taxRate,
  discount,
  currency,
  notes,
  terms,
  selectedTemplate,
}: InvoicePreviewProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  const formatDate = (dateString: string) => {
    if (!dateString || !isHydrated) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTemplateStyles = () => {
    switch (selectedTemplate) {
      case 'modern':
        return {
          headerBg: 'bg-gradient-to-r from-primary to-secondary',
          accentColor: 'text-accent',
          borderColor: 'border-accent',
        };
      case 'classic':
        return {
          headerBg: 'bg-foreground',
          accentColor: 'text-primary',
          borderColor: 'border-primary',
        };
      case 'minimal':
        return {
          headerBg: 'bg-muted',
          accentColor: 'text-secondary',
          borderColor: 'border-secondary',
        };
      default:
        return {
          headerBg: 'bg-primary',
          accentColor: 'text-accent',
          borderColor: 'border-primary',
        };
    }
  };

  const templateStyles = getTemplateStyles();

  if (!isHydrated) {
    return (
      <div className="bg-card border border-border rounded-md p-6 lg:p-8">
        <div className="space-y-4">
          <div className="h-24 bg-muted rounded-md animate-pulse" />
          <div className="h-32 bg-muted rounded-md animate-pulse" />
          <div className="h-48 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden shadow-elevation-2">
      <div className={`${templateStyles.headerBg} px-6 lg:px-8 py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="white" fillOpacity="0.2" />
              <path
                d="M14 24L19 19L24 24L29 19L34 24"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 31H34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">InvoiceFlow</h2>
              <p className="text-sm text-white/80">Professional Invoicing</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-heading font-bold text-white">INVOICE</p>
            <p className="text-sm text-white/80 mt-1 data-text">{details.invoiceNumber || 'INV-XXXXX'}</p>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">From</h3>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">InvoiceFlow Inc.</p>
              <p className="text-sm text-muted-foreground">123 Business Street</p>
              <p className="text-sm text-muted-foreground">New York, NY 10001</p>
              <p className="text-sm text-muted-foreground">contact@invoiceflow.com</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Bill To</h3>
            {client ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.company}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No client selected</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Issue Date</p>
            <p className="text-sm font-medium text-foreground">{formatDate(details.issueDate) || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Due Date</p>
            <p className="text-sm font-medium text-foreground">{formatDate(details.dueDate) || 'Not set'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Payment Terms</p>
            <p className="text-sm font-medium text-foreground">
              {details.paymentTerms ? details.paymentTerms.replace('_', ' ').toUpperCase() : 'Not set'}
            </p>
          </div>
        </div>

        <div>
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 ${templateStyles.borderColor}`}>
                <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">
                  Qty
                </th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                  Rate
                </th>
                <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-3 text-sm text-foreground">{item.description || 'Untitled item'}</td>
                    <td className="py-3 text-sm text-right text-foreground data-text">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-foreground data-text">{formatCurrency(item.rate)}</td>
                    <td className="py-3 text-sm text-right font-medium text-foreground data-text">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground italic">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Subtotal:</span>
              <span className="text-sm font-medium text-foreground data-text">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Discount ({discount}%):</span>
                <span className="text-sm font-medium text-success data-text">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Tax ({taxRate}%):</span>
                <span className="text-sm font-medium text-foreground data-text">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className={`flex items-center justify-between py-3 border-t-2 ${templateStyles.borderColor}`}>
              <span className="text-lg font-heading font-semibold text-foreground">Total:</span>
              <span className={`text-2xl font-heading font-bold ${templateStyles.accentColor} data-text`}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
          </div>
        )}

        {terms && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Terms & Conditions</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{terms}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;