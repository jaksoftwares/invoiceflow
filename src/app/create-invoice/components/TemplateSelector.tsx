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

const TemplateSelector = ({ selectedTemplate, onTemplateChange, plan }: { selectedTemplate: string; onTemplateChange: (template: string) => void; plan: any }) => {
 const maxTemplates = plan?.max_templates_access || 3;
 const isUnlimited = maxTemplates === 0;

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-foreground">Select Template</h3>
 {!isUnlimited && (
 <span className="text-xs bg-muted px-3 py-1 rounded-full font-bold text-muted-foreground font-medium">
 {maxTemplates} Design{maxTemplates !== 1 ? 's' : ''} Included
 </span>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {templates.map((template, index) => {
 const isPremium = template.id.startsWith('premium_');
 const isLocked = !isUnlimited && index >= maxTemplates;
 
 return (
 <button
 key={template.id}
 type="button"
 onClick={() => {
 if (isLocked) {
 // If locked, we still allow selection but we'll handle the PAYG in the parent
 onTemplateChange(template.id);
 } else {
 onTemplateChange(template.id);
 }
 }}
 className={`flex flex-col p-4 text-left border-2 rounded-2xl transition-all relative overflow-hidden group ${
 selectedTemplate === template.id
 ? 'border-primary bg-primary/5 shadow-elevation-2'
 : isLocked 
 ? 'border-slate-100 dark:border-slate-800 bg-muted/30 grayscale-[0.5] opacity-80 hover:border-slate-200'
 : 'border-slate-100 dark:border-slate-800 bg-card hover:border-primary/30'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className={`font-bold uppercase tracking-tight text-sm ${selectedTemplate === template.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
 {template.name}
 </span>
 {isLocked && (
 <div className="flex items-center gap-1 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
 <Icon name="LockClosedIcon" size={10} />
 <span>PRO</span>
 </div>
 )}
 </div>
 {isPremium ? (
 <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-medium border border-amber-200 dark:border-amber-900/50">
 Premium
 </span>
 ) : (
 selectedTemplate === template.id && !isLocked && (
 <Icon name="CheckCircleIcon" size={18} className="text-primary" variant="solid" />
 )
 )}
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
 {template.description}
 </p>
 
 {isLocked && selectedTemplate === template.id && (
 <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40 animate-in fade-in slide-in-from-top-1">
 <Icon name="CurrencyDollarIcon" size={12} />
 <span>PAY AS YOU GO: 10 KES to unlock this design</span>
 </div>
 )}

 {selectedTemplate === template.id && !isLocked && (
 <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-3xl flex items-center justify-center">
 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
 </div>
 )}
 </button>
 );
 })}
 </div>
 </div>
 );
};

export default TemplateSelector;
