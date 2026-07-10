'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
 clients?: {
 company_name: string;
 email?: string;
 };
}

interface InvoiceTableRowProps {
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

const InvoiceTableRow = ({
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
 <span className="text-sm text-foreground">{invoice.clients?.company_name || ''}</span>
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
 <tr className={`border-b border-divider/50 transition-all duration-300 ${isSelected ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'}`}>
 <td className="px-5 py-5">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={() => onSelect(invoice.id)}
 className="w-5 h-5 rounded-lg border-2 border-divider text-primary focus:ring-4 focus:ring-primary/10 cursor-pointer transition-all checked:border-primary"
 />
 </td>
 <td className="px-5 py-5">
 <span className="text-xs font-bold text-muted-foreground font-medium bg-muted px-2 py-1 rounded">
 {invoice.invoice_number}
 </span>
 </td>
 <td className="px-5 py-5">
 <div className="flex flex-col">
 <span className="text-sm font-bold text-foreground uppercase tracking-tight">{invoice.clients?.company_name || ''}</span>
 <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px]">{invoice.clients?.email || ''}</span>
 </div>
 </td>
 <td className="px-5 py-5">
 <span className="text-sm font-bold text-foreground tabular-nums">
 {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'KES' }).format(invoice.total_amount)}
 </span>
 </td>
 <td className="px-5 py-5">
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-muted-foreground font-medium">Date</span>
 <span className="text-xs font-bold text-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</span>
 </div>
 </td>
 <td className="px-5 py-5">
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-muted-foreground font-medium">Due Date</span>
 <span className="text-xs font-bold text-foreground">{new Date(invoice.due_date).toLocaleDateString()}</span>
 </div>
 </td>
 <td className="px-5 py-5">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight ${getStatusColor(invoice.status)}`}>
 <Icon name={getStatusIcon(invoice.status) as any} size={14} />
 {invoice.status}
 </span>
 </td>
 <td className="px-5 py-5">
 <div className="relative">
 <button
 ref={buttonRef}
 onClick={toggleActions}
 className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
 aria-label="Invoice actions"
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
 <p className="text-[10px] font-bold text-muted-foreground font-medium">Actions</p>
 </div>
 {[
 { label: 'Edit', icon: 'PencilIcon', action: onEdit },
 { label: 'Preview', icon: 'EyeIcon', action: onPreview },
 { label: 'Duplicate', icon: 'DocumentDuplicateIcon', action: onDuplicate },
 { label: 'Download PDF', icon: 'ArrowDownTrayIcon', action: onDownload },
 { label: 'Send Email', icon: 'PaperAirplaneIcon', action: onSend },
 invoice.status !== 'paid' && { label: 'Mark as Paid', icon: 'CheckBadgeIcon', action: onMarkAsPaid },
 ].filter(Boolean).map((item: any) => (
 <button
 key={item.label}
 onClick={(e) => { e.stopPropagation(); item.action(invoice.id); setShowActions(false); }}
 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors"
 >
 <Icon name={item.icon as any} size={18} className="text-primary" />
 <span>{item.label}</span>
 </button>
 ))}
 <div className="h-px bg-divider my-1" />
 <button
 onClick={(e) => { e.stopPropagation(); onDelete(invoice.id); setShowActions(false); }}
 className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-error hover:bg-error/10 transition-colors"
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