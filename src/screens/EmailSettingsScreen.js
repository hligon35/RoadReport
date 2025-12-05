import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Switch, StyleSheet, AsyncStorage, Alert } from 'react-native';
import AsyncStoragePkg from '@react-native-async-storage/async-storage';

const KEY_WEEKLY = 'rr:email_weekly:v1';
const KEY_MONTHEND = 'rr:email_monthend:v1';
const KEY_OTHER = 'rr:email_other:v1';
const KEY_PROMO = 'rr:email_promo:v1';

const EmailSettingsScreen = () => {
  const [weekly, setWeekly] = useState(true);
  const [monthEnd, setMonthEnd] = useState(true);
  const [other, setOther] = useState(false);
  const [promo, setPromo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const w = await AsyncStoragePkg.getItem(KEY_WEEKLY);
        const m = await AsyncStoragePkg.getItem(KEY_MONTHEND);
        const o = await AsyncStoragePkg.getItem(KEY_OTHER);
        const p = await AsyncStoragePkg.getItem(KEY_PROMO);
        if (w !== null) setWeekly(w === '1');
        if (m !== null) setMonthEnd(m === '1');
        if (o !== null) setOther(o === '1');
        if (p !== null) setPromo(p === '1');
      } catch (e) {
        console.warn('load email settings failed', e);
      }
    })();
  }, []);

  useEffect(() => { AsyncStoragePkg.setItem(KEY_WEEKLY, weekly ? '1' : '0').catch(() => {}); }, [weekly]);
  useEffect(() => { AsyncStoragePkg.setItem(KEY_MONTHEND, monthEnd ? '1' : '0').catch(() => {}); }, [monthEnd]);
  useEffect(() => { AsyncStoragePkg.setItem(KEY_OTHER, other ? '1' : '0').catch(() => {}); }, [other]);
  useEffect(() => { AsyncStoragePkg.setItem(KEY_PROMO, promo ? '1' : '0').catch(() => {}); }, [promo]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={styles.hero}>
          <Text style={styles.heroText}>Reminders make it easy to stay on top of your mileage reporting</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Weekly email</Text>
          <Switch value={weekly} onValueChange={setWeekly} />
        </View>
        <Text style={styles.rowDesc}>Summary, details & stats for last week's drives.</Text>

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Month-end email</Text>
          <Switch value={monthEnd} onValueChange={setMonthEnd} />
        </View>
        <Text style={styles.rowDesc}>Last month at a glance - great for expense reports.</Text>

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Other email</Text>
          <Switch value={other} onValueChange={setOther} />
        </View>
        <Text style={styles.rowDesc}>Product updates, company news, resources you can use to help your business.</Text>

        <View style={styles.row}>
          <Text style={styles.rowTitle}>Promotional email</Text>
          <Switch value={promo} onValueChange={setPromo} />
        </View>
        <Text style={styles.rowDesc}>Receive special discounts and promotions from RoadBiz</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 14 },
  heroText: { fontWeight: '700', textAlign: 'center', color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#fafafa' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowDesc: { color: '#888', marginBottom: 12, marginTop: 4 },
});

export default EmailSettingsScreen;
