'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface BusinessSettings {
  companyLogo: string;
  defaultTemplate: string;
  paymentTerms: string;
  taxRate: string;
  taxLabel: string;
  invoicePrefix: string;
  invoiceFooter: string;
}

interface BusinessTabProps {
  businessSettings: BusinessSettings;
  onSave: (data: BusinessSettings) => void;
}

const BusinessTab = ({ businessSettings, onSave }: BusinessTabProps) => {
  const [formData, setFormData] = useState<BusinessSettings>(businessSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    { id: 'modern', name: 'Modern Professional' },
    { id: 'classic', name: 'Classic Business' },
    { id: 'minimal', name: 'Minimal Clean' },
    { id: 'creative', name: 'Creative Bold' },
  ];

  const paymentTermsOptions = [
    { value: 'net15', label: 'Net 15 Days' },
    { value: 'net30', label: 'Net 30 Days' },
    { value: 'net45', label: 'Net 45 Days' },
    { value: 'net60', label: 'Net 60 Days' },
    { value: 'due_on_receipt', label: 'Due on Receipt' },
  ];

  const handleInputChange = (field: keyof BusinessSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(businessSettings);
    setIsEditing(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('companyLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold text-foreground">Business Settings</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            <Icon name="PencilIcon" size={18} />
            <span>Edit Settings</span>
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Company Branding</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                {formData.companyLogo ? (
                  <AppImage
                    src={formData.companyLogo}
                    alt="Company logo preview showing business branding"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icon name="BuildingOfficeIcon" size={32} className="text-muted-foreground" />
                )}
              </div>
              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium cursor-pointer transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
                  >
                    <Icon name="ArrowUpTrayIcon" size={18} />
                    <span>Upload Logo</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPG up to 2MB. Recommended: 200x200px
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Invoice Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Template
            </label>
            <select
              value={formData.defaultTemplate}
              onChange={(e) => handleInputChange('defaultTemplate', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            >
              {paymentTermsOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => handleInputChange('taxRate', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tax Label
            </label>
            <input
              type="text"
              value={formData.taxLabel}
              onChange={(e) => handleInputChange('taxLabel', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., Sales Tax, VAT, GST"
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Invoice Number Prefix
            </label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., INV-, BILL-"
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Invoice Footer Text
            </label>
            <textarea
              value={formData.invoiceFooter}
              onChange={(e) => handleInputChange('invoiceFooter', e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Thank you for your business!"
              className={`w-full px-4 py-2 border rounded-md transition-smooth resize-none ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            <Icon name="EyeIcon" size={18} />
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </button>
        )}

        {showPreview && (
          <div className="mt-6 p-6 border-2 border-dashed border-border rounded-lg bg-muted">
            <div className="bg-card p-8 rounded-lg shadow-elevation-2">
              <div className="flex items-start justify-between mb-8">
                <div>
                  {formData.companyLogo && (
                    <div className="w-32 h-32 mb-4">
                      <AppImage
                        src={formData.companyLogo}
                        alt="Company logo in invoice preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-2xl font-heading font-bold text-foreground">INVOICE</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.invoicePrefix}00001
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date: 01/17/2026</p>
                  <p className="text-sm text-muted-foreground">Due: {formData.paymentTerms}</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-foreground">Item</th>
                      <th className="text-right py-2 text-sm font-medium text-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 text-sm text-foreground">Sample Service</td>
                      <td className="text-right py-3 text-sm text-foreground">$1,000.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-b border-border">
                      <td className="py-2 text-sm text-foreground">Subtotal</td>
                      <td className="text-right py-2 text-sm text-foreground">$1,000.00</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 text-sm text-foreground">
                        {formData.taxLabel} ({formData.taxRate}%)
                      </td>
                      <td className="text-right py-2 text-sm text-foreground">
                        ${(parseFloat(formData.taxRate || '0') * 10).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-base font-semibold text-foreground">Total</td>
                      <td className="text-right py-3 text-base font-semibold text-foreground">
                        ${(1000 + parseFloat(formData.taxRate || '0') * 10).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {formData.invoiceFooter && (
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">{formData.invoiceFooter}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessTab;