/**
 * QR Code Generator with Image Output
 * Generates QR codes and saves as PNG image
 * 
 * Requires: npm install qrcode
 * Usage: node scripts/generateQRCodeWithImage.js [subscription-date]
 */

const QRCode = require('qrcode');
const Crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = 'JAG_GEOTAG_SUBSCRIPTION_SECRET_2026'; // Must match the secret in qrCodeGenerator.js

function generateApprovalCode(subscriptionDate) {
  const date = subscriptionDate ? new Date(subscriptionDate) : new Date();
  const timestamp = date.getTime();
  const data = `${timestamp}-${SECRET_KEY}`;
  const hash = Crypto.createHash('sha256').update(data).digest('hex').substring(0, 8).toUpperCase();
  return `JAG-${timestamp}-${hash}`;
}

async function generateQRCodeImage(code) {
  try {
    const outputDir = path.join(__dirname, '..', 'qr_codes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `qr_${Date.now()}.png`;
    const filepath = path.join(outputDir, filename);

    await QRCode.toFile(filepath, code, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  QR CODE GENERATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\nCode: ${code}`);
    console.log(`\nImage saved to: ${filepath}`);
    console.log(`\nDate: ${new Date().toLocaleString()}`);
    console.log(`\nValid for subscription period starting: ${new Date(parseInt(code.split('-')[1])).toLocaleDateString()}`);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\nSend or show this QR code image to the user.\n');

    return filepath;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw error;
  }
}

// Get subscription date from command line or use current date
const subscriptionDate = process.argv[2] || new Date().toISOString();

(async () => {
  try {
    const code = generateApprovalCode(subscriptionDate);
    await generateQRCodeImage(code);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    process.exit(1);
  }
})();
