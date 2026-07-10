'use client';

import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-white pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-[1.05] tracking-tight max-w-5xl mx-auto">
          Manage Invoices, <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Quotations</span> & Receipts
        </h1>
        
        <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto text-gray-400 font-medium leading-relaxed">
          Create, track, and manage professional invoices effortlessly. The all-in-one solution for your business, including support for quotes and receipts.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all duration-300 text-lg"
          >
            Get Started Free
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center px-8 py-5 border-2 border-gray-100 bg-white text-gray-700 font-bold rounded-2xl hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all duration-300 text-lg"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-20 pt-10 border-t border-gray-50 flex flex-wrap justify-center gap-10 grayscale opacity-40">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-900 underline decoration-indigo-200 decoration-2">Professional Templates</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-900 underline decoration-indigo-200 decoration-2">Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-900 underline decoration-indigo-200 decoration-2">Custom Branding</span>
            </div>
        </div>
      </div>
    </section>
  );
}