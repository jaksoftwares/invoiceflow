'use client';

import Icon from '@/components/ui/AppIcon';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const templates = [
  { id: 'default', name: 'InvoiceFlow', description: 'Default template with InvoiceFlow branding' },
  { id: 'professional', name: 'Business Classic', description: 'Professional design with logo support' },
  { id: 'modern', name: 'Modern', description: 'Sleek sidebar layout with logo support' },
  { id: 'classic', name: 'Classic', description: 'Traditional serif typography with logo' },
  { id: 'minimal', name: 'Minimal', description: 'Clean design with logo support' },
  { id: 'executive', name: 'Executive', description: 'Premium dark theme with logo' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated serif design with logo' },
  { id: 'simple', name: 'Simple Plain', description: 'Plain design - no logo required' },
  { id: 'creative', name: 'Creative', description: 'Colorful design - no logo required' },
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
