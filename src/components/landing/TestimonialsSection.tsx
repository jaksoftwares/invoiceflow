import Icon from '@/components/ui/AppIcon';

const testimonials = [
  {
    quote: "Invoiceflow has transformed how we handle our invoicing. It's professional, efficient, and our clients love the clean invoices.",
    name: "Sarah Johnson",
    role: "Freelance Designer",
    avatar: "SJ",
  },
  {
    quote: "As a small business owner, I needed something simple yet powerful. Invoiceflow delivers on both fronts. Highly recommended!",
    name: "Michael Chen",
    role: "Small Business Owner",
    avatar: "MC",
  },
  {
    quote: "The automation features save us hours every week. Our accounting team can focus on strategy instead of data entry.",
    name: "Emily Rodriguez",
    role: "Operations Manager",
    avatar: "ER",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied businesses and freelancers using Invoiceflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card p-6 rounded-lg shadow-elevation-1">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="StarIcon" className="w-5 h-5 text-warning" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-foreground font-semibold">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}