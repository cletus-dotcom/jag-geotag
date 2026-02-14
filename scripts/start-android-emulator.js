/**
 * Start Metro so the Android emulator can connect.
 * The emulator reaches the host at 10.0.2.2, not localhost.
 * Usage: node scripts/start-android-emulator.js
 * Then open/reload the app on the emulator.
 */
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: '10.0.2.2' };
console.log('Metro for Android emulator (host 10.0.2.2:8081)\n');

const child = spawn('npx', ['expo', 'start', '--clear'], {
  stdio: 'inherit',
  shell: true,
  env,
  cwd: path.resolve(__dirname, '..'),
});

child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
