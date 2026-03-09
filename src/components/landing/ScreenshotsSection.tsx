'use client';

import { Check } from 'lucide-react';

const screenshots = [
  {
    title: 'Dashboard Overview',
    description: 'Get a quick overview of your business metrics and recent activities.',
    image: '/assets/images/screenshot1.png',
  },
  {
    title: 'Invoice Creation',
    description: 'Intuitive interface for creating professional invoices in minutes.',
    image: '/assets/images/screenshot2.png',
  },
  {
    title: 'Client Management',
    description: 'Organize and manage all your client information in one place.',
    image: '/assets/images/screenshot3.png',
  },
  {
    title: 'Reports & Analytics',
    description: 'Detailed insights into your revenue, client performance, and more.',
    image: '/assets/images/screenshot4.png',
  },
];

export default function ScreenshotsSection() {
  return (
    <section id="screenshots" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            See Invoiceflow in Action
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Explore the clean, intuitive interface designed to make invoicing effortless.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {screenshots.map((screenshot, index) => (
            <div 
              key={index} 
              className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <div className="aspect-video bg-gray-50 overflow-hidden relative border-b border-gray-50">
                <img 
                  src={screenshot.image} 
                  alt={screenshot.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/no_image.png';
                  }}
                />
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500" />
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Check size={14} className="text-indigo-600 stroke-[3]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{screenshot.title}</h3>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}