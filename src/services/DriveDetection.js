// Placeholder for automatic drive detection logic using location/GPS
// Production implementation should use background location, geofencing and a low-power strategy

const startDriveMonitoring = async (onDriveDetected) => {
  // TODO: hook into location subscription (expo-location or react-native-geolocation)
  // For now, simulate a detected drive after 3s
  setTimeout(() => {
      const sample = {
      id: `auto:${Date.now()}`,
      start: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      end: new Date().toISOString(),
      distance: 8.2,
        purpose: 'Miscellaneous',
      status: 'pending',
      notes: '',
    };
    onDriveDetected && onDriveDetected(sample);
  }, 3000);
  return true;
};

const stopDriveMonitoring = async () => {
  // stop trackers
  return true;
};

export default { startDriveMonitoring, stopDriveMonitoring };
