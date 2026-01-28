import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Streamline Your Invoicing with Invoiceflow
        </h1>
        <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
          Create, track, and manage invoices effortlessly. Perfect for businesses and freelancers who value efficiency and professionalism.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg shadow-elevation-2 hover:shadow-elevation-3 transition-smooth transform hover:scale-105"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground hover:text-primary transition-smooth"
          >
            Learn More
          </Link>
        </div>
      </div>
      {/* Optional background pattern or image */}
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
    </section>
  );
}