import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

const Unclassified = () => {
  const { mileage, expenses, updateTrip, updateExpense } = useContext(DataContext);

  const unclassifiedTrips = useMemo(() => (mileage || []).filter((t) => !t.purpose || t.purpose === 'Unclassified' || t.purpose === 'unclassified'), [mileage]);
  const unclassifiedExpenses = useMemo(() => (expenses || []).filter((e) => !e.classification || e.classification === 'unclassified'), [expenses]);

  const classifyTrip = (trip, cls) => {
    const updated = { ...trip, purpose: cls };
    updateTrip(updated);
  };

  const classifyExpense = (expense, cls) => {
    const updated = { ...expense, classification: cls };
    updateExpense(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12, flex: 1 }}>

        <Text style={{ marginTop: 8, fontWeight: '700' }}>Trips</Text>
        <FlatList
          data={unclassifiedTrips}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text style={{ fontWeight: '600' }}>{item.id} — {item.distance || 0} mi</Text>
              <Text style={{ color: '#666' }}>{new Date(item.start || item.date).toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity onPress={() => classifyTrip(item, 'Business')} style={{ padding: 8, backgroundColor: '#4caf50', borderRadius: 6, marginRight: 8 }}>
                  <Text style={{ color: '#fff' }}>Business</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => classifyTrip(item, 'Personal')} style={{ padding: 8, backgroundColor: '#eee', borderRadius: 6 }}>
                  <Text>Personal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 8 }}>No unclassified trips.</Text>}
        />

        <Text style={{ marginTop: 12, fontWeight: '700' }}>Expenses</Text>
        <FlatList
          data={unclassifiedExpenses}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text style={{ fontWeight: '600' }}>{item.category || 'Expense'} — ${item.amount}</Text>
              <Text style={{ color: '#666' }}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={{ marginTop: 6 }}>{item.notes}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity onPress={() => classifyExpense(item, 'Business')} style={{ padding: 8, backgroundColor: '#4caf50', borderRadius: 6, marginRight: 8 }}>
                  <Text style={{ color: '#fff' }}>Business</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => classifyExpense(item, 'Personal')} style={{ padding: 8, backgroundColor: '#eee', borderRadius: 6 }}>
                  <Text>Personal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 8 }}>No unclassified expenses.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

export default Unclassified;
