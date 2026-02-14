/**
 * Create a KMZ file (zip with KML + photo) for opening in Google Earth.
 * Placemark is at the photo's coordinates; the photo is shown in the balloon.
 */
import * as FileSystem from 'expo-file-system/legacy';
import JSZip from 'jszip';

function escapeXml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * @param {string} photoUri - file:// URI of the photo
 * @param {{ dateTimeDisplay?: string, latitude?: number, longitude?: number, accuracy?: number }} metadata
 * @returns {Promise<string>} file:// URI of the created .kmz file
 */
export async function createKmzFromPhoto(photoUri, metadata) {
  const lat = metadata.latitude;
  const lon = metadata.longitude;
  if (lat == null || lon == null) {
    throw new Error('Photo has no coordinates; cannot create KMZ.');
  }

  const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: 'base64' });
  const name = metadata.dateTimeDisplay || metadata.dateTime || 'Geo-tagged photo';
  const accStr =
    metadata.accuracy != null
      ? metadata.accuracy >= 1000
        ? `${(metadata.accuracy / 1000).toFixed(2)} km`
        : `${Math.round(metadata.accuracy)} m`
      : '—';

  // KML: longitude,latitude,altitude (altitude 0)
  // Image reference uses relative path within KMZ zip
  // Ensure proper XML formatting for Google Earth compatibility
  const dateTimeStr = escapeXml(metadata.dateTimeDisplay || metadata.dateTime || '—');
  const latStr = lat.toFixed(6);
  const lonStr = lon.toFixed(6);
  
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Jag GeoTag</name>
    <Placemark>
      <name>${escapeXml(name)}</name>
      <description><![CDATA[
<html>
  <body>
    <img src="photo.jpg" width="400" alt="Geo-tagged photo" />
    <p><b>Date &amp; time:</b> ${dateTimeStr}</p>
    <p><b>Latitude:</b> ${latStr}</p>
    <p><b>Longitude:</b> ${lonStr}</p>
    <p><b>Accuracy:</b> ${escapeXml(accStr)}</p>
  </body>
</html>
      ]]></description>
      <Point>
        <coordinates>${lonStr},${latStr},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

  const zip = new JSZip();
  // Main KML file must be named doc.kml and be at root level
  zip.file('doc.kml', kml);
  // Image at root level, referenced relatively in KML
  zip.file('photo.jpg', base64, { base64: true });

  // Generate ZIP with DEFLATE compression (standard for KMZ)
  const zipBase64 = await zip.generateAsync({ 
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  const filename = `jag_geotag_${Date.now()}.kmz`;
  const kmzUri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(kmzUri, zipBase64, { encoding: 'base64' });
  return kmzUri;
}
