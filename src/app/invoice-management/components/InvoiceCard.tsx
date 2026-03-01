'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface InvoiceCardProps {
  invoice: InvoiceWithClient;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDownload: (id: string) => void;
  onPreview: (id: string) => void;
  onSend: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

const InvoiceCard = ({
  invoice,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDownload,
  onPreview,
  onSend,
  onMarkAsPaid,
  onDelete
}: InvoiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'CheckCircleIcon';
      case 'pending':
        return 'ClockIcon';
      case 'overdue':
        return 'ExclamationCircleIcon';
      default:
        return 'QuestionMarkCircleIcon';
    }
  };

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showActions) {
      setShowActions(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 220; // Approximate height
      
      const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      const top = openUpwards
        ? rect.top - dropdownHeight
        : rect.bottom + 4;

      setDropdownPos({
        top,
        right: window.innerWidth - rect.right,
      });
      setShowActions(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (showActions) setShowActions(false);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showActions]);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-elevation-1 p-4 border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              disabled
            />
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground data-text">{invoice.invoice_number}</h3>
              <p className="text-sm text-muted-foreground mt-1">{invoice.clients?.company_name || ''}</p>
            </div>
          </div>
          <button
            className="p-2 hover:bg-muted rounded-md transition-smooth"
            disabled
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-base font-medium text-foreground data-text">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'KES' }).format(invoice.total_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium caption ${getStatusColor(invoice.status)}`}>
              <Icon name={getStatusIcon(invoice.status) as any} size={14} />
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-smooth"
          disabled
        >
          <span>View Details</span>
          <Icon name="ChevronDownIcon" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative group bg-card rounded-2xl border transition-all duration-300 ${isSelected ? 'border-primary ring-4 ring-primary/10' : 'border-divider hover:border-primary/50 hover:shadow-xl'}`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(invoice.id)}
                className="w-5 h-5 rounded-lg border-2 border-divider text-primary focus:ring-4 focus:ring-primary/20 cursor-pointer transition-all checked:border-primary"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                  {invoice.invoice_number}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <h3 className="text-base font-black text-foreground truncate uppercase tracking-tight">
                {invoice.clients?.company_name || ''}
              </h3>
            </div>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              onClick={toggleActions}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <Icon name="EllipsisVerticalIcon" size={20} />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowActions(false); }} />
                <div 
                  className="fixed w-56 bg-card border border-divider rounded-2xl shadow-2xl py-2 z-50 animate-in zoom-in-95 duration-200"
                  style={{ top: dropdownPos.top, right: dropdownPos.right }}
                >
                  <div className="px-4 py-2 border-b border-divider mb-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Actions</p>
                  </div>
                  {[
                    { label: 'Edit Document', icon: 'PencilIcon', action: onEdit },
                    { label: 'Live Preview', icon: 'EyeIcon', action: onPreview },
                    { label: 'Clone Record', icon: 'DocumentDuplicateIcon', action: onDuplicate },
                    { label: 'Export PDF', icon: 'ArrowDownTrayIcon', action: onDownload },
                    { label: 'Transmit Email', icon: 'PaperAirplaneIcon', action: onSend },
                    invoice.status !== 'paid' && { label: 'Mark as Paid', icon: 'CheckBadgeIcon', action: onMarkAsPaid },
                  ].filter(Boolean).map((item: any) => (
                    <button
                      key={item.label}
                      onClick={(e) => { e.stopPropagation(); (item as any).action(invoice.id); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon name={(item as any).icon as any} size={18} className="text-primary" />
                      <span>{(item as any).label}</span>
                    </button>
                  ))}
                  <div className="h-px bg-divider my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); setShowActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-error hover:bg-error/10 transition-colors"
                  >
                    <Icon name="TrashIcon" size={18} />
                    <span>Purge Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-divider/50 bg-muted/10 -mx-5 px-5">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Valuation</p>
            <p className="text-xl font-black text-foreground tabular-nums">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'KES' }).format(invoice.total_amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Expiry</p>
            <p className="text-sm font-bold text-foreground">
              {new Date(invoice.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick Footer */}
        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${invoice.status === 'paid' ? 'bg-success' : 'bg-warning'}`} />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    {invoice.status === 'paid' ? 'Fully Secured' : 'Awaiting Settlement'}
                </span>
            </div>
            <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
               <span>{isExpanded ? 'Less Info' : 'More Intel'}</span>
               <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
            </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-divider space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Origination</span>
              <span className="text-xs font-bold text-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Terms Index</span>
              <span className="text-xs font-bold text-foreground">Net {invoice.payment_terms || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;