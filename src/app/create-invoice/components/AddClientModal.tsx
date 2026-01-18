'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: { id: string; name: string; email: string; company: string }) => void;
}

const AddClientModal = ({ isOpen, onClose, onClientAdded }: AddClientModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      id: `client-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      company: formData.company,
    };
    onClientAdded(newClient);
    setFormData({ name: '', email: '', company: '', phone: '', address: '' });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-md shadow-elevation-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-foreground">Add New Client</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-md transition-smooth"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientName" className="block text-sm font-medium text-foreground">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientEmail" className="block text-sm font-medium text-foreground">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  id="clientEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientCompany" className="block text-sm font-medium text-foreground">
                  Company Name <span className="text-error">*</span>
                </label>
                <input
                  id="clientCompany"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientPhone" className="block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <input
                  id="clientPhone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="clientAddress" className="block text-sm font-medium text-foreground">
                Business Address
              </label>
              <textarea
                id="clientAddress"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Business Street, Suite 100, City, State 12345"
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-muted text-foreground rounded-md text-sm font-medium transition-smooth hover:opacity-80"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
              >
                <Icon name="CheckIcon" size={18} />
                <span>Add Client</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddClientModal;