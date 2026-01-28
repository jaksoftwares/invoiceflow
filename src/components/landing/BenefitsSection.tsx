import Icon from '@/components/ui/AppIcon';

const businessBenefits = [
  'Streamline invoicing processes for your team',
  'Maintain professional branding across all invoices',
  'Improve cash flow with faster payment tracking',
  'Generate detailed financial reports',
  'Integrate with accounting software',
  'Scale operations without increasing overhead',
];

const freelancerBenefits = [
  'Create invoices in under 5 minutes',
  'Look professional to clients and agencies',
  'Track payments and follow up automatically',
  'Manage multiple clients effortlessly',
  'Focus on your work, not admin tasks',
  'Grow your business with better organization',
];

export default function BenefitsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Benefits for Businesses & Freelancers
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're a growing business or a solo freelancer, Invoiceflow adapts to your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Businesses */}
          <div className="bg-card p-8 rounded-lg shadow-elevation-1">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary rounded-lg mr-4">
                <Icon name="BuildingOfficeIcon" className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">For Businesses</h3>
            </div>
            <ul className="space-y-3">
              {businessBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Icon name="CheckCircleIcon" className="w-5 h-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Freelancers */}
          <div className="bg-card p-8 rounded-lg shadow-elevation-1">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-accent rounded-lg mr-4">
                <Icon name="UserIcon" className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">For Freelancers</h3>
            </div>
            <ul className="space-y-3">
              {freelancerBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Icon name="CheckCircleIcon" className="w-5 h-5 text-success mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}