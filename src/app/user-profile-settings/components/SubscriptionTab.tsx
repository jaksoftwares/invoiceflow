'use client';

import Icon from '@/components/ui/AppIcon';

interface SubscriptionPlan {
  name: string;
  price: string;
  billingCycle: string;
  features: string[];
  current: boolean;
}

interface UsageStats {
  invoicesSent: number;
  invoicesLimit: number;
  clientsAdded: number;
  clientsLimit: number;
  storageUsed: number;
  storageLimit: number;
}

interface SubscriptionTabProps {
  currentPlan: SubscriptionPlan;
  usageStats: UsageStats;
  onUpgrade: () => void;
  onCancelSubscription: () => void;
}

const SubscriptionTab = ({ currentPlan, usageStats, onUpgrade, onCancelSubscription }: SubscriptionTabProps) => {
  const plans: SubscriptionPlan[] = [
    {
      name: 'Starter',
      price: '$19',
      billingCycle: 'per month',
      features: [
        'Up to 50 invoices per month',
        'Up to 25 clients',
        '5GB storage',
        'Basic templates',
        'Email support',
      ],
      current: currentPlan.name === 'Starter',
    },
    {
      name: 'Professional',
      price: '$49',
      billingCycle: 'per month',
      features: [
        'Up to 200 invoices per month',
        'Up to 100 clients',
        '25GB storage',
        'Premium templates',
        'Priority email support',
        'Advanced analytics',
        'Custom branding',
      ],
      current: currentPlan.name === 'Professional',
    },
    {
      name: 'Enterprise',
      price: '$99',
      billingCycle: 'per month',
      features: [
        'Unlimited invoices',
        'Unlimited clients',
        '100GB storage',
        'All premium templates',
        '24/7 phone & email support',
        'Advanced analytics & reports',
        'Custom branding',
        'API access',
        'Dedicated account manager',
      ],
      current: currentPlan.name === 'Enterprise',
    },
  ];

  const calculatePercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold text-foreground">Subscription & Billing</h2>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Current Plan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You are currently on the {currentPlan.name} plan
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-heading font-bold text-foreground">{currentPlan.price}</p>
            <p className="text-sm text-muted-foreground">{currentPlan.billingCycle}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Icon name="CheckCircleIcon" size={18} className="text-success" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            <Icon name="ArrowUpCircleIcon" size={18} />
            <span>Upgrade Plan</span>
          </button>
          <button
            onClick={onCancelSubscription}
            className="px-6 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Usage Statistics</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Invoices Sent</span>
              <span className="text-sm text-muted-foreground">
                {usageStats.invoicesSent} / {usageStats.invoicesLimit}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-smooth"
                style={{ width: `${calculatePercentage(usageStats.invoicesSent, usageStats.invoicesLimit)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Clients Added</span>
              <span className="text-sm text-muted-foreground">
                {usageStats.clientsAdded} / {usageStats.clientsLimit}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-smooth"
                style={{ width: `${calculatePercentage(usageStats.clientsAdded, usageStats.clientsLimit)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {usageStats.storageUsed}GB / {usageStats.storageLimit}GB
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary transition-smooth"
                style={{ width: `${calculatePercentage(usageStats.storageUsed, usageStats.storageLimit)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 border-2 rounded-lg transition-smooth ${
                plan.current
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:shadow-elevation-2'
              }`}
            >
              <div className="text-center mb-4">
                <h4 className="text-xl font-heading font-semibold text-foreground">{plan.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-heading font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.billingCycle}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Icon name="CheckIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.current ? (
                <div className="w-full py-2 bg-primary/10 text-primary text-center rounded-md text-sm font-medium">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={onUpgrade}
                  className="w-full py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
                >
                  {plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-foreground">Date</th>
                <th className="text-left py-3 text-sm font-medium text-foreground">Description</th>
                <th className="text-right py-3 text-sm font-medium text-foreground">Amount</th>
                <th className="text-right py-3 text-sm font-medium text-foreground">Status</th>
                <th className="text-right py-3 text-sm font-medium text-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-foreground">01/01/2026</td>
                <td className="py-3 text-sm text-foreground">{currentPlan.name} Plan - Monthly</td>
                <td className="text-right py-3 text-sm text-foreground">{currentPlan.price}</td>
                <td className="text-right py-3">
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Paid</span>
                </td>
                <td className="text-right py-3">
                  <button className="text-primary text-sm font-medium transition-smooth hover:underline">
                    Download
                  </button>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 text-sm text-foreground">12/01/2025</td>
                <td className="py-3 text-sm text-foreground">{currentPlan.name} Plan - Monthly</td>
                <td className="text-right py-3 text-sm text-foreground">{currentPlan.price}</td>
                <td className="text-right py-3">
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Paid</span>
                </td>
                <td className="text-right py-3">
                  <button className="text-primary text-sm font-medium transition-smooth hover:underline">
                    Download
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-foreground">11/01/2025</td>
                <td className="py-3 text-sm text-foreground">{currentPlan.name} Plan - Monthly</td>
                <td className="text-right py-3 text-sm text-foreground">{currentPlan.price}</td>
                <td className="text-right py-3">
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">Paid</span>
                </td>
                <td className="text-right py-3">
                  <button className="text-primary text-sm font-medium transition-smooth hover:underline">
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTab;