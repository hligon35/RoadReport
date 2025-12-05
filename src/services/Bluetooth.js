// Simple mock Bluetooth helper for local testing.
// In production, replace with react-native-ble-plx or Expo Bluetooth modules.

let connectedDevice = null;

const scanAndConnect = async () => {
  // Simulate scanning delay
  await new Promise((r) => setTimeout(r, 1200));
  // Simulate found device
  connectedDevice = { id: 'bt:1', name: 'Car OBD-II' };
  return connectedDevice;
};

const disconnect = async () => {
  await new Promise((r) => setTimeout(r, 400));
  connectedDevice = null;
  return true;
};

const getConnected = () => connectedDevice;

export default { scanAndConnect, disconnect, getConnected };
