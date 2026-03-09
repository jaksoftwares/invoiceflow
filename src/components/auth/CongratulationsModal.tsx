'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react';

interface CongratulationsModalProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const CongratulationsModal: React.FC<CongratulationsModalProps> = ({ onContinue, onSkip }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform animate-in zoom-in-95 duration-500 border border-gray-100">
        <div className="p-8 text-center border-b border-gray-50 bg-gray-50/50">
          <div className="flex justify-center mb-6">
            <img src="/assets/logo.png" alt="InvoiceFlow Logo" className="h-10 w-auto" />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-xl mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified</h2>
          <p className="text-gray-500 font-medium">Your account has been successfully verified.</p>
        </div>

        <div className="p-10 text-center space-y-8 bg-white">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Finalize your account</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
              Please provide your business details to customize your invoices and set up your billing profile.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onContinue}
              className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              <Building2 size={18} />
              Set up business profile
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-50" />
            </button>
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full py-3 px-6 text-gray-400 hover:text-gray-600 font-bold transition-colors text-xs uppercase tracking-widest"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsModal;
