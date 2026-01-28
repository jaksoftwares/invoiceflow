import Icon from '@/components/ui/AppIcon';

const features = [
  {
    icon: 'DocumentTextIcon',
    title: 'Invoice Creation',
    description: 'Create professional invoices in minutes with customizable templates and automated calculations.',
  },
  {
    icon: 'EyeIcon',
    title: 'Invoice Tracking',
    description: 'Monitor the status of all your invoices with real-time updates and payment notifications.',
  },
  {
    icon: 'CreditCardIcon',
    title: 'Payment Management',
    description: 'Accept payments online and track payment history for better cash flow management.',
  },
  {
    icon: 'ChartBarIcon',
    title: 'Reports & Analytics',
    description: 'Generate detailed reports on revenue, client performance, and business insights.',
  },
  {
    icon: 'UsersIcon',
    title: 'Client Management',
    description: 'Organize and manage your client database with ease, including contact info and history.',
  },
  {
    icon: 'BoltIcon',
    title: 'Automation',
    description: 'Automate recurring invoices, reminders, and follow-ups to save time and reduce errors.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your invoicing process efficiently and professionally.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-smooth"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary rounded-lg mr-4">
                  <Icon name={feature.icon} className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}