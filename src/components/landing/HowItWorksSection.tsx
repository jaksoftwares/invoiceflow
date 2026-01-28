import Icon from '@/components/ui/AppIcon';

const steps = [
  {
    number: 1,
    icon: 'UserPlusIcon',
    title: 'Sign Up & Set Up',
    description: 'Create your account and customize your business profile in minutes.',
  },
  {
    number: 2,
    icon: 'DocumentTextIcon',
    title: 'Create Invoices',
    description: 'Use our intuitive interface to create professional invoices with automated calculations.',
  },
  {
    number: 3,
    icon: 'PaperAirplaneIcon',
    title: 'Send & Track',
    description: 'Send invoices via email and track their status in real-time.',
  },
  {
    number: 4,
    icon: 'CurrencyDollarIcon',
    title: 'Get Paid',
    description: 'Receive payments online and manage your cash flow effortlessly.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with Invoiceflow in just four simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name={step.icon} className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">{step.number}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}