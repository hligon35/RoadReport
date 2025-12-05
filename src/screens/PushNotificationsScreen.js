import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_CLASS_ALERTS = 'rr:push_class_alerts:v1';
const KEY_CLASS_FREQ = 'rr:push_class_freq:v1';
const KEY_DEALS = 'rr:push_deals:v1';
const KEY_FEATURES = 'rr:push_features:v1';

const PushNotificationsScreen = () => {
  const [classificationAlerts, setClassificationAlerts] = useState(true);
  const [classificationFreq, setClassificationFreq] = useState('each'); // 'each'|'daily'|'weekly'
  const [deals, setDeals] = useState(true);
  const [features, setFeatures] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const a = await AsyncStorage.getItem(KEY_CLASS_ALERTS);
        const f = await AsyncStorage.getItem(KEY_CLASS_FREQ);
        const d = await AsyncStorage.getItem(KEY_DEALS);
        const ft = await AsyncStorage.getItem(KEY_FEATURES);
        if (a !== null) setClassificationAlerts(a === '1');
        if (f !== null) setClassificationFreq(f);
        if (d !== null) setDeals(d === '1');
        if (ft !== null) setFeatures(ft === '1');
      } catch (e) {
        console.warn('load push settings failed', e);
      }
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem(KEY_CLASS_ALERTS, classificationAlerts ? '1' : '0').catch(() => {}); }, [classificationAlerts]);
  useEffect(() => { AsyncStorage.setItem(KEY_CLASS_FREQ, classificationFreq).catch(() => {}); }, [classificationFreq]);
  useEffect(() => { AsyncStorage.setItem(KEY_DEALS, deals ? '1' : '0').catch(() => {}); }, [deals]);
  useEffect(() => { AsyncStorage.setItem(KEY_FEATURES, features ? '1' : '0').catch(() => {}); }, [features]);

  const selectFreq = (val) => {
    if (!classificationAlerts) {
      Alert.alert('Enable alerts', 'Turn on Classification Alerts to change frequency');
      return;
    }
    setClassificationFreq(val);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DRIVE CLASSIFICATION</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Classification Alerts</Text>
            <Switch value={classificationAlerts} onValueChange={setClassificationAlerts} />
          </View>

          <TouchableOpacity style={styles.row} onPress={() => selectFreq('each')}>
            <Text style={styles.rowTitle}>Each Drive</Text>
            {classificationFreq === 'each' ? <Text style={styles.check}>✓</Text> : null}
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => selectFreq('daily')}>
            <Text style={styles.rowTitle}>Daily</Text>
            {classificationFreq === 'daily' ? <Text style={styles.check}>✓</Text> : null}
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => selectFreq('weekly')}>
            <Text style={styles.rowTitle}>Weekly</Text>
            {classificationFreq === 'weekly' ? <Text style={styles.check}>✓</Text> : null}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>ROADBIZ NEWS</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Deals and Giveaways</Text>
            <Switch value={deals} onValueChange={setDeals} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Feature Discovery and Tips</Text>
            <Switch value={features} onValueChange={setFeatures} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  section: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, borderWidth: 1, borderColor: '#f0f0f0' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', paddingHorizontal: 8, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowTitle: { fontSize: 16 },
  check: { color: '#1976d2', fontWeight: '700' },
});

export default PushNotificationsScreen;
