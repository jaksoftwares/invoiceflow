'use client';

import React from 'react';
import { Mail, ExternalLink, ChevronRight } from 'lucide-react';

interface EmailConfirmationModalProps {
 email: string;
 onClose?: () => void;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ email }) => {
 const getEmailProviderLink = (email: string) => {
 const domain = email.split('@')[1]?.toLowerCase();
 if (domain === 'gmail.com') return 'https://mail.google.com';
 if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'https://outlook.live.com';
 if (domain === 'yahoo.com') return 'https://mail.yahoo.com';
 return null;
 };

 const providerLink = getEmailProviderLink(email);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-in zoom-in-95 duration-300 flex flex-col border border-gray-100">
 {/* Header */}
 <div className="p-8 text-center border-b border-gray-50">
 <div className="flex justify-center mb-6">
 <img src="/assets/logo.png" alt="InvoiceFlow Logo" className="h-10 w-auto" />
 </div>
 <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
 <Mail size={32} />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
 <p className="text-gray-500 font-medium">We've sent a verification link to your email</p>
 </div>

 {/* Content Body */}
 <div className="p-8 space-y-6">
 <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
 <p className="text-xs font-bold text-gray-400 font-medium mb-1">Verification sent to:</p>
 <p className="text-base font-bold text-gray-900 truncate">{email}</p>
 </div>

 <p className="text-gray-600 text-sm leading-relaxed">
 Please click the confirmation link in the email to verify your account and continue with the setup.
 </p>

 <div className="space-y-3">
 {providerLink && (
 <a
 href={providerLink}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
 >
 Open {email.split('@')[1].split('.')[0].charAt(0).toUpperCase() + email.split('@')[1].split('.')[0].slice(1)} <ExternalLink size={18} />
 </a>
 )}
 
 <button
 onClick={() => window.location.reload()}
 className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all group"
 >
 Confirmed? Continue <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>

 {/* Footer */}
 <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-center">
 <p className="text-[10px] text-gray-400 font-bold font-medium flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
 Awaiting confirmation
 </p>
 </div>
 </div>
 </div>
 );
};

export default EmailConfirmationModal;
