import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_RATES = [
  { id: 'business', label: 'Business', rate: 0.7 },
  { id: 'medical', label: 'Medical', rate: 0.21 },
  { id: 'charity', label: 'Charity', rate: 0.14 },
  { id: 'moving', label: 'Moving', rate: 0.21 },
  { id: 'personal', label: 'Personal', rate: 0.0 },
];

const STORAGE_KEY = 'rr:custom_business_rate:v1';

const MileageRatesScreen = () => {
  const [customRate, setCustomRate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setCustomRate(Number(saved));
      } catch (e) {
        console.warn('load custom rate failed', e);
      }
    })();
  }, []);

  const openEdit = () => {
    setEditingValue(customRate != null ? String(customRate.toFixed(2)) : String(DEFAULT_RATES.find((r) => r.id === 'business').rate.toFixed(2)));
    setModalVisible(true);
  };

  const save = async () => {
    const parsed = parseFloat(editingValue.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(parsed)) return Alert.alert('Invalid rate');
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(parsed));
      setCustomRate(parsed);
      setModalVisible(false);
      Alert.alert('Saved', 'Custom business rate saved');
    } catch (e) {
      console.warn('save custom rate failed', e);
      Alert.alert('Save failed');
    }
  };

  const clearCustom = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setCustomRate(null);
      Alert.alert('Reset', 'Using standard IRS rate');
    } catch (e) {
      console.warn('clear custom rate failed', e);
    }
  };

  const rates = DEFAULT_RATES.map((r) => ({ ...r, displayRate: r.id === 'business' && customRate != null ? customRate : r.rate }));

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={styles.heroBox}>
          <View style={styles.iconBox}><Text style={{ fontSize: 24 }}>🧾</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>The IRS sets standard mileage rates for the US. Current rates are listed below.</Text>
            <TouchableOpacity onPress={() => Alert.alert('Learn more', 'Open documentation (placeholder)')}>
              <Text style={styles.link}>Learn more about mileage rates</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ color: '#888', fontWeight: '700' }}>PURPOSE</Text>
          <Text style={{ color: '#888', fontWeight: '700' }}>PER MI</Text>
        </View>

        {rates.map((r) => (
          <TouchableOpacity key={r.id} style={styles.row} onPress={r.id === 'business' ? openEdit : undefined}>
            <Text style={styles.rowLeft}>{r.label}</Text>
            <Text style={styles.rowRight}>{r.displayRate === 0 ? '$0.00' : `$${r.displayRate.toFixed(2)}`}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 18 }} />
        <Text style={{ color: '#999' }}>Is your mileage reimbursed at a different rate?</Text>
        <TouchableOpacity onPress={() => Alert.alert('Dashboard', 'Set a custom business rate at dashboard.roadbiz.com (placeholder)')}>
          <Text style={[styles.link, { marginTop: 6 }]}>Set a custom business rate at dashboard.roadbiz.com</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.sheet}>
              <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Custom business rate</Text>
              <TextInput placeholder="Rate (e.g. 0.70)" value={editingValue} onChangeText={setEditingValue} keyboardType="decimal-pad" style={modalStyles.input} />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={clearCustom} style={{ padding: 10, marginRight: 8 }}><Text style={{ color: '#d32f2f' }}>Reset</Text></TouchableOpacity>
                <TouchableOpacity onPress={save} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 6 }}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heroBox: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12 },
  iconBox: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#eee' },
  heroTitle: { fontWeight: '700', color: '#333' },
  link: { color: '#1976d2', marginTop: 6 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#fafafa', paddingHorizontal: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowLeft: { fontSize: 16 },
  rowRight: { fontWeight: '700' },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 12 },
});

export default MileageRatesScreen;
