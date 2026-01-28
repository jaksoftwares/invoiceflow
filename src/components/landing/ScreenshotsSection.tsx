const screenshots = [
  {
    title: 'Dashboard Overview',
    description: 'Get a quick overview of your business metrics and recent activities.',
  },
  {
    title: 'Invoice Creation',
    description: 'Intuitive interface for creating professional invoices in minutes.',
  },
  {
    title: 'Client Management',
    description: 'Organize and manage all your client information in one place.',
  },
  {
    title: 'Reports & Analytics',
    description: 'Detailed insights into your revenue, client performance, and more.',
  },
];

export default function ScreenshotsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            See Invoiceflow in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the clean, intuitive interface designed to make invoicing effortless.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="bg-card p-6 rounded-lg shadow-elevation-1">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-foreground font-bold text-xl">{index + 1}</span>
                  </div>
                  <p className="text-muted-foreground">Screenshot Placeholder</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{screenshot.title}</h3>
              <p className="text-muted-foreground">{screenshot.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}