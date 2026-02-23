'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Client, InvoiceItem, BusinessProfile } from '@/types/database';

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
}

interface InvoicePreviewProps {
  businessProfile: BusinessProfile | null;
  client: Client | null;
  details: InvoiceDetails;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  currency: string;
  notes: string;
  terms: string;
  selectedTemplate: string;
  fullSize?: boolean;
}

const InvoicePreview = ({
  businessProfile,
  client,
  details,
  items,
  taxRate,
  discount,
  currency,
  notes,
  terms,
  selectedTemplate,
  fullSize = false,
}: InvoicePreviewProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

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
   
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || !isHydrated) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to render business logo or fallback
  const renderLogo = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-12 w-12 text-lg',
      lg: 'h-16 w-16 text-xl',
    };
    
    if (businessProfile?.logo_url) {
      return (
        <img 
          src={businessProfile.logo_url} 
          alt={businessProfile.name || 'Logo'} 
          className={`${sizes[size]} object-contain`}
        />
      );
    }
    
    // Fallback: show company initial
    const initial = businessProfile?.name?.charAt(0)?.toUpperCase() || 'B';
    return (
      <div className={`${sizes[size]} bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center text-white font-bold`}>
        {initial}
      </div>
    );
  };

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

  // ============================================
  // TEMPLATE 1: InvoiceFlow Default (With Branding)
  // ============================================
  const renderDefaultTemplate = () => (
    <div className="bg-white text-slate-800 font-sans relative">
      {/* InvoiceFlow Watermark Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 text-[120px] font-black transform -translate-x-1/2 -translate-y-1/2 rotate-12">
          InvoiceFlow
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-[80px] font-black transform translate-x-1/2 translate-y-1/2 -rotate-12">
          InvoiceFlow
        </div>
      </div>

      {/* Header with InvoiceFlow Branding */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-6 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 2-2V0 0 8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">INVOICE</h1>
              <p className="text-white/70 text-xs">#{details.invoiceNumber || 'INV-000000'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatDate(details.issueDate)}</p>
            <p className="text-white/70 text-xs mt-1">Powered by InvoiceFlow</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 relative">
        {/* From & To */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">From</p>
            {businessProfile ? (
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{businessProfile.name}</p>
                <p className="text-slate-600">{businessProfile.address}</p>
                <p className="text-slate-600">{[businessProfile.city, businessProfile.state, businessProfile.zip_code].filter(Boolean).join(', ')}</p>
                <p className="text-slate-600">{businessProfile.country}</p>
                {businessProfile.email && <p className="text-slate-600">{businessProfile.email}</p>}
                {businessProfile.phone && <p className="text-slate-600">{businessProfile.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No business profile</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bill To</p>
            {client ? (
              <div className="text-sm">
                <p className="font-semibold text-slate-900">{client.company_name}</p>
                <p className="text-slate-600">{client.contact_person}</p>
                <p className="text-slate-600">{client.email}</p>
                <p className="text-slate-600">{client.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No client selected</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-8 py-4 border-y border-slate-200 mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Issue Date</p>
            <p className="text-sm font-medium mt-1">{formatDate(details.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Due Date</p>
            <p className="text-sm font-medium mt-1">{formatDate(details.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Terms</p>
            <p className="text-sm font-medium mt-1">{details.paymentTerms?.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Qty</th>
              <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Rate</th>
              <th className="text-right py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 text-sm text-slate-800">{item.description}</td>
                <td className="py-3 text-sm text-slate-600 text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-slate-600 text-right">{formatNumber(item.rate)}</td>
                <td className="py-3 text-sm font-medium text-slate-900 text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-600">Tax ({taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-emerald-600">
                <span>Discount ({discount}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-primary mt-2">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(notes || terms) && (
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-200">
            {notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Terms & Conditions</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{terms}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with InvoiceFlow Branding */}
      <div className="bg-primary/5 px-8 py-4 text-center border-t border-primary/20">
        <p className="text-xs text-primary font-medium">Generated with InvoiceFlow • Professional Invoicing Solution</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 2: Business Classic (uses business details)
  // ============================================
  const renderProfessionalTemplate = () => (
    <div className="bg-white text-slate-800 font-sans">
      {/* Header with Business Logo */}
      <div className="bg-slate-900 text-white px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {renderLogo('md')}
            <div>
              <h1 className="text-xl font-bold">{businessProfile?.name || 'Your Business'}</h1>
              <p className="text-slate-400 text-xs mt-1">#{details.invoiceNumber || 'INV-000'}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase">Invoice</h2>
            <p className="text-slate-400 text-sm mt-1">{formatDate(details.issueDate)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        {/* Business Info Cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Bill To</p>
            {client ? (
              <div>
                <p className="font-semibold text-slate-900">{client.company_name}</p>
                <p className="text-sm text-slate-600">{client.contact_person}</p>
                <p className="text-sm text-slate-600">{client.email}</p>
                <p className="text-sm text-slate-600">{client.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No client selected</p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Issue Date</span>
              <span className="text-sm font-medium">{formatDate(details.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Due Date</span>
              <span className="text-sm font-medium">{formatDate(details.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Terms</span>
              <span className="text-sm font-medium uppercase">{details.paymentTerms?.replace('_', ' ') || 'Net 30'}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase rounded-tl-lg">Description</th>
              <th className="text-center py-3 px-4 text-xs font-semibold uppercase">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase">Rate</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 px-4 text-sm text-slate-800">{item.description}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-right">{formatNumber(item.rate)}</td>
                <td className="py-3 px-4 text-sm font-medium text-slate-900 text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 bg-slate-900 text-white rounded-lg p-4">
            <div className="flex justify-between py-2 text-sm opacity-80">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm opacity-80">
                <span>Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-green-400">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t border-white/20 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Business Contact Info */}
        {businessProfile && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Business Details</p>
            <div className="flex gap-6 text-sm text-slate-600">
              {businessProfile.email && <span>{businessProfile.email}</span>}
              {businessProfile.phone && <span>{businessProfile.phone}</span>}
              {businessProfile.website && <span>{businessProfile.website}</span>}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-slate-600">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 3: Modern (uses business details + logo)
  // ============================================
  const renderModernTemplate = () => (
    <div className="bg-white text-slate-800 font-sans">
      {/* Header - Left Sidebar Style with Logo */}
      <div className="flex">
        <div className="w-1/3 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6">
          <div className="mb-8">
            {renderLogo('lg')}
          </div>
          
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From</p>
            <p className="font-semibold">{businessProfile?.name || 'Your Business'}</p>
            <p className="text-slate-400 text-sm mt-1">{businessProfile?.address}</p>
            <p className="text-slate-400 text-sm">{businessProfile?.city}, {businessProfile?.country}</p>
            {businessProfile?.email && <p className="text-slate-400 text-sm mt-2">{businessProfile.email}</p>}
            {businessProfile?.phone && <p className="text-slate-400 text-sm">{businessProfile.phone}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
            {client ? (
              <div>
                <p className="font-semibold">{client.company_name}</p>
                <p className="text-slate-400 text-sm">{client.email}</p>
                <p className="text-slate-400 text-sm">{client.address}</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">No client</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-2/3 p-6">
          {/* Invoice Title */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
              <p className="text-slate-500 text-sm mt-1">#{details.invoiceNumber || 'INV-000'}</p>
            </div>
          </div>

          {/* Dates & Amount */}
          <div className="flex justify-between mb-8 pb-8 border-b border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Issue Date</p>
              <p className="font-medium mt-1">{formatDate(details.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Due Date</p>
              <p className="font-medium mt-1">{formatDate(details.dueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase">Amount Due</p>
              <p className="font-bold text-xl mt-1 text-blue-600">{formatCurrency(total)}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-slate-900">
                <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 text-sm">{item.description}</td>
                  <td className="py-3 text-sm text-right text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-sm font-medium text-right">{formatNumber(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-500">Tax ({taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between py-2 text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t border-slate-900 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {terms && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Terms</p>
              <p className="text-sm text-slate-600">{terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 4: Classic Traditional
  // ============================================
  const renderClassicTemplate = () => (
    <div className="bg-white text-slate-800 font-serif">
      {/* Header with Business Details */}
      <div className="px-8 py-8 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            {renderLogo('lg')}
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">{businessProfile?.name || 'Your Company'}</h1>
              <div className="text-sm text-slate-600 mt-2 font-serif">
                <p>{businessProfile?.address}</p>
                <p>{businessProfile?.city}, {businessProfile?.state} {businessProfile?.zip_code}</p>
                <p>{businessProfile?.country}</p>
                {businessProfile?.phone && <p>Tel: {businessProfile.phone}</p>}
                {businessProfile?.email && <p>Email: {businessProfile.email}</p>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold uppercase">Invoice</h2>
            <p className="text-lg mt-2 font-mono">#{details.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        {/* To & Dates */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 font-sans">Bill To</p>
            {client ? (
              <div className="font-serif">
                <p className="font-semibold text-lg">{client.company_name}</p>
                <p className="text-base">{client.contact_person}</p>
                <p className="text-base">{client.email}</p>
                <p className="text-base">{client.address}</p>
              </div>
            ) : (
              <p className="text-base text-slate-400 italic font-sans">No client selected</p>
            )}
          </div>
          <div className="text-right font-sans">
            <p className="text-xs font-semibold text-slate-500 uppercase">Issue Date</p>
            <p className="text-base font-medium">{formatDate(details.issueDate)}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-3">Due Date</p>
            <p className="text-base font-medium">{formatDate(details.dueDate)}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-slate-800 font-sans">
              <th className="text-left py-3 text-xs font-bold uppercase">Description</th>
              <th className="text-right py-3 text-xs font-bold uppercase w-20">Qty</th>
              <th className="text-right py-3 text-xs font-bold uppercase w-28">Rate</th>
              <th className="text-right py-3 text-xs font-bold uppercase w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-3 text-base">{item.description}</td>
                <td className="py-3 text-base text-right">{item.quantity}</td>
                <td className="py-3 text-base text-right">{formatNumber(item.rate)}</td>
                <td className="py-3 text-base font-medium text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 font-sans">
            <div className="flex justify-between py-2 text-base">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-base">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-base text-emerald-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-t-2 border-slate-800 mt-2">
              <span className="font-bold text-lg">Total Due</span>
              <span className="font-bold text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {terms && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 font-sans">Terms & Conditions</p>
            <p className="text-base text-slate-600 font-serif">{terms}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-slate-50 text-center border-t border-slate-200">
        <p className="text-xs text-slate-500 font-sans">Payment is due within the specified terms. Thank you for your business.</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 5: Minimal Simple
  // ============================================
  const renderMinimalTemplate = () => (
    <div className="bg-white text-slate-800 font-sans p-8">
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          {renderLogo('sm')}
          <div>
            <h1 className="text-xl font-bold text-slate-900">INVOICE</h1>
            <p className="text-slate-500 text-sm mt-1">#{details.invoiceNumber || 'INV-000'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">{businessProfile?.name || 'Your Business'}</p>
          <p className="text-slate-500 text-sm">{businessProfile?.email}</p>
          <p className="text-slate-500 text-sm">{businessProfile?.phone}</p>
        </div>
      </div>

      {/* From & To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From</p>
          {businessProfile ? (
            <div className="text-sm">
              <p className="font-medium">{businessProfile.name}</p>
              <p className="text-slate-600">{businessProfile.address}</p>
              <p className="text-slate-600">{businessProfile.email}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No business profile</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
          {client ? (
            <div className="text-sm">
              <p className="font-medium">{client.company_name}</p>
              <p className="text-slate-600">{client.email}</p>
              <p className="text-slate-600">{client.address}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No client selected</p>
          )}
        </div>
      </div>

      {/* Dates & Total */}
      <div className="flex gap-8 mb-6 py-4 bg-slate-50 rounded-lg px-4">
        <div>
          <p className="text-xs text-slate-400 uppercase">Issued</p>
          <p className="text-sm font-medium">{formatDate(details.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase">Due</p>
          <p className="text-sm font-medium text-rose-600">{formatDate(details.dueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase">Amount</p>
          <p className="text-sm font-bold">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Description</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-24">Rate</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-3 text-sm">{item.description}</td>
              <td className="py-3 text-sm text-right text-slate-600">{item.quantity}</td>
              <td className="py-3 text-sm text-right text-slate-600">{formatNumber(item.rate)}</td>
              <td className="py-3 text-sm font-medium text-right">{formatNumber(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-56">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between py-2 text-sm text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-2 border-slate-900 mt-2">
            <span className="font-bold">Total</span>
            <span className="font-bold text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
          <p className="text-sm text-slate-600">{notes}</p>
        </div>
      )}
    </div>
  );

  // ============================================
  // TEMPLATE 6: Executive Premium
  // ============================================
  const renderExecutiveTemplate = () => (
    <div className="bg-slate-50 text-slate-200 font-sans">
      {/* Header with Business Logo */}
      <div className="bg-slate-900 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {renderLogo('lg')}
            <div>
              <h1 className="text-lg font-bold text-white">{businessProfile?.name || 'Your Company'}</h1>
              <p className="text-slate-400 text-xs">{businessProfile?.city} • {businessProfile?.country}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest">Invoice</p>
            <p className="text-2xl font-bold text-white mt-1">#{details.invoiceNumber?.replace('INV-', '') || '000'}</p>
            <p className="text-slate-400 text-xs mt-1">{formatDate(details.issueDate)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6 bg-white">
        {/* Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 border-l-2 border-amber-500 pl-3">Bill To</p>
            {client ? (
              <div className="pl-3">
                <p className="font-semibold text-slate-900 text-lg">{client.company_name}</p>
                <p className="text-slate-600 text-sm">{client.contact_person}</p>
                <p className="text-amber-600 text-sm">{client.email}</p>
                <p className="text-slate-500 text-sm mt-1">{client.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic pl-3">No client selected</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 border-r-2 border-amber-500 pr-3">Payment Details</p>
            <div className="pr-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-slate-900">{formatDate(details.dueDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Terms</span>
                <span className="font-medium text-slate-900 uppercase">{details.paymentTerms?.replace('_', ' ') || 'Net 30'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase rounded-tl-lg">Service</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Rate</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-3 px-4 text-sm text-slate-800 font-medium">{item.description}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-right">{formatNumber(item.rate)}</td>
                <td className="py-3 px-4 text-sm font-semibold text-slate-900 text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-700">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500">Tax ({taxRate}%)</span>
                <span className="text-slate-700">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 mt-2 bg-amber-500 -mx-4 px-4 rounded-lg">
              <span className="font-bold text-slate-900">Total Due</span>
              <span className="font-bold text-xl text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Executive Notes</p>
            <p className="text-sm text-slate-600 italic">{notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-slate-900 text-center">
        <p className="text-xs text-slate-500">Thank you for your continued partnership</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 7: Elegant Boutique
  // ============================================
  const renderElegantTemplate = () => (
    <div className="bg-[#fafafa] text-slate-800 font-serif">
      {/* Header with Logo */}
      <div className="px-8 py-8 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {renderLogo('sm')}
            <div>
              <h1 className="text-2xl font-light italic">{businessProfile?.name || 'Company Name'}</h1>
              <p className="text-xs font-sans text-slate-400 uppercase tracking-widest mt-2">
                {businessProfile?.city} • {businessProfile?.country}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest">Invoice No.</p>
            <p className="text-lg font-light mt-1">{details.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        {/* Client & Dates */}
        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest mb-3">Prepared For</p>
            {client ? (
              <div>
                <h2 className="text-xl font-light italic">{client.company_name}</h2>
                <p className="text-sm text-slate-600 mt-2 font-sans">{client.address}</p>
                <p className="text-sm text-slate-800 mt-1 font-sans">{client.email}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic font-sans">No client selected</p>
            )}
          </div>
          <div className="flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-6 font-sans">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Date</p>
                <p className="text-sm font-medium mt-1">{formatDate(details.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Due Date</p>
                <p className="text-sm font-medium mt-1">{formatDate(details.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="text-left py-3 font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-center py-3 font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Qty</th>
              <th className="text-right py-3 font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Rate</th>
              <th className="text-right py-3 font-sans text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-4 text-base font-light italic">{item.description}</td>
                <td className="py-4 text-sm text-slate-600 text-center font-sans">{item.quantity}</td>
                <td className="py-4 text-sm text-slate-600 text-right font-sans">{formatNumber(item.rate)}</td>
                <td className="py-4 text-base font-light text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 font-sans">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500 font-medium">Tax ({taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 border-t border-slate-300 mt-2">
              <span className="font-semibold uppercase tracking-wider text-sm">Total</span>
              <span className="text-xl font-light italic">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {terms && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
            <p className="text-sm text-slate-600 font-light italic">{terms}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-white text-center border-t border-slate-200">
        <p className="text-xs font-sans font-semibold text-slate-300 uppercase tracking-[0.3em]">
          Thank you for choosing {businessProfile?.name || 'us'}
        </p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 8: Simple Plain (No Logo Required)
  // Clean, straightforward design focused on business details
  // ============================================
  const renderSimpleTemplate = () => (
    <div className="bg-white text-slate-800 font-sans p-8">
      {/* Header - Plain Text Based */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-4 border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
          <p className="text-slate-600 text-lg mt-1">#{details.invoiceNumber || 'INV-000'}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-slate-900">{businessProfile?.name || 'Your Company'}</p>
          <p className="text-slate-500 text-sm mt-1">{businessProfile?.address}</p>
          <p className="text-slate-500 text-sm">{businessProfile?.city}, {businessProfile?.state} {businessProfile?.zip_code}</p>
          <p className="text-slate-500 text-sm">{businessProfile?.country}</p>
        </div>
      </div>

      {/* From & To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">From</p>
          {businessProfile ? (
            <div className="text-sm">
              <p className="font-bold text-slate-900">{businessProfile.name}</p>
              <p className="text-slate-600">{businessProfile.address}</p>
              <p className="text-slate-600">{businessProfile.city}, {businessProfile.state} {businessProfile.zip_code}</p>
              <p className="text-slate-600">{businessProfile.country}</p>
              {businessProfile.email && <p className="text-slate-600">{businessProfile.email}</p>}
              {businessProfile.phone && <p className="text-slate-600">{businessProfile.phone}</p>}
              {businessProfile.website && <p className="text-slate-600">{businessProfile.website}</p>}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No business profile</p>
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Bill To</p>
          {client ? (
            <div className="text-sm">
              <p className="font-bold text-slate-900">{client.company_name}</p>
              <p className="text-slate-600">{client.contact_person}</p>
              <p className="text-slate-600">{client.email}</p>
              <p className="text-slate-600">{client.address}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No client selected</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-12 mb-8 py-4 bg-slate-100 rounded">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase">Issue Date</p>
          <p className="font-bold mt-1">{formatDate(details.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase">Due Date</p>
          <p className="font-bold mt-1">{formatDate(details.dueDate)}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase">Total Due</p>
          <p className="font-bold text-xl mt-1 text-slate-900">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-3 border-slate-800">
            <th className="text-left py-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Description</th>
            <th className="text-right py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-20">Qty</th>
            <th className="text-right py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-28">Rate</th>
            <th className="text-right py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-200">
              <td className="py-3 text-sm">{item.description}</td>
              <td className="py-3 text-sm text-right text-slate-600">{item.quantity}</td>
              <td className="py-3 text-sm text-right text-slate-600">{formatNumber(item.rate)}</td>
              <td className="py-3 text-sm font-bold text-right">{formatNumber(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-56">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-600">Tax ({taxRate}%)</span>
              <span className="font-bold">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between py-2 text-sm text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-4 border-slate-800 mt-2">
            <span className="font-bold text-lg">TOTAL</span>
            <span className="font-bold text-xl">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(notes || terms) && (
        <div className="mt-8 pt-6 border-t-2 border-slate-200">
          {notes && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-600">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Terms</p>
              <p className="text-sm text-slate-600">{terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ============================================
  // TEMPLATE 9: Creative (No Logo Required)
  // Bold, colorful design focused on business details
  // ============================================
  const renderCreativeTemplate = () => (
    <div className="bg-white text-slate-800 font-sans">
      {/* Colorful Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white px-8 py-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black tracking-tight">INVOICE</h1>
            <p className="text-white/80 mt-1 font-mono">#{details.invoiceNumber || 'INV-000'}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{businessProfile?.name || 'Your Business'}</p>
            <p className="text-white/70 text-sm mt-1">{businessProfile?.address}</p>
            <p className="text-white/70 text-sm">{businessProfile?.city}, {businessProfile?.country}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-6">
        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-violet-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-violet-600 uppercase mb-2">Issued</p>
            <p className="font-bold text-slate-900">{formatDate(details.issueDate)}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-purple-600 uppercase mb-2">Due</p>
            <p className="font-bold text-slate-900">{formatDate(details.dueDate)}</p>
          </div>
          <div className="bg-fuchsia-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-fuchsia-600 uppercase mb-2">Amount</p>
            <p className="font-bold text-xl text-slate-900">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* From & To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border-l-4 border-violet-500 pl-4">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">From</p>
            {businessProfile ? (
              <div className="text-sm">
                <p className="font-bold text-slate-900 text-lg">{businessProfile.name}</p>
                <p className="text-slate-600">{businessProfile.address}</p>
                <p className="text-slate-600">{businessProfile.city}, {businessProfile.state} {businessProfile.zip_code}</p>
                <p className="text-slate-600">{businessProfile.country}</p>
                {businessProfile.email && <p className="text-violet-600 font-medium">{businessProfile.email}</p>}
                {businessProfile.phone && <p className="text-slate-600">{businessProfile.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No business profile</p>
            )}
          </div>
          <div className="border-l-4 border-fuchsia-500 pl-4">
            <p className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider mb-2">Bill To</p>
            {client ? (
              <div className="text-sm">
                <p className="font-bold text-slate-900 text-lg">{client.company_name}</p>
                <p className="text-slate-600">{client.contact_person}</p>
                <p className="text-fuchsia-600 font-medium">{client.email}</p>
                <p className="text-slate-600">{client.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No client selected</p>
            )}
          </div>
        </div>

        {/* Items with Colorful Header */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
              <th className="text-left py-3 px-4 text-xs font-bold uppercase rounded-l-lg">Description</th>
              <th className="text-center py-3 px-4 text-xs font-bold uppercase">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase">Rate</th>
              <th className="text-right py-3 px-4 text-xs font-bold uppercase rounded-r-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-violet-50/50">
                <td className="py-3 px-4 text-sm text-slate-800">{item.description}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-sm text-slate-600 text-right">{formatNumber(item.rate)}</td>
                <td className="py-3 px-4 text-sm font-bold text-slate-900 text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals with Color */}
        <div className="flex justify-end">
          <div className="w-64 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl p-4 border border-violet-100">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-500">Tax ({taxRate}%)</span>
                <span className="font-bold">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 mt-2 border-t-2 border-gradient-to-r from-violet-600 to-fuchsia-600">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-slate-600">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  // --- Main Render Logic ---
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'professional':
        return renderProfessionalTemplate();
      case 'modern':
        return renderModernTemplate();
      case 'classic':
        return renderClassicTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      case 'executive':
        return renderExecutiveTemplate();
      case 'elegant':
        return renderElegantTemplate();
      case 'simple':
        return renderSimpleTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'default':
      default:
        return renderDefaultTemplate();
    }
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border shadow-lg">
      {/* Preview Header - hidden for fullSize (PDF generation) */}
      {!fullSize && (
        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Live Preview</span>
          <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full">{selectedTemplate === 'default' ? 'InvoiceFlow' : selectedTemplate}</span>
        </div>
        <button
          onClick={toggleExpand}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isExpanded 
              ? 'bg-primary text-white' 
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          {isExpanded ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Collapse</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Expand</span>
            </>
          )}
        </button>
      </div>
      )}
      
      {/* Invoice Container */}
      <div className={`relative bg-white ${isExpanded ? 'h-full min-h-[80vh]' : ''}`}>
        {isExpanded && (
          <div className="flex justify-end pb-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Collapse</span>
            </button>
          </div>
        )}
        <div className={`overflow-auto ${isExpanded ? 'h-full' : ''}`}>
          {/* Responsive scaling - show full size when expanded or fullSize prop is true */}
          <div className={`
            min-w-[280px] xs:min-w-[320px]
            ${(isExpanded || fullSize) ? 'scale-100 transform-none' : 'transform origin-top-left xs:scale-[0.32] sm:scale-[0.38] md:scale-[0.48] lg:scale-[0.58] xl:scale-[0.68] 2xl:scale-75'}
          `}>
            <div className="w-[210mm] mx-auto shadow-xl" style={{ minHeight: '297mm' }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
