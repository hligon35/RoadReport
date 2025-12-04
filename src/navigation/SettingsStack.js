import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings from '../screens/Settings';

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      headerLargeTitle: false,
      headerStyle: { height: 56 },
      headerTitleStyle: { fontSize: 18, fontWeight: '700' },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="SettingsMain"
      component={Settings}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

export default SettingsStack;
