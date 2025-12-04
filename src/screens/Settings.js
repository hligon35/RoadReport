import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Button } from 'react-native';
import { DataContext } from '../context/DataContext';

const Settings = () => {
  const { clearAll } = useContext(DataContext);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 16 }}>
        <Button title="Clear All Local Data" onPress={() => clearAll()} color="#e53935" />
        <View style={{ height: 12 }} />
        <Text style={{ color: '#666', marginTop: 16 }}>Profile, export, and environment toggles live here.</Text>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
