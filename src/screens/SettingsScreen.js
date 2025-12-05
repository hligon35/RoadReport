import React, { useContext, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import DriveDetection from '../services/DriveDetection';
import { useNavigation } from '@react-navigation/native';
import { Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { user, logout, loginMock } = useContext(AuthContext);
  const navigation = useNavigation();
  const [driveDetectionPaused, setDriveDetectionPaused] = useState(true);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [detectionSensitivity, setDetectionSensitivity] = useState('Medium');
  const [useMetric, setUseMetric] = useState(false);

  const handleUpgrade = () => {
    Alert.alert('Upgrade', 'Open upgrade flow (placeholder)');
  };

  const rows = (title, items) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((it, idx) => (
        <TouchableOpacity key={idx} style={styles.row} onPress={it.onPress} disabled={!it.onPress}>
          <View style={styles.rowLeft}>
            <View style={styles.iconCircle}>{it.icon}</View>
            <Text style={styles.rowTitle}>{it.title}</Text>
          </View>
          <View style={styles.rowRight}>
            {it.value ? <Text style={styles.rowValue}>{it.value}</Text> : null}
            {it.hasToggle ? (
              <Switch value={it.toggleValue} onValueChange={it.onToggle} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#999" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const onShare = async () => {
    try {
      await Share.share({ message: 'Check out RoadBiz — automatic mileage tracking and easy reports.' });
    } catch (e) {
      Alert.alert('Share failed');
    }
  };

  const startDetection = async () => {
    try {
      await DriveDetection.startDriveMonitoring((sample) => {
        Alert.alert('Drive detected', `Detected a drive: ${sample.distance} km`);
      });
      setMonitoringActive(true);
      setDriveDetectionPaused(false);
      Alert.alert('Drive detection', 'Monitoring started');
    } catch (e) {
      Alert.alert('Drive detection', 'Failed to start');
    }
  };

  const stopDetection = async () => {
    try {
      await DriveDetection.stopDriveMonitoring();
      setMonitoringActive(false);
      setDriveDetectionPaused(true);
      Alert.alert('Drive detection', 'Monitoring stopped');
    } catch (e) {
      Alert.alert('Drive detection', 'Failed to stop');
    }
  };

  const toggleMonitoring = () => {
    if (monitoringActive) stopDetection(); else startDetection();
  };

  const cycleSensitivity = () => {
    const opts = ['Low', 'Medium', 'High'];
    const idx = opts.indexOf(detectionSensitivity);
    const next = opts[(idx + 1) % opts.length];
    setDetectionSensitivity(next);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ padding: 16 }}>
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=60' }} style={styles.hero} imageStyle={{ borderRadius: 12 }}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Go Unlimited.</Text>
              <Text style={styles.heroSubtitle}>You have 40 free drives left this month.</Text>
              <TouchableOpacity style={styles.heroButton} onPress={handleUpgrade}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Upgrade for more</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          {rows('ACCOUNT', [
            { title: 'Signed in', value: user ? (user.email || user.name) : 'Not signed in', icon: <Ionicons name="person-circle-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('Account') },
            { title: 'Drive Detection', value: driveDetectionPaused ? 'Paused' : 'On', icon: <Ionicons name="navigate-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('DriveDetection') },
            { title: 'Help', icon: <Ionicons name="help-circle-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('Help') },
          ])}

          {rows('PERSONALIZATION', [
            { title: 'Named Locations', value: '4', icon: <Ionicons name="location-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('NamedLocations') },
            { title: 'Vehicles', value: '1', icon: <Ionicons name="car-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('Vehicles') },
            { title: 'Categories', icon: <Ionicons name="pricetag-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('CustomPurposes') },
            { title: 'Contacts', icon: <Ionicons name="person-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('Contacts') },
            { title: 'Mileage Rates', value: 'US', icon: <Ionicons name="calculator-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('MileageRates') },
            { title: 'Use Metric Units (km)', hasToggle: true, toggleValue: useMetric, onToggle: setUseMetric, icon: <Ionicons name="ruler" size={20} color="#444" /> },
          ])}

          {/* 'Frequent Drives' moved into Drive Detection screen */}

          {rows('OTHER SETTINGS', [
            { title: 'Email Communications', icon: <Ionicons name="mail-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('EmailSettings') },
            { title: 'Push Notifications', icon: <Ionicons name="notifications-outline" size={20} color="#444" />, onPress: () => navigation && navigation.navigate('PushNotifications') },
            { title: 'Share RoadBiz', icon: <Ionicons name="share-social-outline" size={20} color="#444" />, onPress: () => onShare() },
            { title: 'Version', value: '5.29.0', icon: <Ionicons name="information-circle-outline" size={20} color="#444" />, onPress: null },
          ])}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  heroContent: { flex: 1, padding: 16, justifyContent: 'flex-end' },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  heroButton: { backgroundColor: '#1976d2', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, alignSelf: 'flex-start' },
  section: { marginTop: 8, backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', paddingHorizontal: 8, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { color: '#666', marginRight: 8, fontWeight: '600' },
});

export default SettingsScreen;
