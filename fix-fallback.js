const fs = require('fs');
const path = require('path');

const previewPath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let previewContent = fs.readFileSync(previewPath, 'utf8');

previewContent = previewContent.replace(
  /\|\| documentType === 'quotation' \? 'QTN-000' : documentType === 'receipt' \? 'RCT-000' : 'INV-000'/g,
  "|| (documentType === 'quotation' ? 'QTN-000' : documentType === 'receipt' ? 'RCT-000' : 'INV-000')"
);

fs.writeFileSync(previewPath, previewContent);
console.log('Fixed precedence bug in InvoicePreview.tsx');
