'use client';

import Icon from '@/components/ui/AppIcon';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const templates = [
  { id: 'default', name: 'InvoiceFlow Default', description: 'Original template with branding and watermark' },
  { id: 'invoiceflow_clean', name: 'InvoiceFlow Clean', description: 'Professional layout without watermarks' },
  { id: 'invoiceflow_business', name: 'InvoiceFlow Business', description: 'Elegant business-first professional design' },
  { id: 'invoiceflow_modern', name: 'InvoiceFlow Modern', description: 'Sleek compact professional styling' },
  { id: 'invoiceflow_enterprise', name: 'InvoiceFlow Enterprise', description: 'Strict enterprise-grade formal design' },
  { id: 'invoiceflow_luxe', name: 'InvoiceFlow Luxe', description: 'Premium minimal professional aesthetic' },
  { id: 'premium_corporate', name: 'Corporate Elite', description: 'Ultra-professional corporate design' },
  { id: 'premium_modern', name: 'Modern Pro', description: 'Sleek, contemporary professional layout' },
  { id: 'premium_classic', name: 'Classic Executive', description: 'Timeless professional executive design' },
  { id: 'premium_minimal', name: 'Minimal Luxe', description: 'Clean, minimalist premium aesthetic' },
  { id: 'premium_bold', name: 'Bold Professional', description: 'Strong, impactful professional design' },
  { id: 'professional', name: 'Business Classic', description: 'Standard professional design' },
  { id: 'modern', name: 'Modern Sidebar', description: 'Sidebar layout with logo support' },
  { id: 'classic', name: 'Classic Serif', description: 'Traditional serif typography' },
  { id: 'minimal', name: 'Minimal Simple', description: 'Basic clean design' },
  { id: 'executive', name: 'Executive Dark', description: 'Dark balanced accent theme' },
  { id: 'elegant', name: 'Elegant Boutique', description: 'Sophisticated design' },
  { id: 'simple', name: 'Simple Plain', description: 'Plain text - no logo' },
  { id: 'creative', name: 'Creative Gradient', description: 'Bold artistic design' },
];

const TemplateSelector = ({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold text-foreground">Select Template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onTemplateChange(template.id)}
            className={`flex flex-col p-4 text-left border rounded-lg transition-smooth ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">{template.name}</span>
              {selectedTemplate === template.id && (
                <Icon name="CheckCircleIcon" size={20} className="text-primary" variant="solid" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
