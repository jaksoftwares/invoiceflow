'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/cloudinary';

interface BusinessData {
  companyLogoUrl?: string;
  defaultTemplate: string;
  defaultPaymentTerms: string;
  defaultTaxRate: number;
  taxLabel: string;
  invoicePrefix: string;
  invoiceFooter: string;
  // Extended business info from profiles
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  industry: string;
}

interface BusinessTabProps {
  businessData?: BusinessData;
  onSave?: (data: BusinessData) => void;
}

const BusinessTab = ({ businessData: initialData, onSave }: BusinessTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessData, string>>>({});
  
  const [formData, setFormData] = useState<BusinessData>({
    companyLogoUrl: undefined,
    defaultTemplate: 'default',
    defaultPaymentTerms: 'net30',
    defaultTaxRate: 0,
    taxLabel: 'Tax',
    invoicePrefix: 'INV-',
    invoiceFooter: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    industry: '',
  });

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      // Fetch user settings (invoice settings)
      const settingsResponse = await fetch('/api/settings/business');
      
      // Fetch profile data for extended business info
      const profileResponse = await fetch('/api/settings/profile');
      
      const settingsData = settingsResponse.ok ? await settingsResponse.json() : {};
      const profileData = profileResponse.ok ? await profileResponse.json() : {};
      
      setFormData({
        companyLogoUrl: settingsData.company_logo_url,
        defaultTemplate: settingsData.default_template || 'default',
        defaultPaymentTerms: settingsData.default_payment_terms || 'net30',
        defaultTaxRate: settingsData.default_tax_rate || 0,
        taxLabel: settingsData.tax_label || 'Tax',
        invoicePrefix: settingsData.invoice_prefix || 'INV-',
        invoiceFooter: settingsData.invoice_footer || '',
        // Extended business info from profile
        businessName: profileData.business_name || '',
        businessEmail: profileData.email || '',
        businessPhone: profileData.phone || '',
        businessAddress: profileData.business_address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        zipCode: profileData.zip_code || '',
        country: profileData.country || '',
        website: '',
        industry: '',
      });
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessData, string>> = {};

    // Validate invoice settings
    if (!formData.defaultTemplate.trim()) {
      newErrors.defaultTemplate = 'Default template is required';
    }
    if (!formData.invoicePrefix.trim()) {
      newErrors.invoicePrefix = 'Invoice prefix is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BusinessData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      setIsUploading(true);
      try {
        const url = await uploadFile(file, 'invoiceflow_logos');
        handleInputChange('companyLogoUrl', url);
        toast.success('Business logo uploaded successfully');
      } catch (error) {
        console.error('Logo upload error:', error);
        toast.error('Failed to upload logo');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (isUploading) {
      toast.warning('Please wait for the image upload to finish.');
      return;
    }
    
    if (validateForm()) {
      try {
        // Update invoice/business settings
        const settingsResponse = await fetch('/api/settings/business', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_logo_url: formData.companyLogoUrl,
            default_template: formData.defaultTemplate,
            default_payment_terms: formData.defaultPaymentTerms,
            default_tax_rate: formData.defaultTaxRate,
            tax_label: formData.taxLabel,
            invoice_prefix: formData.invoicePrefix,
            invoice_footer: formData.invoiceFooter,
          }),
        });

        if (settingsResponse.ok) {
          toast.success('Business settings updated successfully');
          setIsEditing(false);
        } else {
          toast.error('Failed to update business settings');
        }
      } catch (error) {
        console.error('Error saving business settings:', error);
        toast.error('Failed to update business settings');
      }
    }
  };

  const handleCancel = () => {
    fetchBusinessData();
    setErrors({});
    setIsEditing(false);
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

      {/* Logo Section */}
      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Business Logo</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted">
            {formData.companyLogoUrl ? (
              <AppImage
                src={formData.companyLogoUrl}
                alt="Business Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <Icon name="BuildingOfficeIcon" size={32} />
              </div>
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
                disabled={isUploading}
              />
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium cursor-pointer transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <Icon name="CloudArrowUpIcon" size={18} />
                <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG up to 2MB. Recommended: 200x200px
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Invoice Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Invoice Prefix <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.invoicePrefix ? 'border-error' : ''}`}
            />
            {errors.invoicePrefix && (
              <p className="text-error text-xs mt-1">{errors.invoicePrefix}</p>
            )}
          </div>

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
              <option value="default">Default</option>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Payment Terms
            </label>
            <select
              value={formData.defaultPaymentTerms}
              onChange={(e) => handleInputChange('defaultPaymentTerms', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            >
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net45">Net 45</option>
              <option value="net60">Net 60</option>
              <option value="due_on_receipt">Due on Receipt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.defaultTaxRate}
              onChange={(e) => handleInputChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
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
              placeholder="e.g., VAT, GST, Tax"
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Invoice Footer Text
          </label>
          <textarea
            value={formData.invoiceFooter}
            onChange={(e) => handleInputChange('invoiceFooter', e.target.value)}
            disabled={!isEditing}
            rows={3}
            placeholder="Additional notes to appear at the bottom of invoices..."
            className={`w-full px-4 py-2 border rounded-md transition-smooth ${
              isEditing
                ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                : 'border-transparent bg-muted text-foreground cursor-not-allowed'
            }`}
          />
        </div>
      </div>

      {/* Business Info from Profile */}
      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Business Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Update your business details in the Profile tab to see them here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
            <div className="px-4 py-2 bg-muted rounded-md text-foreground">
              {formData.businessName || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <div className="px-4 py-2 bg-muted rounded-md text-foreground">
              {formData.businessEmail || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <div className="px-4 py-2 bg-muted rounded-md text-foreground">
              {formData.businessPhone || 'Not set'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <div className="px-4 py-2 bg-muted rounded-md text-foreground">
              {formData.businessAddress || 'Not set'}
            </div>
          </div>
        </div>
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
            disabled={isUploading}
            className={`px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessTab;
