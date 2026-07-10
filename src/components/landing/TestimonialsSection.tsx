'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "I used to spend my entire Sunday afternoon manually creating PDFs for my design clients. With InvoiceFlow, I just duplicate a past invoice, tweak the hours, and send. It literally takes me 5 minutes now.",
    name: "Sarah Johnson",
    role: "Freelance UX Designer",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "We were managing 50+ retainer clients using a messy spreadsheet and Word templates. Switching to InvoiceFlow reduced our outstanding invoices by 40% because of the clear dashboard and easy tracking.",
    name: "Michael Chen",
    role: "Founder, Peak Digital",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "The best part isn't just creating the invoices—it's how organized it keeps us. My accountant used to chase me down for records every tax season. Now I just give them access and they have everything.",
    name: "Emily Rodriguez",
    role: "Independent Contractor",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 scale-[3]">
             <Quote size={80} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight relative z-10">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of satisfied businesses and freelancers using Invoiceflow for their daily operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group flex flex-col bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-indigo-400 text-indigo-400 group-hover:fill-indigo-500 transition-colors" />
                ))}
              </div>
              
              <blockquote className="text-gray-500 font-bold italic text-lg leading-relaxed mb-10 flex-grow group-hover:text-gray-900 transition-colors">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-5 pt-8 border-t border-gray-50">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-2xl object-cover shadow-lg transition-transform group-hover:scale-110"
                />
                <div>
                  <div className="font-black text-gray-900 leading-none mb-1">{testimonial.name}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}