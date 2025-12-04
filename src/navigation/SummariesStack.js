import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Summaries from '../screens/Summaries';

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
      name="SummariesMain"
      component={Summaries}
      options={{ title: 'Summaries' }}
    />
  </Stack.Navigator>
);

export default SummariesStack;
