'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: ClientFormData) => void;
}

interface ClientFormData {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  status: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
}

const AddClientModal = ({ isOpen, onClose, onSubmit }: AddClientModalProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    billing_frequency: 'monthly',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      billing_frequency: 'monthly',
      status: 'active',
    });
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Add New Client
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-smooth"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth resize-none"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Billing Frequency
                </label>
                <select
                  name="billing_frequency"
                  value={formData.billing_frequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-muted text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-smooth"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:-translate-y-[1px] hover:shadow-elevation-2 transition-smooth"
              >
                Add Client
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddClientModal;