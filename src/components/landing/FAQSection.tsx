'use client';

import { Plus, Minus, CircleHelp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
 {
 question: 'Is Invoiceflow free to use?',
 answer: 'Yes, we offer a generous Free tier that allows you to create up to 5 items (Invoices, Quotations, or Receipts) per month. Scale to our Starter or Business plans for unlimited invoicing and priority features.',
 },
 {
 question: 'Can I generate Quotations and Receipts?',
 answer: 'Yes! Invoiceflow is a versatile tool for your business. You can easily switch between Invoice, Quotation, and Receipt modes to generate the exact file you need for your clients.',
 },
 {
 question: 'How do I share with clients?',
 answer: 'You can download your invoices, quotes, and receipts as professional PDFs, print them directly, or share them via a unique link. You can also send them directly via email from within the application.',
 },
 {
 question: 'Can I customize with my logo?',
 answer: 'Absolutely! Professional branding is at the core of Invoiceflow. All plans allow for custom logos and business profiles to ensure all your invoices, quotes, and receipts look professional.',
 },
 {
 question: 'Can I track whether a quote has been converted to an invoice?',
 answer: 'Yes, our tracking system allows you to manage the status of every item. You can easily track the lifecycle of a quotation from draft to sent to invoiced.',
 },
 {
 question: 'Is my financial data secure?',
 answer: 'We use industry-standard encryption and follow high-level security practices to protect your data. Your privacy and financial security are our top priorities.',
 },
 {
 question: 'How does M-Pesa integration work?',
 answer: 'M-Pesa payments for subscriptions are handled via a secure STK Push. Enter your number, and you will receive an instant payment prompt on your phone.',
 },
 {
 question: 'Are there any hidden fees or contracts?',
 answer: 'No hidden fees. No long-term contracts. You can choose a monthly plan or a Lifetime plan for a one-time payment. Upgrade or downgrade at any time.',
 },
 {
 question: 'Do you offer customer support?',
 answer: 'Yes! All users get email support. Starter and Business users get Priority status with faster response times to ensure smooth operations.',
 },
];

export default function FAQSection() {
 const [openIndex, setOpenIndex] = useState<number | null>(0);

 return (
 <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
 <div className="max-w-4xl mx-auto">
 <div className="text-center mb-16 relative">
 <div className="flex justify-center mb-6">
 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
 <CircleHelp size={32} />
 </div>
 </div>
 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
 Frequently Asked Questions
 </h2>
 <p className="text-lg text-gray-500 font-medium leading-relaxed">
 Everything you need to know about starting your invoicing journey.
 </p>
 </div>

 <div className="space-y-4">
 {faqs.map((faq, index) => {
 const isOpen = openIndex === index;
 return (
 <div 
 key={index} 
 className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${
 isOpen ? 'border-indigo-600 shadow-xl' : 'border-gray-100 shadow-sm hover:border-indigo-200'
 }`}
 >
 <button 
 onClick={() => setOpenIndex(isOpen ? null : index)}
 className="w-full flex items-center justify-between p-8 text-left group"
 >
 <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-indigo-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>
 {faq.question}
 </span>
 <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
 isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
 }`}>
 {isOpen ? <Minus size={18} /> : <Plus size={18} />}
 </div>
 </button>
 
 <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
 <p className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
 {faq.answer}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}