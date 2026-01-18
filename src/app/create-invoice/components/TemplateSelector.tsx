'use client';

import Icon from '@/components/ui/AppIcon';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
}

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector = ({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) => {
  const templates: Template[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and modern design with gradient header',
      preview: 'bg-gradient-to-r from-primary to-secondary',
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Bold colors with accent highlights',
      preview: 'bg-gradient-to-r from-accent to-primary',
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional business invoice layout',
      preview: 'bg-foreground',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant design',
      preview: 'bg-muted',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-semibold text-foreground">Invoice Template</h3>
        <Icon name="SwatchIcon" size={20} className="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onTemplateChange(template.id)}
            className={`relative p-4 bg-card border-2 rounded-md text-left transition-smooth hover:-translate-y-1 hover:shadow-elevation-2 ${
              selectedTemplate === template.id
                ? 'border-primary shadow-elevation-2'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className={`w-full h-24 ${template.preview} rounded-md mb-3`} />
            <h4 className="text-sm font-semibold text-foreground mb-1">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon name="CheckIcon" size={14} className="text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;