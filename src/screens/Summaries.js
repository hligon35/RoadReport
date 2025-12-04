import React, { useMemo, useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { DataContext } from '../context/DataContext';

const SummaryCard = ({ title, value }) => (
  <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 }}>
    <Text style={{ color: '#666' }}>{title}</Text>
    <Text style={{ fontSize: 20, fontWeight: '700' }}>{value}</Text>
  </View>
);

const Summaries = () => {
  const { mileage, expenses } = useContext(DataContext);
  const [mode, setMode] = useState('mileage');

  const totals = useMemo(() => {
    const mileageTotals = (mileage || []).reduce(
      (acc, t) => {
        const cls = (t.purpose || t.classification || 'Personal').toLowerCase().includes('bus') ? 'business' : 'personal';
        acc[cls] = acc[cls] + (t.distance || 0);
        acc.total += (t.distance || 0);
        return acc;
      },
      { business: 0, personal: 0, total: 0 }
    );

    const expenseTotals = (expenses || []).reduce(
      (acc, e) => {
        const cls = (e.classification || 'Personal').toLowerCase().includes('bus') ? 'business' : 'personal';
        acc[cls] = acc[cls] + (e.amount || 0);
        acc.total += (e.amount || 0);
        return acc;
      },
      { business: 0, personal: 0, total: 0 }
    );

    return { mileageTotals, expenseTotals };
  }, [mileage, expenses]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setMode('mileage')} style={{ padding: 8, backgroundColor: mode === 'mileage' ? '#1976d2' : '#eee', borderRadius: 8 }}>
            <Text style={{ color: mode === 'mileage' ? '#fff' : '#333' }}>Mileage</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('expenses')} style={{ padding: 8, backgroundColor: mode === 'expenses' ? '#1976d2' : '#eee', borderRadius: 8 }}>
            <Text style={{ color: mode === 'expenses' ? '#fff' : '#333' }}>Expenses</Text>
          </TouchableOpacity>
        </View>

        {mode === 'mileage' ? (
          <>
            <SummaryCard title="Business Miles" value={`${totals.mileageTotals.business.toFixed(2)} mi`} />
            <SummaryCard title="Personal Miles" value={`${totals.mileageTotals.personal.toFixed(2)} mi`} />
            <SummaryCard title="Total Miles" value={`${totals.mileageTotals.total.toFixed(2)} mi`} />
          </>
        ) : (
          <>
            <SummaryCard title="Business Expenses" value={`$${totals.expenseTotals.business.toFixed(2)}`} />
            <SummaryCard title="Personal Expenses" value={`$${totals.expenseTotals.personal.toFixed(2)}`} />
            <SummaryCard title="Total Expenses" value={`$${totals.expenseTotals.total.toFixed(2)}`} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Summaries;
