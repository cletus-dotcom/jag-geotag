/**
 * Start Expo with LAN IP so the phone can connect (fixes "Failed to download remote update").
 * Usage: node scripts/start-lan.js
 */
const os = require('os');
const { spawn } = require('child_process');

function getLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        candidates.push(iface.address);
      }
    }
  }
  // Prefer 192.168.x.x (typical Wi‑Fi), then 10.x.x.x
  const prefer = (a) => (a.startsWith('192.168.') ? 0 : a.startsWith('10.') ? 1 : 2);
  candidates.sort((a, b) => prefer(a) - prefer(b));
  return candidates[0] || null;
}

const lanIp = getLanIp();
if (lanIp) {
  console.log('Using LAN IP:', lanIp);
  console.log('In Expo Go, connect to: exp://' + lanIp + ':8081\n');
} else {
  console.warn('Could not detect LAN IP. Run: npx expo start --lan --clear');
}

const env = { ...process.env };
if (lanIp) env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;

const child = spawn('npx', ['expo', 'start', '--lan', '--clear'], {
  stdio: 'inherit',
  shell: true,
  env,
  cwd: require('path').resolve(__dirname, '..'),
});

child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
