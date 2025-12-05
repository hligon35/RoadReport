import React, { useMemo, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Swipeable } from 'react-native-gesture-handler';

const Miscellaneous = () => {
  const { mileage, expenses, updateRoute, updateExpense } = useContext(DataContext);

  const formatSpelledDateTime = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const date = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
      const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      return `${date} - ${time}`;
    } catch (e) {
      return new Date(iso).toString();
    }
  };

  const unclassifiedRoutes = useMemo(() => (mileage || []).filter((t) => !t.purpose || t.purpose === 'miscellaneous' || String(t.purpose).toLowerCase().includes('misc')), [mileage]);
  const unclassifiedExpenses = useMemo(() => (expenses || []).filter((e) => !e.classification || e.classification === 'miscellaneous' || String(e.classification).toLowerCase().includes('misc')), [expenses]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkEditVisible, setBulkEditVisible] = useState(false);
  const [bulkName, setBulkName] = useState('');
  const [bulkClassification, setBulkClassification] = useState('');
  const swipeableRefs = useRef(new Map());

  const classifyRoute = (route, cls) => {
    const updated = { ...route, purpose: cls };
    updateRoute(updated);
  };

  const classifyExpense = (expense, cls) => {
    const updated = { ...expense, classification: cls };
    updateExpense(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12, flex: 1 }}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', fontSize: 18 }}>Miscellaneous Items</Text>
          {!selectionMode ? (
            <TouchableOpacity onPress={() => { setSelectionMode(true); setSelectedIds(new Set()); }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1565c0', borderRadius: 8 }}>
              <Ionicons name="checkbox-outline" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => { if (selectedIds.size) { setBulkEditVisible(true); } }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1976d2', borderRadius: 8, marginRight: 8 }}>
                <Ionicons name="pencil" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (selectedIds.size) {
                  Alert.alert('Delete items', `Delete ${selectedIds.size} items?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {
                    selectedIds.forEach((id) => {
                      const route = (mileage || []).find((t) => t.id === id);
                      if (route) updateRoute({ ...route, _deleted: true });
                      const exp = (expenses || []).find((e) => e.id === id);
                      if (exp) updateExpense({ ...exp, _deleted: true });
                    });
                    setSelectionMode(false); setSelectedIds(new Set());
                  } }]);
                }
              }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#d32f2f', borderRadius: 8, marginRight: 8 }}>
                <Ionicons name="trash" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedIds(new Set()); }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#9e9e9e', borderRadius: 8 }}>
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <FlatList
          data={(() => {
            const routes = (unclassifiedRoutes || []).map((t) => ({ ...t, _type: 'route', key: t.id }));
            const exps = (unclassifiedExpenses || []).map((e) => ({ ...e, _type: 'expense', key: e.id }));
            const combined = [...routes, ...exps];
            combined.sort((a, b) => new Date(b.start || b.date) - new Date(a.start || a.date));
            return combined;
          })()}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const img = item._type === 'route' ? (item.mapImage || 'https://via.placeholder.com/160x120?text=Map') : (item.image || 'https://via.placeholder.com/160x120?text=Receipt');

            const renderLeftActions = () => (
              <View style={{ justifyContent: 'center', paddingLeft: 12 }}>
                <TouchableOpacity onPress={() => { if (item._type === 'route') classifyRoute(item, 'Business'); else classifyExpense(item, 'Business'); }} style={{ backgroundColor: '#4caf50', padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: '#fff' }}>Business</Text>
                </TouchableOpacity>
              </View>
            );

            const renderRightActions = () => (
              <View style={{ justifyContent: 'center', paddingRight: 12 }}>
                <TouchableOpacity onPress={() => { if (item._type === 'route') classifyRoute(item, 'Personal'); else classifyExpense(item, 'Personal'); }} style={{ backgroundColor: '#ff7043', padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: '#fff' }}>Personal</Text>
                </TouchableOpacity>
              </View>
            );

            return (
              <Swipeable renderLeftActions={renderLeftActions} renderRightActions={renderRightActions}>
                <TouchableOpacity onPress={() => { if (selectionMode) {
                    const s = new Set(selectedIds);
                    if (s.has(item.key)) s.delete(item.key); else s.add(item.key);
                    setSelectedIds(s);
                  }
                }} activeOpacity={0.9}>
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: selectionMode && selectedIds.has(item.key) ? '#e3f2fd' : '#fff', marginTop: 12, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 110, position: 'relative' }}>
                    {selectionMode ? (
                      <TouchableOpacity onPress={() => {
                        const s = new Set(selectedIds);
                        if (s.has(item.key)) s.delete(item.key); else s.add(item.key);
                        setSelectedIds(s);
                      }} style={{ position: 'absolute', left: 12, top: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: selectedIds.has(item.key) ? '#1976d2' : '#fff', borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', zIndex: 5 }}>
                        {selectedIds.has(item.key) ? <Ionicons name="checkmark" size={18} color="#fff" /> : <Ionicons name="ellipse-outline" size={18} color="#9e9e9e" />}
                      </TouchableOpacity>
                    ) : null}
                    <View style={{ width: '35%', paddingRight: 8, marginLeft: selectionMode ? 48 : 0, position: 'relative' }}>
                      <Image source={{ uri: img }} style={{ width: '100%', height: 90, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
                      {/* Badge placed as part of the image (top-right corner) */}
                      <View style={{ position: 'absolute', right: 0, top: -8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: item._type === 'route' ? '#2e7d32' : '#6d4c41' }}>{item._type === 'route' ? 'Route' : 'Expense'}</Text>
                      </View>
                    </View>
                    <View style={{ width: '55%', justifyContent: 'center' }}>
                      {item._type === 'route' ? (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', flex: 1, marginRight: 8 }}>{item.purpose || 'Miscellaneous'}</Text>
                            <View style={{ backgroundColor: 'rgba(255,165,0,0.50)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 80, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: '#000', fontWeight: '800', fontSize: 14, opacity: 1, backgroundColor: 'transparent' }}>{Number(item.distance || 0).toFixed(1)} mi</Text>
                            </View>
                          </View>
                          <Text style={{ color: '#666', marginTop: 6 }}>{formatSpelledDateTime(item.start || item.date)}</Text>
                          {item.notes ? <Text style={{ marginTop: 6 }}>{item.notes}</Text> : null}
                        </>
                      ) : (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', flex: 1, marginRight: 8 }}>{item.purpose || 'Miscellaneous'}</Text>
                            <View style={{ backgroundColor: 'rgba(255,165,0,0.50)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 80, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: '#000', fontWeight: '800', fontSize: 14, opacity: 1, backgroundColor: 'transparent' }}>{item.amount ? `$${Number(item.amount).toFixed(2)}` : ''}</Text>
                            </View>
                          </View>
                          <Text style={{ color: '#666', marginTop: 6 }}>{formatSpelledDateTime(item.createdAt || item.date)}</Text>
                          {item.notes ? <Text style={{ marginTop: 6 }}>{item.notes}</Text> : null}
                        </>
                      )}
                    </View>
                    <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => { setSelectedIds(new Set([item.key])); setBulkEditVisible(true); setBulkName(''); setBulkClassification(''); }} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginBottom: 6 }}>
                        <Ionicons name="pencil" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        Alert.alert('Delete', 'Delete this item?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {
                          if (item._type === 'route') updateRoute({ ...item, _deleted: true }); else updateExpense({ ...item, _deleted: true });
                        } }]);
                      }} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6 }}>
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
          ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 8 }}>No miscellaneous items.</Text>}
        />

        <Modal visible={bulkEditVisible} animationType="slide" transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16 }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Bulk Edit</Text>
              <Text style={{ marginBottom: 6 }}>Name (leave blank to keep)</Text>
              <TextInput value={bulkName} onChangeText={setBulkName} placeholder="New name" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
              <Text style={{ marginBottom: 6 }}>Classification</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setBulkClassification('Business')} style={{ padding: 8, backgroundColor: bulkClassification === 'Business' ? '#4caf50' : '#eee', borderRadius: 6, marginRight: 8 }}>
                  <Text style={{ color: bulkClassification === 'Business' ? '#fff' : '#000' }}>Business</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBulkClassification('Personal')} style={{ padding: 8, backgroundColor: bulkClassification === 'Personal' ? '#ff7043' : '#eee', borderRadius: 6 }}>
                  <Text style={{ color: bulkClassification === 'Personal' ? '#fff' : '#000' }}>Personal</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => { setBulkEditVisible(false); setSelectedIds(new Set()); }} style={{ padding: 10, marginRight: 8 }}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  // apply bulk edit
                    selectedIds.forEach((id) => {
                      const route = (mileage || []).find((t) => t.id === id);
                      if (route) {
                        const updated = { ...route };
                        if (bulkName) updated.purpose = bulkName;
                        if (bulkClassification) updated.purpose = bulkClassification;
                        updateRoute(updated);
                      }
                      const exp = (expenses || []).find((e) => e.id === id);
                      if (exp) {
                        const updated = { ...exp };
                        if (bulkName) updated.description = bulkName;
                        if (bulkClassification) updated.classification = bulkClassification;
                        updateExpense(updated);
                      }
                    });
                  setBulkEditVisible(false); setSelectedIds(new Set()); setSelectionMode(false);
                }} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 6 }}>
                  <Text style={{ color: '#fff' }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Miscellaneous;
