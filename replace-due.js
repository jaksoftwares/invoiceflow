const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace >Due Date<
content = content.replace(/>Due Date</g, ">{documentType === 'quotation' ? 'Valid Until' : documentType === 'receipt' ? 'Date Paid' : 'Due Date'}<");
// Also sometimes it's "Due Date" without tags? No, it's mostly inside tags.

// Replace >Amount Due<
content = content.replace(/>Amount Due</g, ">{documentType === 'quotation' ? 'Estimated Amount' : documentType === 'receipt' ? 'Paid Amount' : 'Amount Due'}<");

// Replace >Total Due<
content = content.replace(/>Total Due</g, ">{documentType === 'quotation' ? 'Total Estimate' : documentType === 'receipt' ? 'Total Paid' : 'Total Due'}<");

// Replace >Balance Due<
content = content.replace(/>Balance Due</g, ">{documentType === 'quotation' ? 'Estimated Balance' : documentType === 'receipt' ? 'Remaining Balance' : 'Balance Due'}<");

// Replace >Final Dues Payable<
content = content.replace(/>Final Dues Payable</g, ">{documentType === 'quotation' ? 'Final Estimate' : documentType === 'receipt' ? 'Amount Settled' : 'Final Dues Payable'}<");

// Replace >Final Dues<
content = content.replace(/>Final Dues</g, ">{documentType === 'quotation' ? 'Final Estimate' : documentType === 'receipt' ? 'Amount Settled' : 'Final Dues'}<");

// Replace >Final Balance Due.<
content = content.replace(/>Final Balance Due\.</g, ">{documentType === 'quotation' ? 'Final Estimate.' : documentType === 'receipt' ? 'Amount Settled.' : 'Final Balance Due.'}<");

// Replace >Principal Balance Due<
content = content.replace(/>Principal Balance Due</g, ">{documentType === 'quotation' ? 'Principal Estimate' : documentType === 'receipt' ? 'Principal Paid' : 'Principal Balance Due'}<");

// Replace >Due {formatDate
content = content.replace(/>Due \{formatDate/g, ">{documentType === 'quotation' ? 'Valid Until ' : documentType === 'receipt' ? 'Paid On ' : 'Due '}{formatDate");

// Replace Payment Instructions Header
content = content.replace(/>Payment Information</g, ">{documentType === 'receipt' ? 'Payment Summary' : 'Payment Information'}<");
content = content.replace(/>Payment Details</g, ">{documentType === 'receipt' ? 'Payment Summary' : 'Payment Details'}<");

// Ensure payment method isn't completely hidden since users still write how it was paid in a receipt.

fs.writeFileSync(filePath, content);
console.log('Replaced Due/Total labels in InvoicePreview');
