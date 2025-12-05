import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';

const ContactsScreen = () => {
  const { contacts, addContact, updateContact, deleteContact } = useContext(DataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const openAdd = () => { setEditing(null); setName(''); setPhone(''); setEmail(''); setModalVisible(true); };
  const openEdit = (item) => { setEditing(item); setName(item.name || ''); setPhone(item.phone || ''); setEmail(item.email || ''); setModalVisible(true); };

  const save = () => {
    if (!name.trim()) return Alert.alert('Please enter a name');
    if (editing) {
      updateContact({ ...editing, name, phone, email });
    } else {
      addContact({ id: `c:${Date.now()}`, name, phone, email });
    }
    setModalVisible(false);
  };

  const remove = (id) => {
    Alert.alert('Delete contact', 'Remove this contact?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteContact({ id }) }]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Contacts</Text>
        <Text style={styles.desc}>Manage contacts connected to trips.</Text>

        <FlatList data={contacts} keyExtractor={(i) => i.id} style={{ marginTop: 12 }} renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSubtitle}>{item.phone || item.email || ''}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.smallButton}><Text style={{ color: '#fff' }}>Edit</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={[styles.smallButton, { backgroundColor: '#d32f2f', marginLeft: 8 }]}><Text style={{ color: '#fff' }}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        )} ListEmptyComponent={() => <Text style={{ color: '#666', paddingTop: 12 }}>No contacts yet.</Text>} />

        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.button} onPress={openAdd}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Add Contact</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={modalStyles.backdrop}>
            <View style={modalStyles.sheet}>
              <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>{editing ? 'Edit Contact' : 'Add Contact'}</Text>
              <TextInput placeholder="Name" value={name} onChangeText={setName} style={modalStyles.input} />
              <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={modalStyles.input} />
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={modalStyles.input} />
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

export default ContactsScreen;
