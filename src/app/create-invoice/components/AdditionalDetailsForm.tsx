'use client';

interface AdditionalDetailsFormProps {
  notes: string;
  terms: string;
  paymentInstructions: string;
  onNotesChange: (notes: string) => void;
  onTermsChange: (terms: string) => void;
  onPaymentInstructionsChange: (instructions: string) => void;
}

const AdditionalDetailsForm = ({
  notes,
  terms,
  paymentInstructions,
  onNotesChange,
  onTermsChange,
  onPaymentInstructionsChange,
}: AdditionalDetailsFormProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="paymentInstructions" className="block text-sm font-medium text-foreground">
          Payment Instructions
        </label>
        <textarea
          id="paymentInstructions"
          value={paymentInstructions}
          onChange={(e) => onPaymentInstructionsChange(e.target.value)}
          placeholder="Bank details, payment methods, or special instructions..."
          rows={3}
          className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth"
        />
        <p className="text-xs text-muted-foreground">Provide payment details for your client</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Additional notes or comments for the client..."
          rows={4}
          className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth"
        />
        <p className="text-xs text-muted-foreground">Add any additional information or special notes</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="terms" className="block text-sm font-medium text-foreground">
          Terms & Conditions
        </label>
        <textarea
          id="terms"
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          placeholder="Payment terms, late fees, refund policy, etc..."
          rows={5}
          className="w-full px-4 py-3 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-smooth"
        />
        <p className="text-xs text-muted-foreground">Define your business terms and conditions</p>
      </div>
    </div>
  );
};

export default AdditionalDetailsForm;