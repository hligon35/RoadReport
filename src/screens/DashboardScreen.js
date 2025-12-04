import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Dashboard from '../components/Dashboard';

const DashboardScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <Dashboard />
    </SafeAreaView>
  );
};

export default DashboardScreen;
