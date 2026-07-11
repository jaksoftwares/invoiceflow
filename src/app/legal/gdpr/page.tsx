export default function GDPRPolicy() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">GDPR Compliance Statement</h1>
      <p className="text-sm text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg leading-relaxed text-slate-600 mb-8 font-medium">
          <strong>Dovepeak Digital Solutions</strong> is fully committed to complying with the General Data Protection Regulation (GDPR) for all <strong>Invoiceflow</strong> users residing in the European Economic Area (EEA) and the UK.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Data Controller</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          For the purposes of the GDPR, Dovepeak Digital Solutions is the Data Controller of the personal data you provide when setting up an Invoiceflow account. When you enter client data to generate invoices, you are the Data Controller for that information, and Dovepeak Digital Solutions acts as the Data Processor.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Your GDPR Rights</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Under the GDPR, you have the following fundamental rights regarding your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
          <li><strong>Right to Rectification:</strong> You can update or correct inaccurate data in your dashboard.</li>
          <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request the permanent deletion of your account and personal data.</li>
          <li><strong>Right to Data Portability:</strong> You can export your data in a structured, commonly used format.</li>
          <li><strong>Right to Restrict Processing:</strong> You can request we temporarily halt processing your data under certain conditions.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Exercising Your Rights</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Many of these rights can be exercised directly within the Invoiceflow application (such as deleting an invoice or updating your profile). 
          For more complex requests, such as a complete data export or account erasure, please submit a request to our Data Protection Officer.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. International Transfers</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Invoiceflow is hosted on secure cloud infrastructure. If your data is transferred outside the EEA, we ensure that appropriate safeguards (such as Standard Contractual Clauses) are in place to guarantee GDPR-level protection.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Contact Our DPO</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          If you have questions about our GDPR compliance or wish to exercise your rights, contact our Data Protection Officer at <strong>legal@dovepeakdigital.com</strong>.
        </p>
      </div>
    </div>
  );
}
