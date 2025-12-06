// Placeholder for automatic route detection logic using location/GPS
// Production implementation should use background location, geofencing and a low-power strategy

const startRouteMonitoring = async (onRouteDetected) => {
  // TODO: hook into location subscription (expo-location or react-native-geolocation)
  // For now, simulate a detected route after 3s
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
    onRouteDetected && onRouteDetected(sample);
  }, 3000);
  return true;
};

const stopRouteMonitoring = async () => {
  // stop trackers
  return true;
};

export default { startRouteMonitoring, stopRouteMonitoring };
