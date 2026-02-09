import * as FileSystem from 'expo-file-system/legacy';

const GEOTAG_DIR = `${FileSystem.documentDirectory}geotagged_photos`;
const METADATA_FILE = `${GEOTAG_DIR}/metadata.json`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(GEOTAG_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(GEOTAG_DIR, { intermediates: true });
  }
}

export async function saveGeoPhoto(uri, metadata) {
  await ensureDir();
  const filename = `photo_${Date.now()}.jpg`;
  const destUri = `${GEOTAG_DIR}/${filename}`;
  await FileSystem.copyAsync({ from: uri, to: destUri });
  const entry = { filename, uri: destUri, ...metadata };
  const list = await loadMetadataList();
  list.push(entry);
  await FileSystem.writeAsStringAsync(METADATA_FILE, JSON.stringify(list, null, 2));
  return entry;
}

export async function loadMetadataList() {
  try {
    const content = await FileSystem.readAsStringAsync(METADATA_FILE);
    return content ? JSON.parse(content) : [];
  } catch {
    return [];
  }
}

export async function deleteGeoPhoto(filename) {
  const destUri = `${GEOTAG_DIR}/${filename}`;
  try {
    await FileSystem.deleteAsync(destUri, { idempotent: true });
  } catch (_) {}
  const list = await loadMetadataList();
  const filtered = list.filter((e) => e.filename !== filename);
  await FileSystem.writeAsStringAsync(METADATA_FILE, JSON.stringify(filtered, null, 2));
}
