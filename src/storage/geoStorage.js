import * as FileSystem from 'expo-file-system/legacy';

const GEOTAG_DIR = `${FileSystem.documentDirectory}geotagged_photos`;
const METADATA_FILE = `${GEOTAG_DIR}/metadata.json`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(GEOTAG_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(GEOTAG_DIR, { intermediates: true });
  }
}

/**
 * Save a geo-tagged photo. Prefer base64 when provided so the file is written
 * from the actual capture data (avoids black images from temp file timing on Android).
 */
export async function saveGeoPhoto(uri, metadata, base64) {
  await ensureDir();
  const filename = `photo_${Date.now()}.jpg`;
  const destUri = `${GEOTAG_DIR}/${filename}`;

  if (base64 && typeof base64 === 'string' && base64.length > 0) {
    await FileSystem.writeAsStringAsync(destUri, base64, { encoding: 'base64' });
  } else {
    await FileSystem.copyAsync({ from: uri, to: destUri });
  }

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
