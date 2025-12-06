import React, { useMemo, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DataContext } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Circular progress meter: uses react-native-svg when available, otherwise falls back to static ring.
const CircleMeter = ({ percent = 0, size = 64, strokeWidth = 5, claimedColor = '#4caf50', unclaimedColor = '#ffb74d' }) => {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  // try to use react-native-svg for an arc; fallback to simple ring
  try {
    // dynamic require so bundler doesn't fail if not installed
     
    const Svg = require('react-native-svg').Svg;
    const Circle = require('react-native-svg').Circle;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (pct / 100) * circumference;
    const remaining = circumference - filled;

    return (
      <View style={[styles.meterContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* background arc (unclaimed) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={unclaimedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference}`}
            rotation={-90}
            originX={cx}
            originY={cy}
          />
          {/* foreground arc (claimed) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={claimedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${filled}, ${remaining}`}
            rotation={-90}
            originX={cx}
            originY={cy}
          />
        </Svg>
        <View style={[styles.meterInner, { width: size - (strokeWidth + 6), height: size - (strokeWidth + 6), borderRadius: (size - (strokeWidth + 6)) / 2, position: 'absolute' }]}>
          <Text style={styles.meterNumber}>{pct}%</Text>
        </View>
      </View>
    );
  } catch (e) {
    // fallback: single-color ring and percent text
    return (
      <View style={[styles.meterContainer, { width: size, height: size }]}>
        <View style={[styles.meterRing, { borderColor: claimedColor, width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]} />
        <View style={[styles.meterInner, { width: size - (strokeWidth + 6), height: size - (strokeWidth + 6), borderRadius: (size - (strokeWidth + 6)) / 2 }]}>
          <Text style={styles.meterNumber}>{pct}%</Text>
        </View>
      </View>
    );
  }
};

const Reports = () => {
  const { mileage, expenses, updateRoute } = useContext(DataContext);

  // filter to business-only
  const businessMileage = useMemo(() => (mileage || []).filter((t) => ((t.purpose || t.classification) || '').toLowerCase().includes('bus')),
    [mileage]);

  const businessExpenses = useMemo(() => (expenses || []).filter((e) => ((e.classification || '')).toLowerCase().includes('bus')),
    [expenses]);

  // totals
  const totalBusinessMiles = useMemo(() => businessMileage.reduce((s, t) => s + (Number(t.distance) || 0), 0), [businessMileage]);
  const totalBusinessExpenses = useMemo(() => businessExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [businessExpenses]);

  // compute this month totals (business only)
  const now = useMemo(() => new Date(), []);
  const thisMonthStr = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const businessMilesThisMonth = useMemo(() => businessMileage.reduce((s, t) => {
    const d = new Date(t.start || t.date || t.createdAt || null);
    return (d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) ? s + (Number(t.distance) || 0) : s;
  }, 0), [businessMileage, now]);

  const businessExpensesThisMonth = useMemo(() => businessExpenses.reduce((s, e) => {
    const d = new Date(e.date || e.createdAt || null);
    return (d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) ? s + (Number(e.amount) || 0) : s;
  }, 0), [businessExpenses, now]);


  // build month list from data (include current month)
  const monthsSet = new Set();
  const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
  (mileage || []).forEach((t) => {
    try { const d = new Date(t.start || t.date || t.createdAt); monthsSet.add(monthKey(d)); } catch (e) {}
  });
  (expenses || []).forEach((e) => {
    try { const d = new Date(e.date || e.createdAt); monthsSet.add(monthKey(d)); } catch (err) {}
  });
  // ensure current month present
  monthsSet.add(monthKey(now));

  const monthKeys = Array.from(monthsSet).sort().reverse(); // newest first

  const navigation = useNavigation();

  // helper to parse a key to year/month
  const parseKey = (k) => { const [y, m] = k.split('-').map(Number); return { year: y, month: m }; };

  // metrics per month
  const monthMetrics = monthKeys.map((k) => {
    const { year, month } = parseKey(k);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    const drives = (mileage || []).filter((t) => {
      const d = new Date(t.start || t.date || t.createdAt || null);
      return d && d >= monthStart && d < monthEnd;
    });

    const exps = (expenses || []).filter((e) => {
      const d = new Date(e.date || e.createdAt || null);
      return d && d >= monthStart && d < monthEnd;
    });

    const businessDrives = drives.filter((t) => ((t.purpose || t.classification) || '').toLowerCase().includes('bus'));
    const miscDrives = drives.filter((t) => !((t.purpose || t.classification) || '').toLowerCase().includes('bus'));

    const businessExps = exps.filter((e) => ((e.classification || '')).toLowerCase().includes('bus'));
    const miscExps = exps.filter((e) => !((e.classification || '')).toLowerCase().includes('bus'));

    const totalBusinessMilesMonth = businessDrives.reduce((s, t) => s + (Number(t.distance) || 0), 0);
    const totalMiscMilesMonth = miscDrives.reduce((s, t) => s + (Number(t.distance) || 0), 0);

    const totalBusinessExpensesMonth = businessExps.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalMiscExpensesMonth = miscExps.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    return {
      key: k,
      label: monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      drivesCount: drives.length,
      businessMiles: totalBusinessMilesMonth,
      miscMiles: totalMiscMilesMonth,
      businessExpenses: totalBusinessExpensesMonth,
      miscExpenses: totalMiscExpensesMonth,
      businessDrivesCount: businessDrives.length,
      miscDrivesCount: miscDrives.length,
    };
  });

  const handleView = (m) => {
    try { navigation.navigate('ReportsMonth', { monthKey: m.key, monthLabel: m.label }); } catch (e) { /* fallback */ }
  };

  const handleCategorize = (m) => {
    // navigate to month detail screen where user can view and categorize routes/expenses
    try {
      navigation.navigate('ReportsMonth', { monthKey: m.key, monthLabel: m.label, initialTab: 'routes' });
    } catch (e) {
      // fallback: show alert
      Alert.alert('Open month', `Open ${m.label}`);
    }
  };

  const handleSend = (m) => {
    Alert.alert('Send Report', `Send report for ${m.label}? (placeholder)`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12 }}>
        {monthMetrics.map((m) => {
          const milesDenom = Math.max(1, m.businessMiles + m.miscMiles);
          const expensesDenom = Math.max(1, m.businessExpenses + m.miscExpenses);
          const milesPct = Math.round((m.businessMiles / milesDenom) * 100);
          const expensesPct = Math.round((m.businessExpenses / expensesDenom) * 100);
          const totalExpensesForMonth = (m.businessExpenses || 0) + (m.miscExpenses || 0);
          return (
            <View key={m.key} style={styles.tile}>
              <View style={styles.tileLeft}>
                <Text style={styles.tileTitle}>{m.label}</Text>
                <Text style={styles.tileSubtitle}>{m.businessDrivesCount} trips · ${m.businessExpenses.toFixed(2)} expenses</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity onPress={() => handleView(m)} style={{ marginRight: 12 }} accessibilityLabel="View report">
                    <Ionicons name="eye" size={20} color="#1976d2" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCategorize(m)} style={{ marginRight: 12 }} accessibilityLabel="Categorize routes">
                    <Ionicons name="albums" size={20} color="#4caf50" />
                  </TouchableOpacity>
                  {m.drivesCount > 0 ? (
                    <TouchableOpacity onPress={() => handleSend(m)} accessibilityLabel="Send report">
                      <Ionicons name="send" size={20} color="#1976d2" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
              <View style={styles.tileRight}>
                  <View style={{ marginRight: 10 }}>
                    <CircleMeter percent={milesPct} size={64} strokeWidth={6} claimedColor="#4caf50" unclaimedColor="#ffb74d" />
                  </View>
                  <View>
                    <CircleMeter percent={expensesPct} size={64} strokeWidth={6} claimedColor="#4caf50" unclaimedColor="#ffb74d" />
                  </View>
                </View>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tile: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileLeft: { flex: 1, paddingRight: 12 },
  tileRight: { width: 150, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  tileTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  tileSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  tileValue: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#333' },
  meterContainer: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  meterRing: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 5, borderColor: '#1976d2', opacity: 0.18 },
  meterInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 2 },
  meterValue: { fontSize: 10, color: '#666' },
  meterNumber: { fontSize: 14, fontWeight: '800', color: '#222' },
  meterPct: { fontSize: 10, color: '#999', marginTop: 2 },
});

export default Reports;
