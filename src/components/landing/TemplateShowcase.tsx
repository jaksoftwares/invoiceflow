'use client';

import React from 'react';
import { FileText, Calculator, FileCheck2, FileSpreadsheet } from 'lucide-react';

const TEMPLATES = [
  {
    title: 'Professional Invoice',
    icon: <FileText className="w-8 h-8 text-indigo-500 mb-4" />,
    color: 'from-indigo-500/10 to-blue-500/10',
    border: 'border-indigo-100',
    content: (
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-start w-full border-b border-indigo-100/50 pb-2">
          <div className="w-12 h-4 bg-indigo-200/50 rounded-sm"></div>
          <div className="w-16 h-4 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="space-y-2">
          <div className="w-3/4 h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-1/2 h-2 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="mt-4 pt-2 border-t border-indigo-100/50 flex justify-between">
          <div className="w-10 h-3 bg-slate-200/50 rounded-sm"></div>
          <div className="w-12 h-3 bg-indigo-200/80 rounded-sm"></div>
        </div>
      </div>
    )
  },
  {
    title: 'Corporate Quotation',
    icon: <Calculator className="w-8 h-8 text-emerald-500 mb-4" />,
    color: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-100',
    content: (
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-start w-full border-b border-emerald-100/50 pb-2">
          <div className="w-12 h-4 bg-emerald-200/50 rounded-sm"></div>
          <div className="w-16 h-4 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-2/3 h-2 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="mt-4 pt-2 border-t border-emerald-100/50 flex justify-end">
          <div className="w-16 h-4 bg-emerald-200/80 rounded-sm"></div>
        </div>
      </div>
    )
  },
  {
    title: 'Minimal Receipt',
    icon: <FileCheck2 className="w-8 h-8 text-rose-500 mb-4" />,
    color: 'from-rose-500/10 to-orange-500/10',
    border: 'border-rose-100',
    content: (
      <div className="space-y-3 w-full">
        <div className="flex justify-center w-full border-b border-rose-100/50 pb-2">
          <div className="w-20 h-4 bg-rose-200/50 rounded-sm"></div>
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <div className="w-3/4 h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-1/2 h-2 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="mt-4 pt-2 border-t border-rose-100/50 flex justify-between">
          <div className="w-10 h-3 bg-slate-200/50 rounded-sm"></div>
          <div className="w-12 h-3 bg-rose-200/80 rounded-sm"></div>
        </div>
      </div>
    )
  },
  {
    title: 'Detailed Statement',
    icon: <FileSpreadsheet className="w-8 h-8 text-blue-500 mb-4" />,
    color: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-100',
    content: (
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-start w-full border-b border-blue-100/50 pb-2">
          <div className="w-14 h-4 bg-blue-200/50 rounded-sm"></div>
          <div className="w-14 h-4 bg-slate-200/50 rounded-sm"></div>
        </div>
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
          <div className="w-full h-2 bg-slate-200/50 rounded-sm"></div>
        </div>
      </div>
    )
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
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {duplicatedTemplates.map((template, index) => (
          <div 
            key={index} 
            className={`w-[280px] h-[360px] mx-4 shrink-0 rounded-2xl bg-gradient-to-br ${template.color} border ${template.border} p-6 flex flex-col items-center justify-start shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer group backdrop-blur-sm relative overflow-hidden`}
          >
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-white/40 blur-2xl rounded-full -translate-y-16 group-hover:bg-white/60 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col items-center w-full h-full">
              {template.icon}
              <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">{template.title}</h3>
              
              {/* Document Mockup */}
              <div className="w-full flex-grow bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
                {template.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
