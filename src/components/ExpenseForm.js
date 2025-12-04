import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const categories = ['Gas', 'Tires', 'Lunch', 'Oil Change', 'Maintenance', 'Tolls', 'Parking', 'Other'];

const ExpenseForm = ({ initial = {}, onSave, onCancel }) => {
  const [date, setDate] = useState(initial.date || new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial.category || 'Other');
  const [notes, setNotes] = useState(initial.notes || '');
  const [classification, setClassification] = useState(initial.classification || 'Business');

  const handleSave = () => {
    const parsed = parseFloat(amount || '0');
    if (!date || !parsed) return; // minimal validation
    const out = { ...initial, id: initial.id || `exp:${Date.now()}`, date, amount: parsed, category, notes, classification };
    onSave && onSave(out);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <TextInput value={date} onChangeText={setDate} style={styles.input} />

      <Text style={styles.label}>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.row}>
        {categories.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={category === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { height: 80 }]} multiline />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <TouchableOpacity onPress={onCancel} style={styles.buttonAlt}><Text>Cancel</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.button}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12 },
  label: { marginTop: 8, marginBottom: 4, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', padding: 8, borderRadius: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  button: { backgroundColor: '#1976d2', padding: 12, borderRadius: 8, width: 120, alignItems: 'center' },
  buttonAlt: { backgroundColor: '#eee', padding: 12, borderRadius: 8, width: 120, alignItems: 'center' },
});

export default ExpenseForm;
