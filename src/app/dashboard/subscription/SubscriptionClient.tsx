'use client';

import { useState, useEffect } from 'react';
import { initiateStkPush } from '@/lib/mpesa';
import { checkPaymentStatus } from '@/lib/actions/subscription';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Zap, Shield, CreditCard, History, ArrowUpRight, BarChart, Loader2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';

interface SubscriptionClientProps {
  initialSubscription: any;
  initialUsage: any;
  plans: any[];
  payments: any[];
  userEmail: string | undefined;
}

export default function SubscriptionClient({ 
  initialSubscription, 
  initialUsage, 
  plans, 
  payments,
  userEmail
}: SubscriptionClientProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'alert' | 'error', text: string } | null>(null);
  const router = useRouter();

  const activePlan = initialSubscription?.plans || plans.find(p => p.name === 'Free');
  
  const handleUpgrade = async (plan: any) => {
    if (!phoneNumber) {
      setMessage({ type: 'error', text: 'Please enter your M-Pesa phone number first.' });
      return;
    }

    setLoading(plan.id);
    setMessage(null);

    try {
      const amount = plan.price_monthly || plan.price_lifetime;
      const result = await initiateStkPush(phoneNumber, amount, 'subscription', plan.id);
      
      if (result.success) {
        setActiveRequestId(result.checkoutRequestId || null);
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
      {/* Processing Overlay */}
      {activeRequestId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-primary/20 shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
              <div className="relative mx-auto w-24 h-24">
                 <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-pulse" />
                 </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">Payment Processing</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Please authorize the KES {plans.find(p => p.id === loading)?.price_monthly || '---'} payment on your phone.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                 <p className="text-xs font-black text-primary uppercase tracking-widest leading-loose">Waiting for M-Pesa Confirmation...</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border p-8 shadow-elevation-1">
          <div className="flex items-center gap-3 mb-8">
            <BarChart className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-heading font-semibold">Current Usage</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

        {/* M-Pesa Checkout Card */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border-2 border-primary/30 p-8 shadow-elevation-2 flex flex-col justify-center">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <CreditCard className="text-primary w-5 h-5" />
              </div>
              <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Payment Details</h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
              Link your M-Pesa phone number to enable <span className="text-primary font-bold">one-click upgrades</span> and instant <span className="text-accent font-bold">PAYG</span> purchases.
            </p>
            
            <div className="space-y-5">
              <div className="space-y-2">
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
                    className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 ml-1">
                  We'll send an STK push to this number for all transactions.
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                    : message.type === 'alert'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  <div className={`p-1.5 rounded-full ${
                    message.type === 'success' ? 'bg-emerald-500/20' : 
                    message.type === 'alert' ? 'bg-amber-500/20' : 
                    'bg-rose-500/20'
                  }`}>
                    {message.type === 'alert' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Icon name={message.type === 'success' ? 'CheckIcon' : 'XMarkIcon'} size={14} />
                    )}
                  </div>
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      payment.status === 'completed' ? 'bg-success/10 text-success' : 
                      payment.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-error/10 text-error'
                    }`}>
                      {payment.status}
                    </span>
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
    </div>
  );
}
