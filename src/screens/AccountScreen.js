import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const AccountScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const onSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { logout(); navigation.goBack(); } },
    ]);
  };

  const onRequestDeletion = () => {
    Alert.alert('Request account deletion', 'We received your request. Our support team will follow up.');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>The signed in email address is the one we use for communication and subscription.</Text>
        <Text style={[styles.infoText, { marginTop: 8 }]}>To change your email address login to the Web Dashboard with the email below.</Text>
      </View>

      <View style={{ padding: 16 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Email address</Text>
          <TouchableOpacity onPress={() => Alert.alert('Email', user ? user.email : 'Not signed in') }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>{user ? (user.email || user.name) : 'Not signed in'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <TouchableOpacity onPress={() => Alert.alert('Name', user ? user.name : 'Not signed in') }>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>{user ? user.name : ''}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
        <TouchableOpacity style={styles.signout} onPress={onSignOut}>
          <Text style={{ color: '#d32f2f', fontWeight: '700' }}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteRow} onPress={onRequestDeletion}>
        <Text style={styles.deleteText}>Request account deletion</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  infoBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 6, margin: 16 },
  infoText: { color: '#666', lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#fafafa' },
  label: { fontSize: 16, color: '#333' },
  value: { fontWeight: '700', color: '#222' },
  signout: { backgroundColor: '#fff', borderRadius: 6, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f2f2f2' },
  deleteRow: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  deleteText: { color: '#999' },
});

export default AccountScreen;
