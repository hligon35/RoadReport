import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';

// Suppress some warnings during scaffold
LogBox.ignoreLogs(['Remote debugger']);

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <DataProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </DataProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
