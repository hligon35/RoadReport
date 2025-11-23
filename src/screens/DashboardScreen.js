import React from 'react';
import { SafeAreaView } from 'react-native';
import Dashboard from '../components/Dashboard';

const DashboardScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Dashboard />
    </SafeAreaView>
  );
};

export default DashboardScreen;
