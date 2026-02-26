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
  // TEMPLATE: InvoiceFlow Clean (No Watermarks)
  // ============================================
  const renderInvoiceFlowCleanTemplate = () => (
    <div className="bg-white text-slate-800 font-sans relative">
      <div className="bg-primary text-white px-8 py-10 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              {renderLogo('lg')}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">{businessProfile?.name || 'Professional'}</h1>
              <p className="text-white/70 text-sm font-medium">#{details.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black opacity-20 tracking-tighter mb-2">INVOICE</p>
            <p className="text-sm font-bold">{formatDate(details.issueDate)}</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-10">
        <div className="grid grid-cols-2 gap-12 mb-10 pb-10 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Recipient Details</p>
            {client ? (
              <div className="space-y-1">
                <p className="font-black text-xl text-slate-900 tracking-tight">{client.company_name}</p>
                <p className="text-slate-500 font-medium">{client.contact_person}</p>
                <p className="text-primary font-bold">{client.email}</p>
                <p className="text-slate-400 text-sm pt-2">{client.address}</p>
              </div>
            ) : (
              <p className="text-slate-300 italic">Bill to undefined</p>
            )}
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="space-y-4 text-right">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                <p className="text-lg font-black text-slate-900">{formatDate(details.dueDate)}</p>
              </div>
              <div className="bg-primary/5 px-4 py-2 rounded-lg border-l-4 border-primary">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-left">Total Balance</p>
                <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full mb-10">
          <thead>
            <tr className="bg-slate-50">
              <th className="py-4 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Description</th>
              <th className="py-4 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Qty</th>
              <th className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Rate</th>
              <th className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                <td className="py-5 px-4 text-sm font-bold text-slate-800">{item.description}</td>
                <td className="py-5 px-2 text-sm text-center text-slate-500 font-medium">{item.quantity}</td>
                <td className="py-5 px-4 text-sm text-right text-slate-500">{formatNumber(item.rate)}</td>
                <td className="py-5 px-4 text-sm font-black text-right text-slate-900">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Net Value</span>
              <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sales Tax ({taxRate}%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm items-center text-emerald-500">
                <span className="font-bold uppercase tracking-widest text-[10px]">Loyalty Discount</span>
                <span className="font-bold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-4" />
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Balance Due</span>
              <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-10 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Terms & Instructions</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">{terms || 'Standard payment terms apply.'}</p>
          </div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Info</p>
             <div className="space-y-1 text-xs font-bold text-slate-600">
               <p>{businessProfile?.email}</p>
               <p>{businessProfile?.phone}</p>
               <p>{businessProfile?.website}</p>
             </div>
          </div>
        </div>
      </div>
      <div className="bg-primary/5 py-4 text-center border-t border-primary/20">
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Generated with InvoiceFlow • Premium Billing Solution</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: InvoiceFlow Business (Professional Elite)
  // ============================================
  const renderInvoiceFlowBusinessTemplate = () => (
    <div className="bg-white text-slate-900 font-sans border-t-[10px] border-primary">
      <div className="p-10">
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-4">
            {renderLogo('lg')}
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{businessProfile?.name}</h1>
              <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>{businessProfile?.city}</span>
                <span className="text-primary">•</span>
                <span>{businessProfile?.country}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-6xl font-black text-primary opacity-10 tracking-tighter mb-2 italic">Official</h2>
            <div className="space-y-1 text-right">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Reference Code</p>
               <p className="text-2xl font-black tracking-tighter">#{details.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-10 mb-16 px-6 py-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Billing To</p>
            <p className="font-black text-xl tracking-tight mb-2">{client?.company_name}</p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{client?.address}</p>
          </div>
          <div className="border-x border-slate-200 px-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Chronology</p>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Creation Date</p>
                <p className="text-sm font-bold">{formatDate(details.issueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Maturity Date</p>
                <p className="text-sm font-bold text-rose-600">{formatDate(details.dueDate)}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Obligation</p>
            <p className="text-3xl font-black text-primary tracking-tighter mb-2">{formatCurrency(total)}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currency} • {details.paymentTerms?.toUpperCase()}</p>
          </div>
        </div>

        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-6 pl-2">Line Items Analysis</h3>
        <div className="overflow-hidden rounded-3xl border border-slate-100 mb-12">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-5 px-8 text-left text-[10px] font-black uppercase tracking-widest">Service Item</th>
                <th className="py-5 px-4 text-center text-[10px] font-black uppercase tracking-widest w-24">Unit Qty</th>
                <th className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest w-36">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-6 px-8">
                    <p className="font-black text-slate-900 tracking-tight">{item.description}</p>
                    <p className="text-xs text-slate-400 mt-1 font-bold">Standard Rate: {formatNumber(item.rate)}</p>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span className="text-sm font-black text-slate-400">{item.quantity}</span>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <span className="text-base font-black text-slate-900">{formatNumber(item.amount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-start mb-16">
          <div className="max-w-md">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Executive Statement</p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{notes || 'Thank you for your business. We look forward to future collaborations.'}</p>
          </div>
          <div className="w-80 p-8 bg-slate-900 rounded-3xl text-white shadow-2xl transform hover:scale-105 transition-transform">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-60">
                <span>Gross Value</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-60">
                  <span>Sales Levy ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  <span>Rebate</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest">Final Total</span>
              <span className="text-2xl font-black tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          <p>{businessProfile?.website}</p>
          <p>© {new Date().getFullYear()} Protected Document</p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: InvoiceFlow Modern (Compact Pro)
  // ============================================
  const renderInvoiceFlowModernTemplate = () => (
    <div className="bg-[#f8fafc] text-slate-800 font-sans p-8">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-slate-800 p-12 text-white">
          <div className="flex justify-between items-center mb-12">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl">
              {renderLogo('md')}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Statement</p>
              <h1 className="text-5xl font-black tracking-tighter">INVOICE.</h1>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">Accountable Entity</p>
              <h2 className="text-2xl font-black tracking-tight">{businessProfile?.name}</h2>
              <p className="text-sm font-bold opacity-70 mt-1">{businessProfile?.email}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Invoice Reference</p>
                <p className="text-xl font-black tracking-tight">#{details.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-12">
          <div className="grid grid-cols-2 gap-16 mb-16">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Dispatch To</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">{client?.company_name}</h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">{client?.address}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-6">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Issue Date</p>
                  <p className="text-xs font-black text-slate-800 underline decoration-primary decoration-4 underline-offset-4">{formatDate(details.issueDate)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Terms</p>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{details.paymentTerms}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Liability Total</p>
              <h4 className="text-4xl font-black tracking-tighter text-primary mb-4">{formatCurrency(total)}</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due {formatDate(details.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-16">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] mb-4 pl-4 border-l-4 border-primary">Itemized Inventory</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <p className="font-black text-slate-900 tracking-tight mb-1">{item.description}</p>
                  <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    <span>{item.quantity} Units</span>
                    <span>@ {formatNumber(item.rate)} / Unit</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 tracking-tighter">{formatNumber(item.amount)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Statement Notes</p>
               <p className="text-xs text-slate-500 font-medium leading-relaxed leading-6">{notes || 'Professional services renderable within established frameworks.'}</p>
            </div>
            <div className="space-y-4 px-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Base Total</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Accrued Tax ({taxRate}%)</span>
                  <span className="text-sm font-black text-slate-900">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Settlement Discount</span>
                  <span className="text-sm font-black text-emerald-600">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pt-6 border-t-[3px] border-slate-900 flex justify-between items-center">
                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Final Dues</span>
                <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-6 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Powered by InvoiceFlow Premium</p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: InvoiceFlow Enterprise (Formal Grade)
  // ============================================
  const renderInvoiceFlowEnterpriseTemplate = () => (
    <div className="bg-white text-slate-900 font-sans border-l-[40px] border-primary">
      <div className="p-16">
        <div className="flex justify-between items-start mb-24">
          <div className="space-y-6">
            <div className="inline-block p-4 border-2 border-slate-900">
               {renderLogo('md')}
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">{businessProfile?.name}</h1>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Enterprise Solutions Provider</p>
            </div>
          </div>
          <div className="text-right">
             <div className="space-y-1 mb-8">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Formal Document No.</p>
               <p className="text-4xl font-black tracking-tighter underline underline-offset-8">#{details.invoiceNumber}</p>
             </div>
             <div className="grid grid-cols-2 gap-8 text-right font-black uppercase tracking-widest">
                <div>
                   <p className="text-[10px] text-slate-300 mb-1">Issue Date</p>
                   <p className="text-xs">{formatDate(details.issueDate)}</p>
                </div>
                <div>
                   <p className="text-[10px] text-slate-300 mb-1">Due Date</p>
                   <p className="text-xs text-rose-600">{formatDate(details.dueDate)}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-24 mb-24">
          <div>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-8 border-b-2 border-primary/20 pb-4">Recipient Index</p>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight uppercase">{client?.company_name}</h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase">{client?.address}</p>
              <div className="pt-4 flex items-center gap-3">
                 <div className="w-10 h-px bg-slate-300" />
                 <p className="text-xs font-bold text-primary">{client?.email}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 border-b-2 border-slate-100 pb-4">Transaction Overview</p>
            <div className="space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-300 uppercase">Valuation Currency</span>
                <span className="text-sm font-black">{currency}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-300 uppercase">Payment Lifecycle</span>
                <span className="text-sm font-black uppercase">{details.paymentTerms}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-[10px] font-black text-slate-400 uppercase">Principal Balance Due</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-24">
           <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.5em] mb-10 text-center">Certified Line Item Specification</p>
           <table className="w-full">
             <thead>
               <tr className="border-y-4 border-slate-900">
                 <th className="py-6 text-left text-[11px] font-black uppercase tracking-widest">Detail Item Description</th>
                 <th className="py-6 text-right text-[11px] font-black uppercase tracking-widest w-24">Units</th>
                 <th className="py-6 text-right text-[11px] font-black uppercase tracking-widest w-32">Rate Value</th>
                 <th className="py-6 text-right text-[11px] font-black uppercase tracking-widest w-32">Line Total</th>
               </tr>
             </thead>
             <tbody className="divide-y-2 divide-slate-100">
               {items.map((item, idx) => (
                 <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                   <td className="py-8 font-black text-slate-900 text-lg uppercase tracking-tight">{item.description}</td>
                   <td className="py-8 text-right font-bold text-slate-400">{item.quantity}</td>
                   <td className="py-8 text-right font-bold text-slate-400">{formatNumber(item.rate)}</td>
                   <td className="py-8 text-right font-black text-slate-900">{formatNumber(item.amount)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        <div className="flex justify-end mb-24">
          <div className="w-96 space-y-6">
             <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
               <span>Gross Aggregate</span>
               <span className="text-sm text-slate-900">{formatCurrency(subtotal)}</span>
             </div>
             {taxRate > 0 && (
               <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                 <span>Statutory Levy ({taxRate}%)</span>
                 <span className="text-sm text-slate-900">{formatCurrency(taxAmount)}</span>
               </div>
             )}
             {discount > 0 && (
               <div className="flex justify-between items-center text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                 <span>Strategic Rebate</span>
                 <span className="text-sm text-emerald-600">-{formatCurrency(discountAmount)}</span>
               </div>
             )}
             <div className="h-2 bg-slate-900 my-8" />
             <div className="flex justify-between items-center">
               <span className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Final Dues Payable</span>
               <span className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
             </div>
          </div>
        </div>

        <div className="border-t-4 border-slate-900 pt-16 flex justify-between items-start">
           <div className="max-w-md">
             <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 italic">Enterprise Declarations</p>
             <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase whitespace-pre-wrap">{terms || 'This document serves as an official request for settlement of provided services.'}</p>
           </div>
           <div className="text-right">
             <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Internal Repository Code</p>
             <p className="text-[10px] font-black text-slate-300 leading-none">AUTH-FLOW-{Date.now().toString().slice(-6)}</p>
           </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: InvoiceFlow Luxe (Minimal Elite)
  // ============================================
  const renderInvoiceFlowLuxeTemplate = () => (
    <div className="bg-[#fff] text-slate-900 font-sans p-16 relative overflow-hidden">
      {/* Dynamic Background Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      
      <div className="relative">
        <div className="flex justify-between items-baseline mb-32">
          <div className="space-y-2">
            <p className="text-xs font-black text-primary uppercase tracking-[0.8em]">Invoice</p>
            <h1 className="text-7xl font-black tracking-tighter text-slate-900">FLOW.</h1>
          </div>
          <div className="text-right">
             <div className="mb-4">
                {renderLogo('md')}
             </div>
             <p className="text-xl font-black tracking-tight uppercase">{businessProfile?.name}</p>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">#{details.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-16 mb-32">
          <div className="col-span-5">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-10 border-b border-slate-100 pb-4 text-center">Principal Client</p>
            <div className="space-y-4 text-center">
              <h3 className="text-3xl font-black tracking-tight uppercase text-slate-900">{client?.company_name}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">{client?.email}</p>
              <div className="pt-4">
                <p className="text-xs text-slate-300 font-bold uppercase leading-relaxed max-w-xs mx-auto">{client?.address}</p>
              </div>
            </div>
          </div>
          <div className="col-span-7">
            <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative">
              <div className="grid grid-cols-2 gap-12">
                 <div>
                    <p className="text-[10px] font-black text-primary uppercase mb-2">Issue Date</p>
                    <p className="text-lg font-black">{formatDate(details.issueDate)}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-primary uppercase mb-2">Due Date</p>
                    <p className="text-lg font-black">{formatDate(details.dueDate)}</p>
                 </div>
              </div>
              <div className="mt-10 pt-10 border-t border-white/10 flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Settlement Total</p>
                    <p className="text-4xl font-black text-primary tracking-tighter">{formatCurrency(total)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Valuation Index</p>
                    <p className="text-xs font-black">{currency} ({details.paymentTerms?.toUpperCase()})</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-32">
           <table className="w-full">
             <thead>
               <tr className="border-b border-slate-100">
                 <th className="py-8 text-left text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">Service Description</th>
                 <th className="py-8 text-right text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 w-32">Aggregate Amount</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {items.map((item, idx) => (
                 <tr key={idx} className="group">
                   <td className="py-10">
                     <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase group-hover:text-primary transition-colors underline decoration-primary/20">{item.description}</p>
                     <p className="text-[10px] font-black text-slate-300 uppercase mt-2 tracking-widest">{item.quantity} Units x {formatNumber(item.rate)}</p>
                   </td>
                   <td className="py-10 text-right">
                     <span className="text-2xl font-black text-slate-900 tracking-tighter italic">{formatNumber(item.amount)}</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        <div className="grid grid-cols-12 gap-12 border-t border-slate-100 pt-16">
          <div className="col-span-8">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 border-l-4 border-primary pl-4">Statement Notes</p>
             <p className="text-sm text-slate-400 font-bold leading-relaxed uppercase max-w-lg">{notes || 'Final settlement requested according to established professional guidelines.'}</p>
          </div>
          <div className="col-span-4 space-y-4 px-4 border-l border-slate-100">
             <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase">
               <span>Base Total</span>
               <span className="text-slate-900">{formatCurrency(subtotal)}</span>
             </div>
             {taxRate > 0 && (
               <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase">
                 <span>Statutory Levy</span>
                 <span className="text-slate-900">+{formatCurrency(taxAmount)}</span>
               </div>
             )}
             {discount > 0 && (
               <div className="flex justify-between items-center text-[10px] font-black text-emerald-300 uppercase">
                 <span>Applied Credit</span>
                 <span className="text-emerald-600">-{formatCurrency(discountAmount)}</span>
               </div>
             )}
             <div className="pt-8 flex justify-between items-center group">
               <span className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-[6px] border-primary/20">Final Balance</span>
               <span className="text-3xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">{formatCurrency(total)}</span>
             </div>
          </div>
        </div>

        <div className="mt-40 text-center">
           <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1em] mb-4">Official Document</p>
           <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Verified Secure by InvoiceFlow Premium</p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE 2: Corporate Elite (Premium)
  // ============================================
  const renderPremiumCorporateTemplate = () => (
    <div className="bg-white text-slate-800 font-sans p-10 border-t-8 border-primary">
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-6">
          {renderLogo('lg')}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{businessProfile?.name || 'Your Company'}</h1>
            <div className="mt-2 text-sm text-slate-500 space-y-1">
              <p>{businessProfile?.address}</p>
              <p>{[businessProfile?.city, businessProfile?.state, businessProfile?.zip_code].filter(Boolean).join(', ')}</p>
              <p>{businessProfile?.country}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-primary/20 tracking-tighter uppercase mb-2">Invoice</h2>
          <div className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded inline-block">
            #{details.invoiceNumber}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="border-l-4 border-primary pl-6 py-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Client Details</h3>
          {client ? (
            <div className="text-sm">
              <p className="font-bold text-slate-900 text-lg mb-1">{client.company_name}</p>
              <p className="text-slate-600">{client.contact_person}</p>
              <p className="text-primary font-medium">{client.email}</p>
              <p className="text-slate-500 mt-2">{client.address}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No client selected</p>
          )}
        </div>
        <div className="bg-slate-50 p-6 rounded-xl flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
              <p className="text-sm font-bold text-slate-900">{formatDate(details.issueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-sm font-bold text-rose-600">{formatDate(details.dueDate)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Terms</p>
             <p className="text-sm font-bold text-slate-900 uppercase">{details.paymentTerms?.replace('_', ' ') || 'NET 30'}</p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="text-left py-4 px-2 text-xs font-bold text-slate-900 uppercase tracking-widest">Description</th>
            <th className="text-center py-4 px-2 text-xs font-bold text-slate-900 uppercase tracking-widest w-24">Quantity</th>
            <th className="text-right py-4 px-2 text-xs font-bold text-slate-900 uppercase tracking-widest w-32">Rate</th>
            <th className="text-right py-4 px-2 text-xs font-bold text-slate-900 uppercase tracking-widest w-32">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-5 px-2 text-sm text-slate-800 font-medium">{item.description}</td>
              <td className="py-5 px-2 text-sm text-slate-600 text-center">{item.quantity}</td>
              <td className="py-5 px-2 text-sm text-slate-600 text-right">{formatNumber(item.rate)}</td>
              <td className="py-5 px-2 text-sm font-bold text-slate-900 text-right">{formatNumber(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm py-1">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Tax ({taxRate}%)</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm py-1 text-emerald-600">
              <span>Discount ({discount}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 bg-primary text-white px-6 rounded-lg shadow-lg transform translate-y-2">
            <span className="font-bold uppercase tracking-wider">Total Due</span>
            <span className="font-black text-xl">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-100">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Business Contact</h4>
          <div className="text-sm text-slate-600 space-y-2">
            {businessProfile?.email && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p>{businessProfile.email}</p>
              </div>
            )}
            {businessProfile?.phone && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p>{businessProfile.phone}</p>
              </div>
            )}
            {businessProfile?.website && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p>{businessProfile.website}</p>
              </div>
            )}
          </div>
        </div>
        {notes && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Notes & Instructions</h4>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Official Business Document</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: Modern Pro (Premium)
  // ============================================
  const renderPremiumModernTemplate = () => (
    <div className="bg-[#fcfcfc] text-slate-800 font-sans p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-primary px-10 py-12 flex justify-between items-center text-white">
          <div className="flex items-center gap-6">
            <div className="bg-white p-3 rounded-2xl">
              {renderLogo('md')}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{businessProfile?.name || 'Business Pro'}</h1>
              <p className="opacity-80 text-sm mt-1">{businessProfile?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Invoice Number</h2>
            <p className="text-3xl font-black tracking-tighter">#{details.invoiceNumber}</p>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="col-span-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bill To</p>
              {client ? (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{client.company_name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{client.address}</p>
                  <p className="text-primary font-medium text-sm mt-2">{client.email}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No client selected</p>
              )}
            </div>
            <div className="col-span-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dates</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Issued</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(details.issueDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(details.dueDate)}</p>
                </div>
              </div>
            </div>
            <div className="col-span-1 bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Balance</p>
               <p className="text-xl font-black text-primary tracking-tight">{formatCurrency(total)}</p>
               <p className="text-[10px] text-slate-500 mt-2 font-medium">Currency: {currency} • {details.paymentTerms?.toUpperCase()}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 mb-10">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Service Item</th>
                  <th className="text-center py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest w-24">Qty</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-5 px-6">
                      <p className="text-sm font-bold text-slate-900">{item.description}</p>
                      <p className="text-xs text-slate-400 mt-1">Rate: {formatNumber(item.rate)}</p>
                    </td>
                    <td className="py-5 px-2 text-sm text-slate-600 text-center font-medium">{item.quantity}</td>
                    <td className="py-5 px-6 text-sm font-bold text-slate-900 text-right">{formatNumber(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-10">
            <div className="w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Subtotal</span>
                <span className="font-bold text-slate-700">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Tax ({taxRate}%)</span>
                  <span className="font-bold text-slate-700">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-500">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-slate-100 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Additional Notes</h4>
              <p className="text-sm text-slate-600 leading-relaxed italic">{notes}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 px-10 py-6 text-white flex justify-between items-center text-[11px] font-bold uppercase tracking-widest opacity-90">
          <p>{businessProfile?.website || 'Professional Invoicing'}</p>
          <p>Thank you for your business</p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: Classic Executive (Premium)
  // ============================================
  const renderPremiumClassicTemplate = () => (
    <div className="bg-white text-slate-800 font-serif p-12 relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20 m-6 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 m-6 pointer-events-none" />

      <div className="relative">
        <div className="flex justify-between items-end mb-16 pb-8 border-b-2 border-slate-900">
          <div>
            <h1 className="text-4xl font-black tracking-wider text-slate-900 uppercase mb-4">Invoice</h1>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase font-sans tracking-[0.2em]">Reference No.</p>
              <p className="text-lg font-black text-primary font-sans tracking-widest">{details.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            {renderLogo('lg')}
            <h2 className="text-xl font-bold mt-4 font-sans tracking-tight uppercase">{businessProfile?.name || 'Executive Pro'}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 mb-16">
          <div className="font-sans">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">REMIT TO:</h3>
            <div className="text-sm text-slate-700 space-y-2">
              <p className="font-bold text-slate-900 text-lg">{businessProfile?.name}</p>
              <p>{businessProfile?.address}</p>
              <p>{businessProfile?.city}, {businessProfile?.country}</p>
              {businessProfile?.phone && <p className="pt-2">T: {businessProfile.phone}</p>}
              {businessProfile?.email && <p>E: {businessProfile.email}</p>}
            </div>
          </div>
          <div className="font-sans">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">BILLING TO:</h3>
            {client ? (
              <div className="text-sm text-slate-700 space-y-2">
                <p className="font-bold text-slate-900 text-lg">{client.company_name}</p>
                <p>{client.contact_person}</p>
                <p>{client.address}</p>
                <p className="text-primary font-bold pt-2">{client.email}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No client defined</p>
            )}
            
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                <p className="text-sm font-bold text-slate-900">{formatDate(details.issueDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                <p className="text-sm font-bold text-slate-900 underline decoration-primary decoration-2 underline-offset-4">{formatDate(details.dueDate)}</p>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full mb-12 font-sans">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-4 px-6 text-left text-[10px] font-bold uppercase tracking-[0.2em]">Service Description</th>
              <th className="py-4 px-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] w-24">QTY</th>
              <th className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] w-32">Rate</th>
              <th className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-6 px-6 text-sm font-bold text-slate-900">{item.description}</td>
                <td className="py-6 px-6 text-sm text-center text-slate-600 font-medium">{item.quantity}</td>
                <td className="py-6 px-6 text-sm text-right text-slate-600">{formatNumber(item.rate)}</td>
                <td className="py-6 px-6 text-sm font-black text-right text-slate-900">{formatNumber(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end items-start mb-16 gap-16 font-sans">
          {terms && (
            <div className="flex-1 max-w-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Terms & Conditions</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-4">{terms}</p>
            </div>
          )}
          <div className="w-64 space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-400">Tax (${taxRate}%)</span>
                <span className="text-slate-900">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="pt-6 border-t-4 border-slate-900 flex justify-between items-baseline">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Amount Due</span>
              <span className="text-xl font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-slate-100 font-sans">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mb-2">{businessProfile?.name || 'Executive Pro'}</p>
           <p className="text-[9px] text-slate-300 uppercase tracking-widest italic">{businessProfile?.website || ''}</p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: Minimal Luxe (Premium)
  // ============================================
  const renderPremiumMinimalTemplate = () => (
    <div className="bg-white text-slate-900 font-sans p-16">
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-2">Invoice.</h1>
          <p className="text-lg font-medium text-slate-400 tracking-wide">#{details.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="mb-6 opacity-80">
            {renderLogo('lg')}
          </div>
          <p className="font-bold text-xl uppercase tracking-widest">{businessProfile?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-12 mb-24">
        <div className="col-span-1">
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6 underline decoration-primary decoration-4 underline-offset-8">Client</h3>
          {client ? (
            <div className="text-sm font-medium space-y-1">
              <p className="text-slate-900">{client.company_name}</p>
              <p className="text-slate-500">{client.email}</p>
              <p className="text-slate-400 pt-2 text-xs uppercase leading-relaxed tracking-wider">{client.address}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-300 italic">Undefined Client</p>
          )}
        </div>
        <div className="col-span-1">
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6 underline decoration-primary decoration-4 underline-offset-8">Issued</h3>
          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{formatDate(details.issueDate)}</p>
        </div>
        <div className="col-span-1">
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6 underline decoration-primary decoration-4 underline-offset-8">Deadline</h3>
          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{formatDate(details.dueDate)}</p>
        </div>
        <div className="col-span-1 text-right">
          <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-6 underline decoration-primary decoration-4 underline-offset-8">Total</h3>
          <p className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="mb-24">
        <div className="grid grid-cols-12 gap-6 border-b border-slate-100 pb-4 mb-4">
          <div className="col-span-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Description</div>
          <div className="col-span-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amt</div>
          <div className="col-span-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub</div>
        </div>
        <div className="space-y-10">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-6 items-baseline">
              <div className="col-span-8">
                <p className="text-base font-bold text-slate-900 tracking-tight">{item.description}</p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">{item.quantity} Unit(s) at {formatNumber(item.rate)} / unit</p>
              </div>
              <div className="col-span-2 text-center text-sm font-medium text-slate-400">
                {formatNumber(item.amount)}
              </div>
              <div className="col-span-2 text-right text-base font-black text-slate-900">
                {formatNumber(item.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12 border-t pt-12 border-slate-100">
        <div className="col-span-7">
          {notes && (
            <div className="max-w-md">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Statement Notations.</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{notes}</p>
            </div>
          )}
        </div>
        <div className="col-span-5 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Net Total.</span>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Calculated Tax.</span>
              <span className="text-sm font-bold text-slate-900">+{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between items-baseline text-emerald-500">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Applied Discount.</span>
              <span className="text-sm font-bold">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="pt-8 flex justify-between items-center border-t border-slate-900">
             <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 font-sans">Final Balance Due.</span>
             <span className="text-xl font-black text-primary tracking-tighter">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-32 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-200">
        <p>{businessProfile?.website || 'Premium Minimalism'}</p>
        <p>© Document Verified</p>
      </div>
    </div>
  );

  // ============================================
  // TEMPLATE: Bold Professional (Premium)
  // ============================================
  const renderPremiumBoldTemplate = () => (
    <div className="bg-slate-900 text-white font-sans">
      <div className="flex">
        {/* Colorful Sidebar */}
        <div className="w-16 bg-gradient-to-b from-primary via-primary/80 to-slate-800" />
        
        <div className="flex-1 p-12 bg-white text-slate-900">
          <div className="flex justify-between items-start mb-16">
            <div className="flex items-center gap-6">
              <div className="bg-slate-900 p-4 rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform">
                {renderLogo('lg')}
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">{businessProfile?.name || 'Bold Business'}</h1>
                <p className="text-primary font-black uppercase tracking-widest text-sm">{businessProfile?.website || 'Elite Solutions'}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-6xl font-black text-slate-100 absolute right-12 top-10 pointer-events-none uppercase transform scale-y-125 origin-right">Invoice</h2>
              <div className="relative z-10 space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Registry</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">#{details.invoiceNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 mb-16">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Client Representative</p>
              {client ? (
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{client.company_name}</h3>
                  <div className="text-sm text-slate-600 font-medium space-y-1">
                    <p className="text-slate-900 font-bold">{client.contact_person}</p>
                    <p>{client.address}</p>
                    <p className="text-primary font-bold">{client.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300 font-bold uppercase italic">Missing Client Metadata</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-6 rounded-2xl text-white transform rotate-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                <p className="text-sm font-black">{formatDate(details.issueDate)}</p>
              </div>
              <div className="bg-primary p-6 rounded-2xl text-white transform -rotate-1 shadow-lg">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Due Date</p>
                <p className="text-sm font-black">{formatDate(details.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="mb-12 overflow-hidden rounded-3xl border-4 border-slate-900 shadow-elevation-3">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-5 px-8 text-left text-[11px] font-black uppercase tracking-widest">Billable Item</th>
                  <th className="py-5 px-4 text-center text-[11px] font-black uppercase tracking-widest w-24">Unit</th>
                  <th className="py-5 px-8 text-right text-[11px] font-black uppercase tracking-widest w-40">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-8">
                      <p className="text-lg font-black text-slate-900 leading-none">{item.description}</p>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Rate: {formatNumber(item.rate)} / Unit</p>
                    </td>
                    <td className="py-6 px-4 text-center font-black text-slate-900">{item.quantity}</td>
                    <td className="py-6 px-8 text-right font-black text-xl text-slate-900 tracking-tighter">
                      {formatNumber(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end mb-12">
            <div className="max-w-md">
              {notes && (
                <div className="p-6 bg-slate-50 rounded-2xl border-l-8 border-slate-900">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{notes}</p>
                </div>
              )}
            </div>
            <div className="w-80 space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest px-4">
                <span className="text-slate-400">Net Total</span>
                <span className="text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-xs font-black uppercase tracking-widest px-4">
                  <span className="text-slate-400">Calculated Tax</span>
                  <span className="text-slate-900">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-xs font-black uppercase tracking-widest px-4 text-emerald-500">
                  <span>Applied Reward</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl transform translate-y-4 hover:scale-105 transition-transform duration-300">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</p>
                     <p className="text-base font-black uppercase">{currency} Total</p>
                   </div>
                   <p className="text-xl font-black tracking-tighter">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            <div className="flex items-center gap-4">
              <p>{businessProfile?.email || 'OFFICIAL'}</p>
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p>{businessProfile?.phone || 'CONTACT'}</p>
            </div>
            <p>Authenticated Document v1.0</p>
          </div>
        </div>
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
      case 'invoiceflow_clean':
        return renderInvoiceFlowCleanTemplate();
      case 'invoiceflow_business':
        return renderInvoiceFlowBusinessTemplate();
      case 'invoiceflow_modern':
        return renderInvoiceFlowModernTemplate();
      case 'invoiceflow_enterprise':
        return renderInvoiceFlowEnterpriseTemplate();
      case 'invoiceflow_luxe':
        return renderInvoiceFlowLuxeTemplate();
      case 'premium_corporate':
        return renderPremiumCorporateTemplate();
      case 'premium_modern':
        return renderPremiumModernTemplate();
      case 'premium_classic':
        return renderPremiumClassicTemplate();
      case 'premium_minimal':
        return renderPremiumMinimalTemplate();
      case 'premium_bold':
        return renderPremiumBoldTemplate();
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
