import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ExpenseLogger from '../components/ExpenseLogger';

const ExpensesScreen = () => (
  <SafeAreaView style={{ flex: 1 }}>
    <ExpenseLogger />
  </SafeAreaView>
);

export default ExpensesScreen;
