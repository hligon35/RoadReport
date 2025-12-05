import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';

const VehiclesScreen = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');

  const openAdd = () => { setEditing(null); setMake(''); setModel(''); setYear(''); setPlate(''); setModalVisible(true); };
  const openEdit = (item) => { setEditing(item); setMake(item.make || ''); setModel(item.model || ''); setYear(item.year ? String(item.year) : ''); setPlate(item.plate || ''); setModalVisible(true); };

  const save = () => {
    if (!make.trim() && !model.trim()) return Alert.alert('Please enter make or model');
    if (editing) {
      updateVehicle({ ...editing, make, model, year: year ? Number(year) : null, plate });
    } else {
      addVehicle({ id: `veh:${Date.now()}`, make, model, year: year ? Number(year) : null, plate });
    }
    setModalVisible(false);
  };

  const remove = (id) => {
    Alert.alert('Delete vehicle', 'Remove this vehicle?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle({ id }) }]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Vehicles</Text>
        <Text style={styles.desc}>Manage vehicles used for tracking.</Text>

        <FlatList data={vehicles} keyExtractor={(i) => i.id} style={{ marginTop: 12 }} renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{item.make} {item.model}</Text>
              <Text style={styles.rowSubtitle}>{item.year ? item.year : ''} {item.plate ? `· ${item.plate}` : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.smallButton}><Text style={{ color: '#fff' }}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={[styles.smallButton, { backgroundColor: '#d32f2f', marginLeft: 8 }]}><Text style={{ color: '#fff' }}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )} ListEmptyComponent={() => <Text style={{ color: '#666', paddingTop: 12 }}>No vehicles yet.</Text>} />

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.button} onPress={openAdd}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Add Vehicle</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.sheet}>
              <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
              <TextInput placeholder="Make" value={make} onChangeText={setMake} style={modalStyles.input} />
              <TextInput placeholder="Model" value={model} onChangeText={setModel} style={modalStyles.input} />
              <TextInput placeholder="Year" value={year} onChangeText={setYear} keyboardType="numeric" style={modalStyles.input} />
              <TextInput placeholder="Plate" value={plate} onChangeText={setPlate} style={modalStyles.input} />
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
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#666' },
  button: { backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  rowTitle: { fontWeight: '700' },
  rowSubtitle: { color: '#666', marginTop: 4 },
  smallButton: { backgroundColor: '#1976d2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 12 },
});

export default VehiclesScreen;
