// ExportService: CSV/PDF export helpers (CSV implemented). For file write/share, install expo-file-system and expo-sharing.
import { Platform, Alert } from 'react-native';

export const generateRoutesCSV = (routes = []) => {
  // Simple CSV: id,start,end,distance,purpose,status,notes
  const headers = ['id', 'start', 'end', 'distance', 'purpose', 'status', 'notes'];
  const rows = routes.map((t) => [
    t.id,
    t.start || '',
    t.end || '',
    t.distance ?? '',
    t.purpose || '',
    t.status || '',
    (t.notes || '').replace(/\r?\n/g, ' '),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""') }"`).join(','))].join('\n');
  return csv;
};

export const saveCSVToFile = async (filename = 'roadreport.csv', csvString) => {
  try {
    // Try to import expo-file-system dynamically to avoid hard dependency in code
    const FileSystem = require('expo-file-system');
    const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const path = `${dir}${filename}`;
    await FileSystem.writeAsStringAsync(path, csvString, { encoding: FileSystem.EncodingType.UTF8 });

    // Try to share using expo-sharing if available
    try {
      const Sharing = require('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Export saved', `CSV saved to ${path}`);
      }
    } catch (e) {
      // Sharing not installed
      Alert.alert('Export saved', `CSV saved to ${path}. Install expo-sharing to share.`);
    }
    return path;
  } catch (err) {
    console.warn('saveCSVToFile error', err);
    Alert.alert('Export failed', 'Please install expo-file-system: expo install expo-file-system');
    return null;
  }
};

// Backwards-compatible alias
export default { generateRoutesCSV, saveCSVToFile };

export const generateRoutesHTML = (routes = []) => {
  const rows = routes
    .map(
      (t) => `
    <tr>
      <td>${t.id}</td>
      <td>${t.start || ''}</td>
      <td>${t.end || ''}</td>
      <td>${t.distance ?? ''}</td>
      <td>${t.purpose || ''}</td>
      <td>${t.status || ''}</td>
      <td>${(t.notes || '').replace(/\n/g, '<br/>')}</td>
    </tr>`
    )
    .join('');

  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f7f7f7}</style>
    </head>
    <body>
      <h2>RoadReport - Routes</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Start</th><th>End</th><th>Distance</th><th>Purpose</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
  </html>`;

  return html;
};

export const generateRoutesHTML = (routes = []) => {
  const rows = routes
    .map(
      (t) => `
    <tr>
      <td>${t.id}</td>
      <td>${t.start || ''}</td>
      <td>${t.end || ''}</td>
      <td>${t.distance ?? ''}</td>
      <td>${t.purpose || ''}</td>
      <td>${t.status || ''}</td>
      <td>${(t.notes || '').replace(/\n/g, '<br/>')}</td>
    </tr>`
    )
    .join('');

  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f7f7f7}</style>
    </head>
    <body>
      <h2>RoadReport - Routes</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Start</th><th>End</th><th>Distance</th><th>Purpose</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
  </html>`;

  return html;
};

export const saveHTMLAsPDF = async (filename = 'roadreport.pdf', htmlString) => {
  try {
    const Print = require('expo-print');
    const FileSystem = require('expo-file-system');
    const Sharing = require('expo-sharing');

    const { uri } = await Print.printToFileAsync({ html: htmlString });
    const dir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
    const dest = `${dir}${filename}`;
    // copy the generated file to our desired location
    await FileSystem.copyAsync({ from: uri, to: dest });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dest);
    } else {
      Alert.alert('PDF saved', `PDF saved to ${dest}`);
    }
    return dest;
  } catch (err) {
    console.warn('saveHTMLAsPDF error', err);
    Alert.alert('PDF export failed', 'Install expo-print and expo-file-system to enable PDF export');
    return null;
  }
};
