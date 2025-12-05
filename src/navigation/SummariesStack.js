import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Reports from '../screens/Reports';

const Stack = createNativeStackNavigator();

const SummariesStack = () => (
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
      name="ReportsMain"
      component={Reports}
      options={{ title: 'Reports' }}
    />
  </Stack.Navigator>
);

export default SummariesStack;
