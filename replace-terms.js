const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const helperFunc = `
  const getTermsLabel = (val?: string) => {
    if (!val) return 'N/A';
    const map: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      credit_card: 'Credit Card',
      mobile_money: 'Mobile Money',
      cheque: 'Cheque',
      valid_15: 'Valid for 15 Days',
      valid_30: 'Valid for 30 Days',
      valid_60: 'Valid for 60 Days',
      upon_acceptance: 'Upon Acceptance',
      net15: 'Net 15 Days',
      net30: 'Net 30 Days',
      net45: 'Net 45 Days',
      net60: 'Net 60 Days',
      due_on_receipt: 'Due on Receipt'
    };
    return map[val] || val.replace('_', ' ');
  };
`;

content = content.replace(/const formatDate =.*?;\n/g, match => match + helperFunc);

// Now replace usages of details.paymentTerms
content = content.replace(/\{details\.paymentTerms\?\.replace\('_', ' '\)\.toUpperCase\(\)\}/g, "{getTermsLabel(details.paymentTerms).toUpperCase()}");
content = content.replace(/\{details\.paymentTerms\?\.toUpperCase\(\)\}/g, "{getTermsLabel(details.paymentTerms).toUpperCase()}");
content = content.replace(/\{details\.paymentTerms\}/g, "{getTermsLabel(details.paymentTerms)}");
content = content.replace(/\{details\.paymentTerms\?\.replace\('_', ' '\) \|\| 'NET 30'\}/g, "{getTermsLabel(details.paymentTerms)}");
content = content.replace(/\{details\.paymentTerms\?\.replace\('_', ' '\) \|\| 'Net 30'\}/g, "{getTermsLabel(details.paymentTerms)}");

fs.writeFileSync(filePath, content);
console.log('Replaced paymentTerms display logic in InvoicePreview');
