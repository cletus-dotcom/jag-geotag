/**
 * Serial Key Generator Tool for Admin
 * Generates unique serial keys for device installation
 * 
 * Usage: node scripts/generateSerialKey.js [count]
 * Example: node scripts/generateSerialKey.js 5 (generates 5 serial keys)
 */

const Crypto = require('crypto');

const SECRET_KEY = 'JAG_GEOTAG_SERIAL_SECRET_2026'; // Must match the secret in serialKeyService.js

/**
 * Generate a random 4-character alphanumeric string
 */
function generateSegment() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters (0, O, I, 1)
  let segment = '';
  for (let i = 0; i < 4; i++) {
    segment += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return segment;
}

/**
 * Generate a unique serial key
 * Format: JAG-XXXX-XXXX-XXXX-XXXX
 */
function generateSerialKey() {
  const segments = [
    'JAG',
    generateSegment(),
    generateSegment(),
    generateSegment(),
    generateSegment(),
  ];
  return segments.join('-');
}

/**
 * Generate multiple serial keys
 */
function generateSerialKeys(count = 1) {
  const keys = [];
  for (let i = 0; i < count; i++) {
    keys.push(generateSerialKey());
  }
  return keys;
}

// Get count from command line or default to 1
const count = parseInt(process.argv[2]) || 1;

console.log('\n═══════════════════════════════════════════════════════');
console.log('  SERIAL KEY GENERATOR - Jag GeoTag');
console.log('═══════════════════════════════════════════════════════');
console.log(`\nGenerating ${count} serial key(s)...\n`);

const keys = generateSerialKeys(count);

keys.forEach((key, index) => {
  console.log(`${index + 1}. ${key}`);
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('  IMPORTANT NOTES');
console.log('═══════════════════════════════════════════════════════');
console.log('\n• Each serial key can only be used ONCE per device');
console.log('• Once registered on a device, the serial key is locked to that device');
console.log('• Users need a NEW serial key for each additional device');
console.log('• Serial key format: JAG-XXXX-XXXX-XXXX-XXXX');
console.log('• Store these keys securely and distribute to users');
console.log('\n═══════════════════════════════════════════════════════\n');

// Export for use in other scripts
if (require.main !== module) {
  module.exports = { generateSerialKey, generateSerialKeys };
}
