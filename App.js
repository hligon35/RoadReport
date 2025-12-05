import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { ModalCloseProvider } from './src/context/ModalCloseContext';

// Suppress some warnings during scaffold
LogBox.ignoreLogs(['Remote debugger']);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <DataProvider>
            {/* ModalCloseProvider ensures screens can register close handlers when navigation occurs */}
            <ModalCloseProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </ModalCloseProvider>
          </DataProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
