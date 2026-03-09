'use client';

import { UserPlus, FileText, Send, DollarSign } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <UserPlus size={32} />,
    title: 'Sign Up & Set Up',
    description: 'Create your account and customize your business profile in minutes.',
  },
  {
    number: '02',
    icon: <FileText size={32} />,
    title: 'Create Invoices',
    description: 'Use our intuitive interface to create professional invoices with automated calculations.',
  },
  {
    number: '03',
    icon: <Send size={32} />,
    title: 'Send & Track',
    description: 'Send invoices via email and track their status in real-time.',
  },
  {
    number: '04',
    icon: <DollarSign size={32} />,
    title: 'Get Paid',
    description: 'Receive payments online and manage your cash flow effortlessly.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Get started with Invoiceflow in just four simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting Line Decoration */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-0.5 bg-indigo-50/50 z-0" />

          {steps.map((step, index) => (
            <div key={index} className="group flex flex-col items-center text-center relative z-10 transition-all duration-500">
              <div className="relative mb-10 h-28 w-28 flex items-center justify-center">
                 {/* Number Decoration */}
                 <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 text-5xl font-black text-indigo-50 opacity-50 transition-opacity group-hover:opacity-100">
                    {step.number}
                 </div>
                 
                 {/* Icon Background */}
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                    {step.icon}
                 </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed max-w-[240px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}