const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace >INVOICE<
content = content.replace(/>INVOICE</g, '>{displayType.toUpperCase()}<');
content = content.replace(/>INVOICE\.</g, '>{displayType.toUpperCase()}.<');

// Replace >Invoice< 
content = content.replace(/>Invoice</g, ' className="capitalize">{displayType}<');
content = content.replace(/>Invoice\.</g, ' className="capitalize">{displayType}.<');
content = content.replace(/>Invoice No\.</g, ' className="capitalize">{displayType} No.<');
content = content.replace(/>Invoice Reference</g, ' className="capitalize">{displayType} Reference<');

// There might be some edge cases where we added className="capitalize" but the element already has a className.
// Let's use a function to properly add the capitalization.

content = content.replace(/>Invoice</g, '>{displayType.charAt(0).toUpperCase() + displayType.slice(1)}<');
content = content.replace(/>Invoice\.</g, '>{displayType.charAt(0).toUpperCase() + displayType.slice(1)}.<');
content = content.replace(/>Invoice No\.</g, '>{displayType.charAt(0).toUpperCase() + displayType.slice(1)} No.<');
content = content.replace(/>Invoice Reference</g, '>{displayType.charAt(0).toUpperCase() + displayType.slice(1)} Reference<');

fs.writeFileSync(filePath, content);
console.log('Replaced successfully');
