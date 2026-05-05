const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'create-invoice', 'components', 'InvoicePreview.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicate className attributes by merging them
content = content.replace(/" className="capitalize"/g, ' capitalize"');

fs.writeFileSync(filePath, content);
console.log('Fixed JSX syntax error');
