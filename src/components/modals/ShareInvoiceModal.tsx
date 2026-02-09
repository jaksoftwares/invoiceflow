'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface ShareInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  clientEmail: string;
  invoiceNumber: string;
  onSendEmail: (data: { to: string; subject: string; message: string; copyMe: boolean }) => Promise<void>;
  onCopyLink: () => Promise<void>;
  onWhatsAppShare: () => void;
}

const ShareInvoiceModal = ({
  isOpen,
  onClose,
  invoiceId,
  clientEmail,
  invoiceNumber,
  onSendEmail,
  onCopyLink,
  onWhatsAppShare,
}: ShareInvoiceModalProps) => {
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'whatsapp'>('email');
  const [emailTo, setEmailTo] = useState(clientEmail || '');
  const [emailSubject, setEmailSubject] = useState(`Invoice ${invoiceNumber} from InvoiceFlow`);
  const [emailMessage, setEmailMessage] = useState(`Hi,\n\nPlease find attached the invoice ${invoiceNumber} for your recent purchase.\n\nThank you for your business!`);
  const [copyMe, setCopyMe] = useState(true);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    if (!emailTo) {
      toast.error('Please enter a recipient email');
      return;
    }
    
    setIsSending(true);
    try {
      await onSendEmail({
        to: emailTo,
        subject: emailSubject,
        message: emailMessage,
        copyMe
      });
      // Don't close immediately, let the parent handle success toast/close or do it here
      // But typically we wait for parent.
    } catch (error) {
      console.error(error);
      // Toast handled by parent or here? Let's assume parent throws if fails.
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
      await onCopyLink();
      toast.success('Invoice link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-elevation-3 border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 flex-shrink-0">
          <h2 className="text-lg font-heading font-semibold text-foreground">Share Invoice {invoiceNumber}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'email' 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name="EnvelopeIcon" size={18} />
            Email
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'link' 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name="LinkIcon" size={18} />
            Link
          </button>
           <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'whatsapp' 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name="ChatBubbleLeftRightIcon" size={18} />
            WhatsApp
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">To</label>
                <input 
                  type="email" 
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="client@example.com"
                />
              </div>

               <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

               <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">Message</label>
                <textarea 
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="copyMe" 
                  checked={copyMe}
                  onChange={(e) => setCopyMe(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="copyMe" className="text-sm text-foreground">Send a copy to me</label>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-smooth disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                     <>
                       <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                       <span>Sending...</span>
                     </>
                  ) : (
                    <>
                      <Icon name="PaperAirplaneIcon" size={18} />
                      <span>Send Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-6 text-center py-4">
               <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                  <Icon name="LinkIcon" size={32} className="text-muted-foreground" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Copy Public Link</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Anyone with this link can view and download the invoice PDF.
                  </p>
               </div>
               
               <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border border-border overflow-hidden">
                  <code className="bg-transparent flex-1 text-xs text-foreground font-mono truncate text-left pl-2 select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/invoice/view/${invoiceId}` : '...'}
                  </code>
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 bg-background hover:bg-muted border border-border rounded-md text-foreground transition-smooth flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <Icon name="DocumentDuplicateIcon" size={16} />
                  </button>
               </div>
            </div>
          )}

           {activeTab === 'whatsapp' && (
            <div className="space-y-6 text-center py-4">
               <div className="mx-auto w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-2">
                  <Icon name="ChatBubbleLeftRightIcon" size={32} className="text-[#25D366]" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Share via WhatsApp</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Send the invoice link directly to your client on WhatsApp.
                  </p>
               </div>
               
               <button 
                  onClick={onWhatsAppShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-md font-medium hover:bg-[#128C7E] transition-smooth"
                >
                  <Icon name="PaperAirplaneIcon" size={18} />
                  <span>Open WhatsApp</span>
                </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ShareInvoiceModal;
