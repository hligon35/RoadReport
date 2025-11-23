import React, { useContext, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { DataContext } from '../context/DataContext';
import { calculateMileageDeduction } from '../services/TaxReport';

const { width } = Dimensions.get('window');

const CircleStat = ({ label, value, subtitle }) => {
  const size = Math.min(120, Math.floor(width / 3) - 32);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: 1000,
          borderWidth: 10,
          borderColor: '#4caf50',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600' }}>{value}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: '#666' }}>{subtitle}</Text> : null}
      </View>
      <Text style={{ marginTop: 6, fontSize: 15 }}>{label}</Text>
    </View>
  );
};

const startOfWeek = (d) => {
  // Sunday-based week start
  const dt = new Date(d);
  const day = dt.getDay(); // 0 (Sun) - 6
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - day);
  return dt;
};

const inRange = (iso, start, end) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  return t >= start.getTime() && t <= end.getTime();
};

export const Dashboard = () => {
  const { mileage, expenses } = useContext(DataContext);

  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const last30Start = new Date();
  last30Start.setDate(now.getDate() - 29);
  last30Start.setHours(0, 0, 0, 0);
  const last30End = new Date();
  last30End.setHours(23, 59, 59, 999);

  const {
    weekTrips,
    weekMiles,
    weekExpensesTotal,
    weekDeduction,
    monthTrips,
    monthMiles,
    monthExpensesTotal,
    monthDeduction,
  } = useMemo(() => {
    const wTrips = mileage.filter((t) => inRange(t.start || t.date, weekStart, weekEnd));
    const wMiles = wTrips.reduce((s, t) => s + (t.distance || 0), 0);
    const wExpenses = expenses.filter((e) => inRange(e.date, weekStart, weekEnd));
    const wExpensesTotal = wExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const wDed = calculateMileageDeduction(wTrips, 'business');

    const mTrips = mileage.filter((t) => inRange(t.start || t.date, last30Start, last30End));
    const mMiles = mTrips.reduce((s, t) => s + (t.distance || 0), 0);
    const mExpenses = expenses.filter((e) => inRange(e.date, last30Start, last30End));
    const mExpensesTotal = mExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const mDed = calculateMileageDeduction(mTrips, 'business');

    return {
      weekTrips: wTrips,
      weekMiles: wMiles,
      weekExpensesTotal: wExpensesTotal,
      weekDeduction: wDed,
      monthTrips: mTrips,
      monthMiles: mMiles,
      monthExpensesTotal: mExpensesTotal,
      monthDeduction: mDed,
    };
  }, [mileage, expenses]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 22, marginBottom: 12, textAlign: 'center' }}>Dashboard</Text>

      {/* Top: This Week (Sun - Sat) */}
      <View style={{ marginBottom: 0, flex: 0.48 }}>
        <Text style={{ textAlign: 'center', marginBottom: 6, fontSize: 16 }}>This Week (Sun - Sat)</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleStat label="Trips" value={weekTrips.length} subtitle={`${weekTrips.length} total`} />
          <CircleStat label="Miles" value={Number(weekMiles).toFixed(1)} subtitle={`${weekDeduction.rate}$/mi`} />
          <CircleStat label="Expenses" value={`$${Number(weekExpensesTotal).toFixed(2)}`} subtitle={`Est: $${weekDeduction.deduction}`} />
        </View>
      </View>

      {/* Bottom: Last 30 Days */}
      <View style={{ marginTop: 4, flex: 0.48 }}>
        <Text style={{ textAlign: 'center', marginBottom: 6, fontSize: 16 }}>Last 30 Days</Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <CircleStat label="Trips" value={monthTrips.length} subtitle={`${monthTrips.length} total`} />
          <CircleStat label="Miles" value={Number(monthMiles).toFixed(1)} subtitle={`${monthDeduction.rate}$/mi`} />
          <CircleStat label="Expenses" value={`$${Number(monthExpensesTotal).toFixed(2)}`} subtitle={`Est: $${monthDeduction.deduction}`} />
        </View>
      </View>

      <Text style={{ marginTop: 8, color: '#777', textAlign: 'center' }}>
        Note: Circles are placeholders. Replace with `react-native-svg` or a charting library for interactive graphs and percentages.
      </Text>
    </View>
  );
};

export default Dashboard;
