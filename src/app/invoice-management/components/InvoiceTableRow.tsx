'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface InvoiceTableRowProps {
  invoice: InvoiceWithClient;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDownload: (id: string) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const InvoiceTableRow = ({
  invoice,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDownload,
  onSend,
  onDelete
}: InvoiceTableRowProps) => {
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
      const dropdownHeight = 220; // Approximate height of the dropdown
      
      // Decide whether to open up or down
      // If there isn't enough space below (less than dropdown height) and there is more space above, open upwards
      const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      const top = openUpwards
        ? rect.top - dropdownHeight // Open upwards (relative to viewport top, but we need to account for height)
           // Correction: if fixed positioning, strictly top = rect.top - height
           // But let's verify exact alignment. 
           // rect.top is distance from top of viewport to top of button.
           // We want bottom of dropdown to be at top of button? Or aligned with button?
           // Usually aligned with bottom of button if down, top of button if up.
           // Let's refine:
           // Upwards: top = rect.top - dropdownHeight
           // Downwards: top = rect.bottom + 4
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
    // Capture scroll events on window to close dropdown on scroll
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showActions]);

  if (!isHydrated) {
    return (
      <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
        <td className="px-4 py-4">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            disabled
          />
        </td>
        <td className="px-4 py-4">
          <span className="text-sm font-medium text-foreground data-text">{invoice.invoice_number}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-foreground">{invoice.clients?.company_name || 'Unknown Client'}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm font-medium text-foreground data-text">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'KES' }).format(invoice.total_amount)}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</span>
        </td>
        <td className="px-4 py-4">
          <span className="text-sm text-muted-foreground">{new Date(invoice.due_date).toLocaleDateString()}</span>
        </td>
        <td className="px-4 py-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium caption ${getStatusColor(invoice.status)}`}>
            <Icon name={getStatusIcon(invoice.status) as any} size={14} />
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-4">
          <button
            className="p-2 hover:bg-muted rounded-md transition-smooth"
            disabled
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(invoice.id)}
          className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
        />
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-foreground data-text">{invoice.invoice_number}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{invoice.clients?.company_name || 'Unknown Client'}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-foreground data-text">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'KES' }).format(invoice.total_amount)}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">{new Date(invoice.due_date).toLocaleDateString()}</span>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium caption ${getStatusColor(invoice.status)}`}>
          <Icon name={getStatusIcon(invoice.status) as any} size={14} />
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={toggleActions}
            className="p-2 hover:bg-muted rounded-md transition-smooth"
            aria-label="Invoice actions"
          >
            <Icon name="EllipsisVerticalIcon" size={20} className="text-muted-foreground" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-40"
                 onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(false);
                }}
              />
              <div 
                className="fixed w-48 bg-card border border-border rounded-lg shadow-elevation-3 py-1 z-50 text-foreground"
                style={{ 
                  top: dropdownPos.top, 
                  right: dropdownPos.right,
                  // We calculated top relative to window, so fixed positioning places it correctly.
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="PencilIcon" size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="DocumentDuplicateIcon" size={18} />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="ArrowDownTrayIcon" size={18} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSend(invoice.id);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-smooth"
                >
                  <Icon name="PaperAirplaneIcon" size={18} />
                  <span>Send</span>
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
      </td>
    </tr>
  );
};

export default InvoiceTableRow;