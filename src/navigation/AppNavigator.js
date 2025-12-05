import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import SettingsStack from './SettingsStack';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        {/* Profile/Settings mounted at root so header buttons can navigate to it */}
        <Stack.Screen name="Profile" component={SettingsStack} />
        {/* Future: add modal screens (export, select deliveries, settings detail) */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
