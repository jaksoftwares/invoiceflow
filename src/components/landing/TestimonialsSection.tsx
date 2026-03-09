'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Invoiceflow has transformed how we handle our invoicing. It's professional, efficient, and our clients love the clean, branded invoices we send.",
    name: "Sarah Johnson",
    role: "Freelance Designer",
    avatar: "SJ",
    color: "indigo"
  },
  {
    quote: "As a small business owner, I needed something simple yet powerful. Invoiceflow delivers on both fronts. Implementation was seamless and smooth.",
    name: "Michael Chen",
    role: "Agency Founder",
    avatar: "MC",
    color: "blue"
  },
  {
    quote: "The automation features save us hours every week. Our accounting team can focus on strategy instead of tedious data entry and tracking.",
    name: "Emily Rodriguez",
    role: "Operations Manager",
    avatar: "ER",
    color: "purple"
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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${
                    testimonial.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                    testimonial.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    'bg-purple-50 text-purple-600'
                }`}>
                  {testimonial.avatar}
                </div>
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