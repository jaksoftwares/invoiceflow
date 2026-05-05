const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'actions', 'email.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add type to the select query
content = content.replace(/due_date, \s*business_id,/g, "due_date, \n      type,\n      business_id,");

// Add displayType logic after formatters
const displayTypeLogic = `
  const documentType = invoice.type || 'invoice';
  const displayType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
  const dueDateLabel = documentType === 'quotation' ? 'Valid Until' : documentType === 'receipt' ? 'Date Paid' : 'Due Date';
  const actionText = documentType === 'invoice' ? 'View & Pay Invoice' : 'View ' + displayType;
`;

content = content.replace(/const formatDate =.*?;\n/g, match => match + displayTypeLogic);

// Update HTML body
content = content.replace(/This invoice is for your recent purchase or service/g, "This ${documentType} is for your recent transaction");
content = content.replace(/Invoice Number<\/td>/g, "${displayType} Number</td>");
content = content.replace(/Due Date<\/td>/g, "${dueDateLabel}</td>");
content = content.replace(/View & Pay Invoice<\/a>/g, "${actionText}</a>");

// Update Text body
content = content.replace(/This invoice is for your recent purchase or service/g, "This ${documentType} is for your recent transaction");
content = content.replace(/Invoice Details:/g, "${displayType} Details:");
content = content.replace(/Due Date:/g, "${dueDateLabel}:");
content = content.replace(/View Invoice:/g, "View ${displayType}:");

// Update Attachments filename and ID
content = content.replace(/Name: \`Invoice_\$\{invoice\.invoice_number\}\.pdf\`/g, "Name: `${displayType}_${invoice.invoice_number}.pdf`");
content = content.replace(/ContentID: \`cid:Invoice_\$\{invoice\.invoice_number\}\.pdf\`/g, "ContentID: `cid:${displayType}_${invoice.invoice_number}.pdf`");

// Update CC body text
content = content.replace(/copy of the invoice you sent/g, "copy of the ${documentType} you sent");

// Update Activity log
content = content.replace(/Invoice #\$\{invoice\.invoice_number\} sent to/g, "${displayType} #${invoice.invoice_number} sent to");

fs.writeFileSync(filePath, content);
console.log('Replaced Email template labels');
