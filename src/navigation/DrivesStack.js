import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrivesScreen from '../screens/DrivesScreen';
import ProfileHeaderButton from '../components/ProfileHeaderButton';

const Stack = createNativeStackNavigator();

const DrivesStack = () => (
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
      name="DrivesMain"
      component={DrivesScreen}
      options={{ title: 'Routes', headerRight: () => <ProfileHeaderButton /> }}
    />
  </Stack.Navigator>
);

export default DrivesStack;
