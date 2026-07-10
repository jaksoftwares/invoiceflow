'use client';

import Icon from '@/components/ui/AppIcon';

interface AdditionalDetailsFormProps {
 notes: string;
 terms: string;
 paymentInstructions: string;
 onNotesChange: (notes: string) => void;
 onTermsChange: (terms: string) => void;
 onPaymentInstructionsChange: (instructions: string) => void;
 documentType?: 'invoice' | 'quotation' | 'receipt';
}

export const standardTemplates = {
 invoice: {
 payment: "Please make payment via Bank Transfer to:\nBank Name: \nAccount Number: \nAccount Name: \n\nPlease include the Invoice Number as the reference.",
 notes: "Thank you for your business. It's been a pleasure working with you!",
 terms: "Payment is required within the agreed terms. Late payments may be subject to a 1.5% monthly interest fee. All goods/services remain the property of the business until paid in full."
 },
 quotation: {
 payment: "This quotation is valid for the period specified. To proceed with the project, please reply to this email with your written approval or sign and return a copy of this document.",
 notes: "Pricing is based on the initial requirements discussed. Any material changes to the scope of work may result in a revised quotation.",
 terms: "All prices are subject to applicable taxes. Work will commence upon receipt of the agreed deposit. Delivery timelines are estimates and subject to final confirmation upon project kickoff."
 },
 receipt: {
 payment: "This document serves as an official confirmation that your payment has been received in full. No further action is required.",
 notes: "We deeply appreciate your prompt payment and your continued trust in our services! Please keep this receipt for your records.",
 terms: "All sales are subject to our standard return and refund policies. For any post-sale support or warranty claims, please contact our customer service team."
 }
};

const AdditionalDetailsForm = ({
 notes,
 terms,
 paymentInstructions,
 onNotesChange,
 onTermsChange,
 onPaymentInstructionsChange,
 documentType = 'invoice'
}: AdditionalDetailsFormProps) => {

 const templates = standardTemplates[documentType];

 return (
 <div className="space-y-6">
 <div className="space-y-2">
 <label htmlFor="paymentInstructions" className="block text-sm font-medium text-foreground">
 {documentType === 'quotation' ? 'Acceptance Instructions' : documentType === 'receipt' ? 'Payment Summary' : 'Payment Instructions'}
 </label>
 <textarea
 id="paymentInstructions"
 value={paymentInstructions}
 onChange={(e) => onPaymentInstructionsChange(e.target.value)}
 placeholder={templates.payment}
 rows={3}
 className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth placeholder:text-slate-300"
 />
 <p className="text-xs text-muted-foreground">
 {documentType === 'quotation' ? 'Tell the client how to accept this quote' : documentType === 'receipt' ? 'Confirm how the payment was received' : 'Provide bank details or payment links'}
 </p>
 </div>

 <div className="space-y-2">
 <label htmlFor="notes" className="block text-sm font-medium text-foreground">
 {documentType === 'quotation' ? 'Scope Notes' : documentType === 'receipt' ? 'Thank You Note' : 'Client Notes'}
 </label>
 <textarea
 id="notes"
 value={notes}
 onChange={(e) => onNotesChange(e.target.value)}
 placeholder={templates.notes}
 rows={3}
 className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth placeholder:text-slate-300"
 />
 <p className="text-xs text-muted-foreground">
 {documentType === 'quotation' ? "Clarify what is or isn't included" : documentType === 'receipt' ? 'A short message of appreciation' : 'Add any additional information or special notes'}
 </p>
 </div>

 <div className="space-y-2">
 <label htmlFor="terms" className="block text-sm font-medium text-foreground">
 {documentType === 'quotation' ? 'Project Terms' : documentType === 'receipt' ? 'Support & Policies' : 'Terms & Conditions'}
 </label>
 <textarea
 id="terms"
 value={terms}
 onChange={(e) => onTermsChange(e.target.value)}
 placeholder={templates.terms}
 rows={4}
 className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth placeholder:text-slate-300"
 />
 <p className="text-xs text-muted-foreground">
 {documentType === 'quotation' ? 'Define timelines, deposits, and validity' : documentType === 'receipt' ? 'Mention your return or support policies' : 'Define late fees, refund policy, etc.'}
 </p>
 </div>
 </div>
 );
};

export default AdditionalDetailsForm;