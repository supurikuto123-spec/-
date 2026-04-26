const fs = require('fs');
const path = require('path');

// Check if all required files exist
const requiredFiles = [
  'public/index.html',
  'public/app.js',
  'public/style.css',
  'lib/mailstore.js'
];

console.log('Checking required files...');
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
}

// Check server.js syntax
try {
  require('./server.js');
} catch (err) {
  console.error('Server.js error:', err.message);
}
