export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
      <p className="text-sm text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg leading-relaxed text-slate-600 mb-8 font-medium">
          Welcome to <strong>Invoiceflow</strong>, a software-as-a-service product proudly developed and operated by <strong>Dovepeak Digital Solutions</strong>. 
          By accessing or using our platform, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Acceptance of Terms</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          By registering for an account, accessing, or using the Invoiceflow service, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, you must not use our service.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Description of Service</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Invoiceflow is a cloud-based invoice creation, tracking, and management platform designed for businesses and freelancers. Dovepeak Digital Solutions reserves the right to modify, suspend, or discontinue any part of the service at any time with or without notice.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Subscriptions and Payments</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li><strong>Billing:</strong> You may use Invoiceflow via our free tier or by upgrading to a premium subscription. All fees are clearly displayed before purchase.</li>
          <li><strong>Renewals & Cancellations:</strong> Subscriptions renew automatically unless canceled before the next billing cycle. You may cancel at any time within your dashboard.</li>
          <li><strong>Refunds:</strong> Payments are non-refundable except where explicitly required by law.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. User Responsibilities</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          You are solely responsible for the accuracy of the financial documents you generate using Invoiceflow. Dovepeak Digital Solutions does not provide legal, financial, or tax advice. You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li>Use the service for illegal or fraudulent activities.</li>
          <li>Attempt to breach or bypass our security mechanisms.</li>
          <li>Resell or redistribute the service without explicit permission.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Limitation of Liability</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          In no event shall Dovepeak Digital Solutions be liable for any indirect, incidental, special, or consequential damages (including loss of profits or data) arising out of or in connection with your use of Invoiceflow. Our total liability shall not exceed the amount you paid for the service in the past 12 months.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Contact Information</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          For any legal or service inquiries, please contact Dovepeak Digital Solutions at <strong>legal@dovepeakdigital.com</strong>.
        </p>
      </div>
    </div>
  );
}
