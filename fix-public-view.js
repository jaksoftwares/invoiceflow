const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'invoice', 'view', '[slug]', 'PublicInvoiceUI.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add documentType to PublicInvoiceUI
content = content.replace(
  /const { generatePDF } = useInvoicePDF\(\);/g,
  "const { generatePDF } = useInvoicePDF();\n  const documentType = (invoice.type || 'invoice') as 'invoice' | 'quotation' | 'receipt';\n  const displayType = documentType.charAt(0).toUpperCase() + documentType.slice(1);"
);

// 2. Fix the download filename
content = content.replace(
  /fileName: `Invoice-\$\{invoice\.invoice_number \|\| 'download'\}\.pdf`,/g,
  "fileName: `${displayType}-${invoice.invoice_number || 'download'}.pdf`,"
);

// 3. Fix the Official Invoice header
content = content.replace(
  /\{businessProfile\.name \|\| 'Official Invoice'\}/g,
  "{businessProfile.name || `Official ${displayType}`}"
);

// 4. Pass documentType to InvoicePreview
content = content.replace(
  /selectedTemplate=\{invoice\.template\}/g,
  "selectedTemplate={invoice.template}\n              documentType={documentType}"
);

// 5. Update the action button based on documentType
const oldButton = `<button className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-elevation-3 active:scale-95">
                    Pay KES {invoice.total_amount?.toLocaleString()}
                 </button>`;

const newButton = `{documentType === 'invoice' && (
                 <button className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-elevation-3 active:scale-95">
                    Pay {invoice.currency || 'KES'} {invoice.total_amount?.toLocaleString()}
                 </button>
                 )}
                 {documentType === 'quotation' && (
                 <button className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-elevation-3 active:scale-95">
                    Approve Quotation
                 </button>
                 )}`;

content = content.replace(oldButton, newButton);

fs.writeFileSync(filePath, content);
console.log('Fixed PublicInvoiceUI.tsx');
