'use client';

import { 
  FileText, 
  Eye, 
  CreditCard, 
  BarChart, 
  Users, 
  Zap,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';

const features = [
  {
    icon: <FileText size={24} />,
    title: 'Invoice Creation',
    description: 'Generate professional invoices, quotations, and receipts in minutes with customizable templates.',
  },
  {
    icon: <Eye size={24} />,
    title: 'Invoice Tracking',
    description: 'Monitor the status of all your invoices and business documents with real-time updates.',
  },
  {
    icon: <CreditCard size={24} />,
    title: 'Payment Tracking',
    description: 'Keep track of payment status and maintain an accurate ledger for better cash flow management.',
  },
  {
    icon: <BarChart size={24} />,
    title: 'Reports & Analytics',
    description: 'Generate detailed reports on revenue, client performance, and business insights.',
  },
  {
    icon: <Users size={24} />,
    title: 'Client Management',
    description: 'Organize and manage your client database with ease, including contact info and history.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Automation',
    description: 'Automate recurring invoices, reminders, and follow-ups to save time and reduce errors.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 tracking-tight">
            Features
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Everything you need to manage your invoicing process efficiently and professionally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-5 mb-8">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                        {feature.title}
                    </h3>
                </div>
                
                <p className="text-gray-500 font-medium leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <CheckCircleIcon size={16} className="text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Included in all plans</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}