import React, { useContext, useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import ReportTile from '../components/ReportTile';

const parseKey = (k) => { const [y, m] = k.split('-').map(Number); return { year: y, month: m }; };

const ReportsScreen = ({ route, navigation }) => {
  const { monthKey, monthLabel, initialTab } = (route && route.params) || {};
  const { mileage = [], expenses = [] } = useContext(DataContext);
  const [active, setActive] = useState(initialTab === 'expenses' ? 1 : 0);

  const { year, month } = monthKey ? parseKey(monthKey) : { year: new Date().getFullYear(), month: new Date().getMonth() };
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  const monthDrives = useMemo(() => mileage.filter((t) => {
    const d = new Date(t.start || t.date || t.createdAt || null);
    return d && d >= monthStart && d < monthEnd;
  }), [mileage, monthKey]);

  const monthExpenses = useMemo(() => expenses.filter((e) => {
    const d = new Date(e.date || e.createdAt || null);
    return d && d >= monthStart && d < monthEnd;
  }), [expenses, monthKey]);

  const showRoutes = () => { setActive(0); };
  const showExpenses = () => { setActive(1); };

  const { updateRoute, updateExpense } = useContext(DataContext);

  // Edit modal state for single-item edit (reuse the same UX as Miscellaneous single-edit)
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editClassification, setEditClassification] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleClassifyRoute = (route, cls) => {
    try { updateRoute({ ...route, purpose: cls, classification: cls.toLowerCase() }); } catch (e) {}
  };
  const handleClassifyExpense = (exp, cls) => {
    try { updateExpense({ ...exp, classification: cls.toLowerCase() }); } catch (e) {}
  };

  const renderRoute = ({ item }) => (
    <ReportTile
      item={item}
      type="route"
      onClassify={(cls) => handleClassifyRoute(item, cls)}
      onDelete={(it) => updateRoute({ ...it, _deleted: true })}
      onEdit={(it) => {
        setEditItem({ ...it, _type: 'route' });
        setEditName(it.purpose || it.description || '');
        setEditClassification(it.classification || it.purpose || '');
        setEditDistance(it.distance ? String(it.distance) : '');
        const raw = it.start || it.createdAt || it.date || '';
        setEditDate(raw);
        setEditNotes(it.notes || '');
      }}
    />
  );

  const renderExpense = ({ item }) => (
    <ReportTile
      item={item}
      type="expense"
      onClassify={(cls) => handleClassifyExpense(item, cls)}
      onDelete={(it) => updateExpense({ ...it, _deleted: true })}
      onEdit={(it) => {
        setEditItem({ ...it, _type: 'expense' });
        setEditName(it.description || it.purpose || '');
        setEditClassification(it.classification || it.purpose || '');
        setEditAmount(it.amount ? String(it.amount) : '');
        const raw = it.createdAt || it.date || '';
        setEditDate(raw);
        setEditNotes(it.notes || '');
      }}
    />
  );

  // apply single-edit from modal
  const applyEdit = () => {
    if (!editItem) return;
    if (editItem._type === 'route') {
      const updated = { ...editItem };
      if (editName) updated.purpose = editName;
      if (editClassification) updated.purpose = editClassification;
      if (editDistance) updated.distance = Number(editDistance);
      if (editDate) updated.start = editDate;
      if (editNotes) updated.notes = editNotes;
      updateRoute(updated);
    } else {
      const updated = { ...editItem };
      if (editName) updated.description = editName;
      if (editClassification) updated.classification = editClassification;
      if (editAmount) updated.amount = Number(editAmount);
      if (editDate) updated.createdAt = editDate;
      if (editNotes) updated.notes = editNotes;
      updateExpense(updated);
    }
    // close modal
    setEditItem(null); setEditName(''); setEditClassification(''); setEditAmount(''); setEditDistance(''); setEditDate(''); setEditNotes('');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12 }}>
        <Text style={styles.headerTitle}>{monthLabel || `${monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`}</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={showRoutes} style={[styles.tabButton, active === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, active === 0 && styles.tabTextActive]}>Routes ({monthDrives.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={showExpenses} style={[styles.tabButton, active === 1 && styles.tabActive]}>
            <Text style={[styles.tabText, active === 1 && styles.tabTextActive]}>Expenses ({monthExpenses.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {active === 0 ? (
          <FlatList contentContainerStyle={{ paddingBottom: 40 }} data={monthDrives} keyExtractor={(i) => `r-${i.id || i.start || Math.random()}`} renderItem={renderRoute} ListEmptyComponent={() => <Text style={{ padding: 12 }}>No routes for this month.</Text>} />
        ) : (
          <FlatList contentContainerStyle={{ paddingBottom: 40 }} data={monthExpenses} keyExtractor={(i) => `e-${i.id || i.createdAt || Math.random()}`} renderItem={renderExpense} ListEmptyComponent={() => <Text style={{ padding: 12 }}>No expenses for this month.</Text>} />
        )}
      </View>
      {/* Edit modal (single-item) */}
      <Modal visible={!!editItem} animationType="slide" transparent={true} onRequestClose={() => setEditItem(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16 }}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>{editItem ? 'Edit' : 'Edit'}</Text>
            {editItem && (
              <>
                <Text style={{ marginBottom: 6 }}>Name</Text>
                <TextInput value={editName} onChangeText={setEditName} placeholder="Name" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                <Text style={{ marginBottom: 6 }}>Classification</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => setEditClassification('Business')} style={{ padding: 8, backgroundColor: editClassification === 'Business' ? '#4caf50' : '#eee', borderRadius: 6, marginRight: 8 }}>
                    <Text style={{ color: editClassification === 'Business' ? '#fff' : '#000' }}>Business</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditClassification('Personal')} style={{ padding: 8, backgroundColor: editClassification === 'Personal' ? '#ff7043' : '#eee', borderRadius: 6 }}>
                    <Text style={{ color: editClassification === 'Personal' ? '#fff' : '#000' }}>Personal</Text>
                  </TouchableOpacity>
                </View>
                {editItem._type === 'route' ? (
                  <>
                    <Text style={{ marginBottom: 6 }}>Distance (mi)</Text>
                    <TextInput value={editDistance} onChangeText={setEditDistance} placeholder="Distance" keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                    <Text style={{ marginBottom: 6 }}>Notes</Text>
                    <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Notes" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                  </>
                ) : (
                  <>
                    <Text style={{ marginBottom: 6 }}>Amount</Text>
                    <TextInput value={editAmount} onChangeText={setEditAmount} placeholder="0.00" keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                    <Text style={{ marginBottom: 6 }}>Notes</Text>
                    <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Notes" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                  </>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => setEditItem(null)} style={{ padding: 10, marginRight: 8 }}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={applyEdit} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 6 }}>
                    <Text style={{ color: '#fff' }}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 8, backgroundColor: '#f2f2f2' },
  tabActive: { backgroundColor: '#1976d2' },
  tabText: { color: '#333', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  itemMeta: { fontSize: 12, color: '#666', marginTop: 4 },
  badge: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 12 },
  badgeText: { color: '#222', fontSize: 12, fontWeight: '700' },
  /* Tile styles copied / adapted from Miscellaneous */
  tile: { padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 120, alignItems: 'center' },
  tileImageWrap: { width: '30%', paddingRight: 8, position: 'relative' },
  tileImagePlaceholder: { width: '100%', height: 84, borderRadius: 8, backgroundColor: '#f6f6f6' },
  tileContent: { width: '55%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 },
  tileTitle: { fontWeight: '700', fontSize: 15 },
  tileSubtitle: { color: '#666', marginTop: 6, fontSize: 13 },
  tileValue: { marginTop: 8, fontWeight: '700', color: '#333' },
  tileRightCol: { width: '15%', justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6 },
  amountBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, minWidth: 60, alignItems: 'center', justifyContent: 'center' },
  classBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minWidth: 70, alignItems: 'center', justifyContent: 'center' },
  classBadgeText: { color: '#fff', fontWeight: '700' },
});

export default ReportsScreen;
