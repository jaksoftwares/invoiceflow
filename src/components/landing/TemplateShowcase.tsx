'use client';

import Image from 'next/image';

const TEMPLATES = [
  {
    title: 'Professional Invoice',
    image: '/assets/images/screenshot1.png',
  },
  {
    title: 'Corporate Quotation',
    image: '/assets/images/screenshot2.png',
  },
  {
    title: 'Minimal Receipt',
    image: '/assets/images/screenshot3.png',
  },
  {
    title: 'Detailed Statement',
    image: '/assets/images/screenshot4.png',
  }
];

export default function TemplateShowcase() {
  // Duplicate the array to create a seamless infinite loop
  const duplicatedTemplates = [...TEMPLATES, ...TEMPLATES, ...TEMPLATES];

  return (
    <div className="relative w-full overflow-hidden bg-transparent py-10 mt-10">
      {/* Edge Gradients for smooth fade in/out */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Marquee Container */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center">
        {duplicatedTemplates.map((template, index) => (
          <div 
            key={index} 
            className="w-[400px] h-[300px] sm:w-[500px] sm:h-[350px] mx-6 shrink-0 rounded-2xl bg-white border border-slate-100 p-2 flex flex-col items-center justify-start shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
          >
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-white/40 blur-2xl rounded-full -translate-y-16 group-hover:bg-white/60 transition-colors pointer-events-none z-10"></div>
            
            <div className="relative z-0 w-full h-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
              <Image 
                src={template.image} 
                alt={template.title}
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 400px, 500px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
