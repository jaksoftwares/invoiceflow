const faqs = [
  {
    question: 'Is Invoiceflow free to use?',
    answer: 'Yes, we offer a free plan that allows you to create up to 5 invoices per month. For unlimited usage and advanced features, check out our Pro and Enterprise plans.',
  },
  {
    question: 'Can I customize my invoices?',
    answer: 'Absolutely! Invoiceflow offers customizable templates, your logo, branding colors, and the ability to add your own terms and conditions.',
  },
  {
    question: 'Is my data secure?',
    answer: 'We take security seriously. All data is encrypted, and we use industry-standard security measures to protect your information.',
  },
  {
    question: 'Can I integrate Invoiceflow with other tools?',
    answer: 'Yes, our Pro and Enterprise plans include integrations with popular accounting software like QuickBooks, Xero, and more.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards, PayPal, and bank transfers. For Enterprise customers, we can accommodate custom payment arrangements.',
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes! Free plan users get email support, while Pro and Enterprise users receive priority support with faster response times.',
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Have questions? We've got answers.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="bg-card p-6 rounded-lg shadow-elevation-1">
              <summary className="font-semibold text-foreground cursor-pointer list-none">
                <span className="flex items-center justify-between">
                  {faq.question}
                  <span className="text-primary text-xl">+</span>
                </span>
              </summary>
              <p className="text-muted-foreground mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}