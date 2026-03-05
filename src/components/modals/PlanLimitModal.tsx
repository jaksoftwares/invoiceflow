import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { initiateStkPush } from '@/lib/mpesa';
import { checkPaymentStatus } from '@/lib/actions/subscription';
import { toast } from 'sonner';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  action: string;
  limit: number;
  current: number;
  allowPayg?: boolean;
}

const ACTION_LABELS: Record<string, { label: string, paygPrice: number }> = {
  invoices_created: { label: 'Invoices', paygPrice: 20 },
  emails_sent: { label: 'Email Sends', paygPrice: 5 },
  pdf_downloads: { label: 'PDF Downloads', paygPrice: 5 },
  templates_used: { label: 'Premium Templates', paygPrice: 10 },
  clients_created: { label: 'Clients', paygPrice: 10 },
  products_created: { label: 'Products', paygPrice: 10 },
  report_exports: { label: 'Report Exports', paygPrice: 50 },
};

export default function PlanLimitModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  action, 
  limit, 
  current, 
  allowPayg = false 
}: PlanLimitModalProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const info = ACTION_LABELS[action] || { label: action, paygPrice: 50 };

  // Polling for payment status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (activeRequestId) {
      pollInterval = setInterval(async () => {
        try {
          const { status } = await checkPaymentStatus(activeRequestId);
          if (status === 'completed') {
            clearInterval(pollInterval);
            toast.success('Payment verified! You can now proceed with your action.');
            setActiveRequestId(null);
            setIsProcessing(false);
            if (onSuccess) {
              onSuccess();
            } else {
              onClose();
              router.refresh();
            }
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            toast.error('Payment failed or was cancelled.');
            setActiveRequestId(null);
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeRequestId, onClose, router]);

  if (!isOpen) return null;

  const handlePayAsYouGo = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your M-Pesa number');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await initiateStkPush(phoneNumber, info.paygPrice, 'payg', action);
      if (result.success) {
        toast.info('STK Push sent! Please enter your PIN on your phone.');
        setActiveRequestId(result.checkoutRequestId || null);
      } else {
        toast.error(result.error || 'Failed to initiate payment');
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error('Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Polling Overlay */}
      {activeRequestId && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 z-[110] flex flex-col items-center justify-center p-8 text-center space-y-6 rounded-[2.5rem]">
           <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Icon name="ArrowPathIcon" size={32} className="text-primary" />
              </div>
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verifying Payment</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">We&apos;ve sent an STK push to your phone. Waiting for M-Pesa confirmation...</p>
           </div>
           <button 
             onClick={() => setActiveRequestId(null)}
             className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
           >
             Cancel Waiting
           </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-inner">
               <Icon name="ShieldExclamationIcon" size={32} />
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <Icon name="XMarkIcon" size={24} className="text-slate-400" />
            </button>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-2">
            Usage Limit Reached
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            You&apos;ve reached your monthly limit of <span className="text-slate-900 dark:text-white font-bold">{limit} {info.label}</span>. 
            Upgrade your plan for unlimited access or use Pay-As-You-Go for this specific action.
          </p>

          <div className="space-y-4">
            {/* Option 1: Upgrade */}
            <button
              onClick={() => {
                onClose();
                router.push('/dashboard/subscription');
              }}
              className="w-full flex items-center justify-between p-6 bg-primary text-white rounded-3xl shadow-elevation-3 hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                   <Icon name="ArrowTrendingUpIcon" size={20} />
                </div>
                <div>
                   <p className="font-black tracking-tight">Upgrade Plan</p>
                   <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Starting from KES 499</p>
                </div>
              </div>
              <Icon name="ChevronRightIcon" size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Option 2: PAYG (if allowed) */}
            {allowPayg ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center text-amber-600">
                      <Icon name="BoltIcon" size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white tracking-tight">One-time Access</p>
                      <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">KES {info.paygPrice} via M-Pesa</p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 border-dashed">PAYG</span>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="M-Pesa Number (07...)"
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                       <Icon name="PhoneIcon" size={18} />
                    </div>
                  </div>
                  <button
                    onClick={handlePayAsYouGo}
                    disabled={isProcessing}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Pay KES {info.paygPrice} Now</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Coming Soon</p>
                 <p className="text-sm font-black text-slate-900 dark:text-white opacity-50">Pay-As-You-Go is only for Pro Plans</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/20 p-6 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Checkout Powered by M-Pesa</p>
        </div>
      </div>
    </div>
  );
}
