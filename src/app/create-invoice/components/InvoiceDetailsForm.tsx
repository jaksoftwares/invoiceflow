'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
}

interface InvoiceDetailsFormProps {
  details: InvoiceDetails;
  onDetailsChange: (details: InvoiceDetails) => void;
}

const InvoiceDetailsForm = ({ details, onDetailsChange }: InvoiceDetailsFormProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [localDetails, setLocalDetails] = useState<InvoiceDetails>(details);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const paymentTermsOptions = [
    { value: 'net15', label: 'Net 15 days' },
    { value: 'net30', label: 'Net 30 days' },
    { value: 'net45', label: 'Net 45 days' },
    { value: 'net60', label: 'Net 60 days' },
    { value: 'due_on_receipt', label: 'Due on receipt' },
  ];

  const handleChange = (field: keyof InvoiceDetails, value: string) => {
    const updatedDetails = { ...localDetails, [field]: value };
    setLocalDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  const generateInvoiceNumber = () => {
    if (!isHydrated) return;
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const invoiceNum = `INV-${timestamp.toString().slice(-6)}${randomNum.toString().padStart(3, '0')}`;
    handleChange('invoiceNumber', invoiceNum);
  };

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Invoice Number</label>
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Payment Terms</label>
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Issue Date</label>
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Due Date</label>
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-foreground">
          Invoice Number <span className="text-error">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="invoiceNumber"
            type="text"
            value={localDetails.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
            placeholder="INV-001"
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            required
          />
          <button
            type="button"
            onClick={generateInvoiceNumber}
            className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-smooth"
            title="Generate invoice number"
          >
            <Icon name="ArrowPathIcon" size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="paymentTerms" className="block text-sm font-medium text-foreground">
          Payment Terms <span className="text-error">*</span>
        </label>
        <select
          id="paymentTerms"
          value={localDetails.paymentTerms}
          onChange={(e) => handleChange('paymentTerms', e.target.value)}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          required
        >
          <option value="">Select payment terms</option>
          {paymentTermsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="issueDate" className="block text-sm font-medium text-foreground">
          Issue Date <span className="text-error">*</span>
        </label>
        <input
          id="issueDate"
          type="date"
          value={localDetails.issueDate}
          onChange={(e) => handleChange('issueDate', e.target.value)}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="dueDate" className="block text-sm font-medium text-foreground">
          Due Date <span className="text-error">*</span>
        </label>
        <input
          id="dueDate"
          type="date"
          value={localDetails.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          min={localDetails.issueDate}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          required
        />
      </div>
    </div>
  );
};

export default InvoiceDetailsForm;