/**
 * QR Code Generator Tool for Admin
 * Generates QR codes for subscription approval
 * 
 * Usage: node scripts/generateQRCode.js [subscription-date]
 * Example: node scripts/generateQRCode.js 2026-02-12
 */

const Crypto = require('crypto');

const SECRET_KEY = 'JAG_GEOTAG_SUBSCRIPTION_SECRET_2026'; // Must match the secret in qrCodeGenerator.js

function generateApprovalCode(subscriptionDate) {
  const date = subscriptionDate ? new Date(subscriptionDate) : new Date();
  const timestamp = date.getTime();
  const data = `${timestamp}-${SECRET_KEY}`;
  const hash = Crypto.createHash('sha256').update(data).digest('hex').substring(0, 8).toUpperCase();
  return `JAG-${timestamp}-${hash}`;
}

function generateQRCodeImage(code) {
  // For generating actual QR code images, you can use a library like 'qrcode'
  // For now, we'll just output the code text
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  QR CODE FOR SUBSCRIPTION APPROVAL');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`\nCode: ${code}`);
  console.log(`\nDate: ${new Date().toLocaleString()}`);
  console.log(`\nValid for subscription period starting: ${new Date(parseInt(code.split('-')[1])).toLocaleDateString()}`);
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\nTo generate QR code image:');
  console.log('1. Install qrcode: npm install qrcode');
  console.log('2. Use online QR generator: https://www.qr-code-generator.com/');
  console.log('3. Copy the code above and paste it into the generator');
  console.log('4. Send or show the QR code image to the user\n');
}

// Get subscription date from command line or use current date
const subscriptionDate = process.argv[2] || new Date().toISOString();

const code = generateApprovalCode(subscriptionDate);
generateQRCodeImage(code);

// Export for use in other scripts
if (require.main === module) {
  // Script is run directly
  process.exit(0);
}

module.exports = { generateApprovalCode };
