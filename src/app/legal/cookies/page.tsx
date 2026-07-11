export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 md:p-16 border border-slate-100">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
      <p className="text-sm text-slate-500 font-medium mb-12">Last Updated: July 2026</p>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg leading-relaxed text-slate-600 mb-8 font-medium">
          <strong>Dovepeak Digital Solutions</strong> ("we", "us", or "our") uses cookies and similar tracking technologies on our product, <strong>Invoiceflow</strong>. 
          This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. What are Cookies?</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. 
          They help the website function properly, remember your preferences, and provide analytics on how the site is being used.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. How We Use Cookies</h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          Invoiceflow relies heavily on standard functionality cookies. We use them for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li><strong>Essential Functions:</strong> Authentication and keeping you securely logged in via Supabase.</li>
          <li><strong>Preferences:</strong> Remembering your UI choices (like dark mode or language).</li>
          <li><strong>Performance & Analytics:</strong> Understanding how users navigate our platform so we can improve the user experience.</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Managing Your Cookies</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          You have the right to accept or reject non-essential cookies. You can manage your cookie preferences through your browser settings. 
          Please note that disabling strictly necessary cookies (such as auth tokens) will prevent you from logging into Invoiceflow.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Updates to this Policy</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          We may update this Cookie Policy from time to time to reflect changes in technology or legislation. Any material changes will be communicated to you via email or a prominent notice on the platform.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Contact</h2>
        <p className="text-slate-600 leading-relaxed mb-8">
          If you have any questions about how we use cookies, contact us at <strong>legal@dovepeakdigital.com</strong>.
        </p>
      </div>
    </div>
  );
}
