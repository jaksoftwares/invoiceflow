'use client';

import { Building2, User, CheckCircle } from 'lucide-react';

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
    <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight">
            Tailored Benefits for Every Business
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you're a growing business or a solo freelancer, Invoiceflow adapts to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          {/* Businesses Card */}
          <div className="group relative bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                <Building2 size={120} />
             </div>

             <div className="flex flex-col relative z-10 h-full">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <Building2 size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 leading-tight">For Businesses</h3>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 flex-grow">
                   {businessBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-4 group/item">
                         <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center group-hover/item:bg-indigo-600 transition-colors">
                            <CheckCircle size={14} className="text-indigo-600 stroke-[3] group-hover/item:text-white transition-colors" />
                         </div>
                         <span className="text-gray-500 font-bold group-hover/item:text-gray-900 transition-colors">{benefit}</span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Freelancers Card */}
          <div className="group relative bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
                <User size={120} />
             </div>

             <div className="flex flex-col relative z-10 h-full">
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <User size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 leading-tight">For Freelancers</h3>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 flex-grow">
                   {freelancerBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-4 group/item">
                         <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover/item:bg-blue-600 transition-colors">
                            <CheckCircle size={14} className="text-blue-600 stroke-[3] group-hover/item:text-white transition-colors" />
                         </div>
                         <span className="text-gray-500 font-bold group-hover/item:text-gray-900 transition-colors">{benefit}</span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}