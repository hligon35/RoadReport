import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Expenses from '../screens/Expenses';

const Stack = createNativeStackNavigator();

const ExpensesStack = () => (
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
      name="ExpensesMain"
      component={Expenses}
      options={{ title: 'Expenses' }}
    />
  </Stack.Navigator>
);

export default ExpensesStack;
