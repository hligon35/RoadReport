import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
// Picker moved to community package. Install with:
// expo install @react-native-picker/picker
import { Picker } from '@react-native-picker/picker';
import { DataContext } from '../context/DataContext';

const categories = ['fuel', 'maintenance', 'tolls', 'parking', 'other'];

export const ExpenseLogger = () => {
  const { addExpense } = useContext(DataContext);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [note, setNote] = useState('');

  const submit = () => {
    const expense = {
      id: `e-${Date.now()}`,
      amount: Number(amount) || 0,
      category,
      note,
      date: new Date().toISOString(),
      receiptPhoto: null, // placeholder for file URI
    };
    addExpense(expense);
    setAmount('');
    setNote('');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>Expense Logger</Text>
      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      <View style={{ marginVertical: 8 }}>
        <Text>Category</Text>
        {/* Using Picker from react-native may require community picker on some platforms */}
        <Picker selectedValue={category} onValueChange={(v) => setCategory(v)}>
          {categories.map((c) => (
            <Picker.Item label={c} value={c} key={c} />
          ))}
        </Picker>
      </View>
      <TextInput
        placeholder="Note"
        value={note}
        onChangeText={setNote}
        style={{ borderWidth: 1, padding: 8, marginVertical: 8 }}
      />
      <Button title="Add Expense" onPress={submit} />
      <Text style={{ marginTop: 12, color: '#666' }}>
        Receipt upload placeholder: integrate ImagePicker/FileSystem for photos.
      </Text>
    </View>
  );
};

export default ExpenseLogger;
