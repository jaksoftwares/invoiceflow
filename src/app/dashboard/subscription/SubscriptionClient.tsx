'use client';

import { useState, useEffect } from 'react';
import { initiateStkPush } from '@/lib/mpesa';
import { checkPaymentStatus } from '@/lib/actions/subscription';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Zap, Shield, CreditCard, History, ArrowUpRight, BarChart, Loader2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

interface SubscriptionClientProps {
  initialSubscription: any;
  initialUsage: any;
  plans: any[];
  payments: any[];
  userEmail: string | undefined;
  initialPhone: string;
}

export default function SubscriptionClient({ 
  initialSubscription, 
  initialUsage, 
  plans, 
  payments,
  userEmail,
  initialPhone
}: SubscriptionClientProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
  const [loading, setLoading] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'alert' | 'error', text: string } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ plan: string, amount: number } | null>(null);
  const router = useRouter();

  const activePlan = initialSubscription?.plans || plans.find(p => p.name === 'Free');
  
  const handleUpgrade = (plan: any) => {
    setSelectedPlanForUpgrade(plan);
    setShowUpgradeModal(true);
    setMessage(null);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    
    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter a valid M-Pesa phone number.' });
      return;
    }

    setLoading(selectedPlanForUpgrade.id);
    setMessage(null);

    try {
      const amount = selectedPlanForUpgrade.price_monthly || selectedPlanForUpgrade.price_lifetime;
      const result = await initiateStkPush(phoneNumber, amount, 'subscription', selectedPlanForUpgrade.id);
      
      if (result.success) {
        setActiveRequestId(result.checkoutRequestId || null);
        setShowUpgradeModal(false); // Close modal while processing push
        setMessage({ 
          type: 'alert', 
          text: 'STK Push sent! Please enter your M-Pesa PIN on your phone. We are waiting for confirmation...' 
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to initiate payment.' });
        setLoading(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      setLoading(null);
    }
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (activeRequestId) {
      pollInterval = setInterval(async () => {
        try {
          const { status } = await checkPaymentStatus(activeRequestId);
          
          if (status === 'completed') {
            clearInterval(pollInterval);
            const plan = plans.find(p => p.id === loading);
            if (plan) {
              setSuccessData({ plan: plan.name, amount: plan.price_monthly || plan.price_lifetime });
              setShowSuccessModal(true);
            }
            setActiveRequestId(null);
            setLoading(null);
            setMessage({ type: 'success', text: 'Payment successful! Your plan has been upgraded.' });
            
            // Revalidate and refresh
            router.refresh();
            
            // Optional: Hide success message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setActiveRequestId(null);
            setLoading(null);
            setMessage({ type: 'error', text: 'Payment was cancelled or failed. Please try again.' });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeRequestId, router]);

  const calculateUsagePercent = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Processing Modal - Less restrictive than full overlay */}
      {activeRequestId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-primary/20 shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in slide-in-from-bottom-4 duration-300">
              <div className="relative mx-auto w-20 h-20">
                 <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="PhoneIcon" size={32} className="text-primary animate-pulse" />
                 </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Authorize Payment</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  We&apos;ve sent an STK push to <span className="text-slate-900 dark:text-white font-bold">{phoneNumber}</span>. <br/>
                  Please enter your M-Pesa PIN.
                </p>
              </div>
              <div className="pt-2">
                 <button 
                  onClick={() => setActiveRequestId(null)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                 >
                   Check Later
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-3xl border border-primary/20">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">My Subscription</h1>
          <p className="text-muted-foreground text-lg">Manage your plan, track usage, and view billing history.</p>
        </div>
        <div className="bg-card p-6 rounded-2xl shadow-elevation-2 border border-border flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
            <p className="text-2xl font-bold text-foreground capitalize">{activePlan?.name}</p>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-elevation-1">
        <div className="flex items-center gap-3 mb-8">
          <BarChart className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-heading font-semibold">Current Usage</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Invoices Usage */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-medium text-foreground">Invoices Created</p>
                <p className="text-sm text-muted-foreground">This billing cycle</p>
              </div>
              <span className="text-lg font-bold">
                {initialUsage?.invoices_created || 0} / {activePlan?.max_invoices_per_month === 0 ? '∞' : activePlan?.max_invoices_per_month}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${calculateUsagePercent(initialUsage?.invoices_created || 0, activePlan?.max_invoices_per_month)}%` }}
              />
            </div>
          </div>

          {/* Clients Usage */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-medium text-foreground">Clients Added</p>
                <p className="text-sm text-muted-foreground">Account lifetime</p>
              </div>
              <span className="text-lg font-bold">
                {initialUsage?.clients_created || 0} / {activePlan?.max_clients === 0 ? '∞' : activePlan?.max_clients}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${calculateUsagePercent(initialUsage?.clients_created || 0, activePlan?.max_clients)}%` }}
              />
            </div>
          </div>

          {/* Email Sends Usage */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-medium text-foreground">Emails Sent</p>
                <p className="text-sm text-muted-foreground">This billing cycle</p>
              </div>
              <span className="text-lg font-bold">
                {initialUsage?.emails_sent || 0} / {activePlan?.max_email_sends === 0 ? '∞' : activePlan?.max_email_sends}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-500 ease-out"
                style={{ width: `${calculateUsagePercent(initialUsage?.emails_sent || 0, activePlan?.max_email_sends)}%` }}
              />
            </div>
          </div>

          {/* Products Usage */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-medium text-foreground">Products Added</p>
                <p className="text-sm text-muted-foreground">Account lifetime</p>
              </div>
              <span className="text-lg font-bold">
                {initialUsage?.products_created || 0} / {activePlan?.max_products === 0 ? '∞' : activePlan?.max_products}
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-success transition-all duration-500 ease-out"
                style={{ width: `${calculateUsagePercent(initialUsage?.products_created || 0, activePlan?.max_products)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {message && message.type !== 'success' && (
        <div className={`p-6 rounded-3xl border-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 ${
          message.type === 'alert'
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className={`p-2 rounded-full ${
            message.type === 'alert' ? 'bg-amber-500/20' : 'bg-rose-500/20'
          }`}>
            {message.type === 'alert' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Icon name="XMarkIcon" size={20} />
            )}
          </div>
          <div>
            <p className="font-bold">{message.text}</p>
          </div>
        </div>
      )}

      {/* Plans Selection */}
      <h2 className="text-3xl font-heading font-bold mt-12 mb-8 text-center">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border-2 transition-smooth hover:shadow-elevation-3 ${
              activePlan?.id === plan.id 
                ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                : 'border-border bg-card'
            }`}
          >
            {activePlan?.id === plan.id && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Current Plan
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 capitalize">{plan.name}</h3>
              <p className="text-sm text-muted-foreground h-12 line-clamp-2">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-heading font-bold">KES {plan.name === 'Lifetime' ? plan.price_lifetime : plan.price_monthly}</span>
                <span className="text-muted-foreground text-sm">/{plan.name === 'Lifetime' ? 'one-time' : 'mo'}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <span>{plan.max_invoices_per_month === 0 ? 'Unlimited' : plan.max_invoices_per_month} Invoices/mo</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <span>{plan.max_clients === 0 ? 'Unlimited' : plan.max_clients} Clients</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
                <span>{plan.max_templates_access === 0 ? 'All' : plan.max_templates_access} Templates</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                {plan.watermark_enabled ? (
                  <XCircle className="w-5 h-5 text-error shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                )}
                <span>No Watermark</span>
              </li>
              {plan.allow_branding && (
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <span>Custom Branding</span>
                </li>
              )}
            </ul>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={activePlan?.id === plan.id || loading === plan.id}
              className={`w-full py-4 rounded-xl font-bold transition-smooth flex items-center justify-center gap-2 ${
                activePlan?.id === plan.id
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-elevation-2'
              }`}
            >
              {loading === plan.id ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : activePlan?.id === plan.id ? (
                'Active'
              ) : (
                <>
                  {plan.price_monthly > (activePlan?.price_monthly || 0) || plan.name === 'Lifetime' ? 'Upgrade' : 'Switch'} 
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="mt-16 bg-card rounded-3xl border border-border shadow-elevation-1 overflow-hidden">
        <div className="p-8 border-b border-border flex items-center gap-3">
          <History className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-heading font-semibold">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="px-8 py-4 font-medium">Date</th>
                <th className="px-8 py-4 font-medium">Description</th>
                <th className="px-8 py-4 font-medium">Receipt</th>
                <th className="px-8 py-4 font-medium">Amount</th>
                <th className="px-8 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length > 0 ? payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-8 py-4 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-4 font-medium capitalize">{payment.payment_type} Payment</td>
                  <td className="px-8 py-4 text-sm font-mono">{payment.mpesa_receipt_number || '---'}</td>
                  <td className="px-8 py-4 font-bold">KES {payment.amount}</td>
                  <td className="px-8 py-4 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      payment.status === 'completed' ? 'bg-success/10 text-success' : 
                      payment.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-error/10 text-error'
                    }`}>
                      {payment.status}
                    </span>
                    {payment.status === 'pending' && payment.checkout_request_id && (
                      <button 
                        onClick={async () => {
                          const { status } = await checkPaymentStatus(payment.checkout_request_id);
                          if (status === 'completed') {
                            toast.success('Payment confirmed!');
                            router.refresh();
                          } else {
                            toast.info(`Payment status is still ${status}`);
                          }
                        }}
                        className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-primary"
                        title="Check status"
                      >
                         <Icon name="ArrowPathIcon" size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-muted-foreground">
                    No transactions found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Choice Modal */}
      {showUpgradeModal && selectedPlanForUpgrade && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 p-8 border-b border-primary/10">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                       <CreditCard className="text-primary w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Secure Upgrade</h2>
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Complete your payment via M-Pesa</p>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Selected Plan</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white capitalize">{selectedPlanForUpgrade.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Price</p>
                        <p className="text-lg font-black text-primary uppercase">KES {selectedPlanForUpgrade.price_monthly || selectedPlanForUpgrade.price_lifetime}</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">
                       M-Pesa Phone Number
                    </label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                          <span className="text-sm font-bold">+254</span>
                       </div>
                       <input 
                         type="text" 
                         placeholder="712345678"
                         value={phoneNumber}
                         onChange={(e) => setPhoneNumber(e.target.value)}
                         className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                       />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 ml-1 text-center italic">
                       An STK push will be sent to this number.
                    </p>
                 </div>

                 {message && message.type === 'error' && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
                       <Icon name="XMarkIcon" size={16} />
                       <span className="text-xs font-bold">{message.text}</span>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <button 
                      onClick={() => setShowUpgradeModal(false)}
                      className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmUpgrade}
                      disabled={loading === selectedPlanForUpgrade.id}
                      className="py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {loading === selectedPlanForUpgrade.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Confirm & Pay
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Success Success Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
              <div className="relative bg-emerald-500 py-12 px-8 text-center text-white overflow-hidden">
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                 
                 <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30 animate-bounce">
                       <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Upgrade Successful!</h2>
                    <p className="text-emerald-50 font-bold opacity-90 capitalize">Welcome to the {successData!.plan} Plan</p>
                 </div>
              </div>

              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-border">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Impact</p>
                       <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">KES {successData!.amount}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest">
                          <Icon name="CheckBadgeIcon" size={14} />
                          Active
                       </span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                       Payment confirmed! We&apos;ve issued an automated receipt to <span className="text-primary font-black underline decoration-primary/30">{userEmail}</span>. Your new limits are active immediately.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                       <button 
                         onClick={() => {
                           setShowSuccessModal(false);
                           router.push('/dashboard');
                         }}
                         className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-elevation-2 hover:shadow-elevation-4 hover:-translate-y-1 transition-all"
                       >
                         Enter Dashboard
                       </button>
                       <button 
                         onClick={() => setShowSuccessModal(false)}
                         className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                       >
                         Stay on Billing
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
