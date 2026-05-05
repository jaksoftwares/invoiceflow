const fs = require('fs');
const path = require('path');

// 1. Fix CreateInvoiceInteractive.tsx
const createInteractivePath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'CreateInvoiceInteractive.tsx');
let interactiveContent = fs.readFileSync(createInteractivePath, 'utf8');

// Fix filename in PDF download
interactiveContent = interactiveContent.replace(
  /const filename = `Invoice_\$\{invoiceDetails\.invoiceNumber\}\.pdf`;/g,
  "const filename = `${documentType.charAt(0).toUpperCase() + documentType.slice(1)}_${invoiceDetails.invoiceNumber}.pdf`;"
);

fs.writeFileSync(createInteractivePath, interactiveContent);
console.log('Fixed CreateInvoiceInteractive PDF download name.');

// 2. Fix InvoicePreview.tsx
const previewPath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let previewContent = fs.readFileSync(previewPath, 'utf8');

// Replace >INVOICE< or >Invoice< inside h1, h2, span, p elements with the dynamic documentType
const invoiceRegexes = [
  />INVOICE</g,
  />Invoice</g,
];

invoiceRegexes.forEach(regex => {
  previewContent = previewContent.replace(regex, ">{documentType.toUpperCase()}<");
});

// Fix specific static strings like 'Invoice Number' -> `{documentType} Number`
previewContent = previewContent.replace(/>Invoice Number</g, ">{documentType} Number<");
previewContent = previewContent.replace(/>INVOICE NUMBER</g, ">{documentType.toUpperCase()} NUMBER<");

// Fix INV-000 fallbacks
previewContent = previewContent.replace(/'INV-000'/g, "documentType === 'quotation' ? 'QTN-000' : documentType === 'receipt' ? 'RCT-000' : 'INV-000'");

// Fix replace('INV-', '') to handle QTN and RCT
previewContent = previewContent.replace(/\.replace\('INV-', ''\)/g, ".replace(/^(INV|QTN|RCT)-/, '')");

fs.writeFileSync(previewPath, previewContent);
console.log('Fixed InvoicePreview document titles and numbers.');
