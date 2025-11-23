import React from 'react';
import { SafeAreaView } from 'react-native';
import MileageTracker from '../components/MileageTracker';

const MileageScreen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <MileageTracker />
  </SafeAreaView>
);

export default MileageScreen;
