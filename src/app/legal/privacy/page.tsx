export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
      <p className="text-sm text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg leading-relaxed text-slate-600 mb-8 font-medium">
          <strong>Invoiceflow</strong> is a product of <strong>Dovepeak Digital Solutions</strong> ("we", "us", or "our"). 
          We are committed to protecting your personal data and respecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard your information when you use the Invoiceflow platform.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Information We Collect</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          When you register for Invoiceflow, we collect the following types of information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li><strong>Personal Information:</strong> Name, email address, phone number, and billing information.</li>
          <li><strong>Business Information:</strong> Company name, address, tax identification, and client details necessary for generating invoices.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our platform (e.g., log data, browser type, pages visited).</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. How We Use Your Information</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Dovepeak Digital Solutions uses the collected data for various purposes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li>To provide, maintain, and improve the Invoiceflow service.</li>
          <li>To process payments and generate your financial documents (invoices, receipts, quotations).</li>
          <li>To notify you about changes to our service or subscription updates.</li>
          <li>To provide customer support and handle inquiries.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Data Sharing and Security</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          We do not sell your personal data. We may share your data with trusted third-party service providers 
          (e.g., payment processors, email delivery services) solely for the purpose of operating Invoiceflow. 
          We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Your Data Rights</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Depending on your jurisdiction, you may have the right to access, update, or delete the personal information we hold about you. 
          You can exercise these rights directly within your Invoiceflow dashboard or by contacting our support team.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Contact Us</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          If you have any questions about this Privacy Policy, please contact Dovepeak Digital Solutions at <strong>legal@dovepeakdigital.com</strong>.
        </p>
      </div>
    </div>
  );
}
