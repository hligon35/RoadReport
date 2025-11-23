import React, { useState, useContext } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { DataContext } from '../context/DataContext';
import { useLocationTracker } from '../hooks/useLocation';

export const MileageTracker = () => {
  const { addTrip } = useContext(DataContext);
  const { tracking, start, stop, distanceMiles } = useLocationTracker();
  const [purpose, setPurpose] = useState('');

  const handleStop = () => {
    // Save trip
    const trip = {
      id: `t-${Date.now()}`,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      distance: distanceMiles,
      purpose,
    };
    addTrip(trip);
    stop();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Mileage Tracker</Text>
      <Text>Tracking: {String(tracking)}</Text>
      <Text>Distance (mi): {distanceMiles}</Text>
      <TextInput
        placeholder="Purpose (e.g., delivery, client meeting)"
        value={purpose}
        onChangeText={setPurpose}
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      {!tracking ? (
        <Button title="Start Trip" onPress={start} />
      ) : (
        <Button title="Stop & Save Trip" onPress={handleStop} />
      )}
      <Text style={{ marginTop: 12, color: '#666' }}>
        Note: Location permissions and background tracking require Expo Location and platform setup.
      </Text>
    </View>
  );
};

export default MileageTracker;
