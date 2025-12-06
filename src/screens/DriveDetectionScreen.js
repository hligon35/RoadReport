import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import DriveDetection from '../services/DriveDetection';
import Bluetooth from '../services/Bluetooth';

const DriveDetectionScreen = ({ navigation }) => {
  const [active, setActive] = useState(false);
  const [sensitivity, setSensitivity] = useState('Medium');
  const [frequent, setFrequent] = useState(true);
  const [btConnected, setBtConnected] = useState(false);
  const [btDevice, setBtDevice] = useState(null);

  const toggle = async () => {
    if (active) {
       await DriveDetection.stopRouteMonitoring();
      setActive(false);
       Alert.alert('Route detection', 'Monitoring stopped');
    } else {
       await DriveDetection.startRouteMonitoring((sample) => {
        Alert.alert('Drive detected', `Detected a drive: ${sample.distance} km`);
      });
      setActive(true);
       Alert.alert('Route detection', 'Monitoring started');
    }
  };

  const cycle = () => {
    const opts = ['Low', 'Medium', 'High'];
    const idx = opts.indexOf(sensitivity);
    setSensitivity(opts[(idx + 1) % opts.length]);
  };

  const connectBluetooth = async () => {
    try {
      const dev = await Bluetooth.scanAndConnect();
      setBtDevice(dev);
      setBtConnected(!!dev);
      Alert.alert('Bluetooth', `Connected to ${dev.name}`);
    } catch (e) {
      Alert.alert('Bluetooth', 'Failed to connect');
    }
  };

  const disconnectBluetooth = async () => {
    try {
      await Bluetooth.disconnect();
      setBtDevice(null);
      setBtConnected(false);
      Alert.alert('Bluetooth', 'Disconnected');
    } catch (e) {
      Alert.alert('Bluetooth', 'Failed to disconnect');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Drive Detection</Text>
          <Text style={styles.title}>Route Detection</Text>
        <Text style={styles.desc}>When enabled, RoadBiz will automatically detect routes in the background and suggest classification.</Text>

        <View style={{ height: 16 }} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Monitoring</Text>
          <TouchableOpacity onPress={toggle} style={[styles.controlButton, active ? styles.stop : styles.start]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{active ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Detection sensitivity</Text>
          <TouchableOpacity onPress={cycle}><Text style={styles.rowValue}>{sensitivity}</Text></TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Frequent Routes</Text>
          <Switch value={frequent} onValueChange={setFrequent} />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Work Hours</Text>
          <TouchableOpacity onPress={() => navigation && navigation.navigate('WorkHours')}>
            <Text style={styles.rowValue}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { marginTop: 8 }] }>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Bluetooth (improve detection)</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Connect your car or OBD-II Bluetooth device to improve accuracy.</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {btConnected ? (
              <TouchableOpacity onPress={disconnectBluetooth} style={[styles.controlButton, styles.stop]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Disconnect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={connectBluetooth} style={[styles.controlButton, styles.start]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Connect</Text>
              </TouchableOpacity>
            )}
            {btDevice ? <Text style={{ marginTop: 6, fontWeight: '600' }}>{btDevice.name}</Text> : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#fafafa' },
  rowLabel: { fontSize: 16 },
  rowValue: { fontWeight: '700' },
  controlButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  start: { backgroundColor: '#1976d2' },
  stop: { backgroundColor: '#d32f2f' },
});

export default DriveDetectionScreen;
