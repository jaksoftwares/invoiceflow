'use client';

import Image from 'next/image';

const TEMPLATES = [
  { title: 'Modern Invoice', image: '/document-templates/invoice1.png' },
  { title: 'Corporate Invoice', image: '/document-templates/invoice2.png' },
  { title: 'Clean Invoice', image: '/document-templates/invoice3.png' },
  { title: 'Standard Invoice', image: '/document-templates/invoice4.png' },
  { title: 'Creative Invoice', image: '/document-templates/invoice5.png' },
  { title: 'Bold Invoice', image: '/document-templates/invoice6.png' },
  { title: 'Minimal Invoice', image: '/document-templates/invoice7.png' },

  { title: 'Professional Quote', image: '/document-templates/quotation1.png' },
  { title: 'Simple Quote', image: '/document-templates/quotation2.png' },
  { title: 'Standard Quote', image: '/document-templates/quotation3.png' },
  { title: 'Clean Quote', image: '/document-templates/quotation4.png' },
  { title: 'Corporate Quote', image: '/document-templates/quotation5.png' },

  { title: 'Standard Receipt', image: '/document-templates/receipt1.png' },
  { title: 'Clean Receipt', image: '/document-templates/receipt2.png' },
  { title: 'Modern Receipt', image: '/document-templates/receipt3.png' },
  { title: 'Creative Receipt', image: '/document-templates/receipt4.png' },
  { title: 'Minimal Receipt', image: '/document-templates/receipt5.png' },
  { title: 'Corporate Receipt', image: '/document-templates/receipt6.png' },
  { title: 'Bold Receipt', image: '/document-templates/receipt7.png' },
  { title: 'Simple Receipt', image: '/document-templates/receipt8.png' },
  { title: 'Elegant Receipt', image: '/document-templates/receipt9.png' },
  { title: 'Detailed Receipt', image: '/document-templates/receipt10.png' },
  { title: 'Classic Receipt', image: '/document-templates/receipt11.png' },
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
