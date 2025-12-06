import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import ExpenseLogger from '../components/ExpenseLogger';
import { DataContext } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

const placeholderImg = require('../../assets/icon.png');

const ExpensesScreen = () => {
  const { expenses = [], updateExpense, deleteExpense } = useContext(DataContext);

  const renderItem = ({ item }) => {
    const imgSource = item.receiptPhoto ? { uri: item.receiptPhoto } : (item.image ? { uri: item.image } : placeholderImg);
    const dateStr = item.date ? new Date(item.date).toLocaleString() : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '');

    return (
      <View style={{ padding: 12 }}>
        <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', minHeight: 100 }}>
          <View style={{ width: '28%', paddingRight: 8 }}>
            <Image source={imgSource} style={{ width: '100%', height: 80, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
          </View>

          <View style={{ width: '54%', paddingLeft: 8, justifyContent: 'center' }}>
            <Text style={{ fontWeight: '700' }}>{item.description || item.category || 'Expense'}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{dateStr}</Text>
            {item.notes ? <Text style={{ marginTop: 6 }}>{item.notes}</Text> : null}
          </View>

          <View style={{ width: '18%', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={{ color: '#222', fontWeight: '800' }}>
              {typeof item.amount === 'number' ? `$${item.amount.toFixed(2)}` : (item.amount ? `$${Number(item.amount).toFixed(2)}` : '')}
            </Text>
            <TouchableOpacity onPress={() => updateExpense && updateExpense(item)} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginTop: 8 }}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteExpense && deleteExpense(item)} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6, marginTop: 8 }}>
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
      <ExpenseLogger />
      <FlatList
        data={expenses}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No expenses yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ExpensesScreen;
