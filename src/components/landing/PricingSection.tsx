'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';

const plans = [
  {
    name: 'Free',
    price: 'KES 0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 Invoices per month',
      '2 Clients limit',
      'Basic templates',
      'Client management',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    price: 'KES 1,500',
    period: 'per month',
    description: 'For power freelancers',
    features: [
      '20 Invoices per month',
      '10 Clients limit',
      'Premium templates',
      'No watermark',
      'Priority support',
    ],
    cta: 'Choose Starter',
    popular: true,
  },
  {
    name: 'Business',
    price: 'KES 3,500',
    period: 'per month',
    description: 'For growing agencies',
    features: [
      'Unlimited Invoices',
      'Unlimited Clients',
      'Custom branding',
      'Team collaboration',
      'Advanced analytics',
    ],
    cta: 'Go Business',
    popular: false,
  },
  {
    name: 'Lifetime',
    price: 'KES 25,000',
    period: 'one-time',
    description: 'The ultimate investment',
    features: [
      'Everything in Business',
      'Pay once, use forever',
      'Early access to features',
      'Dedicated support',
      'Exclusive templates',
    ],
    cta: 'Get Lifetime',
    popular: false,
  },
];

export default function PricingSection() {
  const { user } = useAuth();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. Start free and upgrade as you grow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card p-8 rounded-lg shadow-elevation-1 relative flex flex-col ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-1">{plan.price}</div>
                <div className="text-muted-foreground">{plan.period}</div>
                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <Icon name="CheckIcon" className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={user ? "/dashboard/subscription" : "/auth/signup"}
                className={`w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-smooth ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                }`}
              >
                {user ? "View Plans" : plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}