'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface InvoiceCardProps {
  invoice: Invoice;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDownload: (id: string) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const InvoiceCard = ({
  invoice,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDownload,
  onSend,
  onDelete
}: InvoiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
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
              <h3 className="text-base font-heading font-semibold text-foreground data-text">{invoice.invoiceNumber}</h3>
              <p className="text-sm text-muted-foreground mt-1">{invoice.clientName}</p>
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
            <span className="text-base font-medium text-foreground data-text">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
    <div className="bg-card rounded-lg shadow-elevation-1 p-4 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(invoice.id)}
            className="mt-1 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
          />
          <div>
            <h3 className="text-base font-heading font-semibold text-foreground data-text">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-muted-foreground mt-1">{invoice.clientName}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-muted rounded-md transition-smooth"
            aria-label="Invoice actions"
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover rounded-lg shadow-elevation-3 py-2 z-20">
                <button
                  onClick={() => {
                    onEdit(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="PencilIcon" size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDuplicate(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="DocumentDuplicateIcon" size={18} />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    onDownload(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="ArrowDownTrayIcon" size={18} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    onSend(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="PaperAirplaneIcon" size={18} />
                  <span>Send</span>
                </button>
                <div className="h-px bg-border my-2" />
                <button
                  onClick={() => {
                    onDelete(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-smooth"
                >
                  <Icon name="TrashIcon" size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount:</span>
          <span className="text-base font-medium text-foreground data-text">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-smooth"
      >
        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
        <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Issue Date:</span>
            <span className="text-sm text-foreground">{invoice.issueDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Due Date:</span>
            <span className="text-sm text-foreground">{invoice.dueDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;