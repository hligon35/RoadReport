import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import useExpenses from '../hooks/useExpenses';
import ExpenseForm from '../components/ExpenseForm';

const ExpenseItem = ({ item }) => {
  const img = item.image || 'https://via.placeholder.com/160x120?text=Receipt';
  return (
    <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', overflow: 'hidden', minHeight: 110 }}>
      <View style={{ width: '35%', paddingRight: 8 }}>
        <Image source={{ uri: img }} style={{ width: '100%', height: 90, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
      </View>
      <View style={{ width: '65%', justifyContent: 'center' }}>
        <Text style={{ fontWeight: '700' }}>{item.description || item.category || 'Expense'} — ${item.amount}</Text>
        <Text style={{ color: '#666', marginTop: 6 }}>{item.date} • {item.classification || 'Miscellaneous'}</Text>
        {item.notes ? <Text style={{ marginTop: 6 }}>{item.notes}</Text> : null}
      </View>
    </View>
  );
};

const Expenses = () => {
  const { expenses, addExpense, importBankTransactions } = useExpenses();
  const [showForm, setShowForm] = useState(false);

  const handleSave = (e) => {
    addExpense(e);
    setShowForm(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setShowForm((s) => !s)} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>{showForm ? 'Close' : 'Add Expense'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={importBankTransactions} style={{ padding: 10, backgroundColor: '#4caf50', borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Import Bank</Text>
          </TouchableOpacity>
        </View>

        {showForm && <ExpenseForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

        <FlatList data={expenses} keyExtractor={(i) => i.id} renderItem={({ item }) => <ExpenseItem item={item} />} ListEmptyComponent={() => <Text style={{ color: '#666' }}>No expenses yet.</Text>} />
      </View>
    </SafeAreaView>
  );
};

export default Expenses;
