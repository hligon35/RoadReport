import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';

const CustomPurposesScreen = () => {
  const { categories = [], addCategory, updateCategory, deleteCategory } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('business'); // 'business' | 'personal'

  const business = categories.filter((c) => c.type === 'business');
  const personal = categories.filter((c) => c.type === 'personal');

  const openAdd = (t) => { setEditing(null); setName(''); setType(t); setModalVisible(true); };
  const openEdit = (item) => { setEditing(item); setName(item.name); setType(item.type); setModalVisible(true); };

  const save = () => {
    if (!name.trim()) return Alert.alert('Name required');
    if (editing) {
      updateCategory({ ...editing, name, type });
    } else {
      addCategory({ id: `cat:${Date.now()}`, name, type });
    }
    setModalVisible(false);
  };

  const remove = (id) => {
    Alert.alert('Delete', 'Remove this category?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteCategory({ id }) }]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.desc}>Personalize your drive categories with Business and Personal custom categories.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUSINESS</Text>
          <TouchableOpacity style={styles.createRow} onPress={() => openAdd('business')}>
            <Text style={{ color: '#1976d2', fontWeight: '700' }}>+ Create new business category</Text>
          </TouchableOpacity>
          <FlatList data={business} keyExtractor={(i) => i.id} renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openEdit(item)}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => remove(item.id)}><Text style={{ color: '#d32f2f' }}>Delete</Text></TouchableOpacity>
            </TouchableOpacity>
          )} ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 12 }}>No business categories.</Text>} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONAL</Text>
          <TouchableOpacity style={styles.createRow} onPress={() => openAdd('personal')}>
            <Text style={{ color: '#1976d2', fontWeight: '700' }}>+ Create new personal category</Text>
          </TouchableOpacity>
          <FlatList data={personal} keyExtractor={(i) => i.id} renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openEdit(item)}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => remove(item.id)}><Text style={{ color: '#d32f2f' }}>Delete</Text></TouchableOpacity>
            </TouchableOpacity>
          )} ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 12 }}>No personal categories.</Text>} />
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.sheet}>
              <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>{editing ? 'Edit Category' : 'Create Category'}</Text>
              <TextInput placeholder="Name" value={name} onChangeText={setName} style={modalStyles.input} />
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setType('business')} style={[modalStyles.typeBtn, type === 'business' && modalStyles.typeActive]}><Text>Business</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setType('personal')} style={[modalStyles.typeBtn, type === 'personal' && modalStyles.typeActive, { marginLeft: 8 }]}><Text>Personal</Text></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#666', marginBottom: 12 },
  section: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#666', paddingHorizontal: 8, marginBottom: 6 },
  createRow: { paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowTitle: { fontSize: 16 },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 12 },
  typeBtn: { padding: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  typeActive: { backgroundColor: '#e8f0ff', borderColor: '#1976d2' },
});

export default CustomPurposesScreen;
