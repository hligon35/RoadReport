import React, { useContext, useMemo, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, SectionList, TextInput, TouchableOpacity, Animated } from 'react-native';
import MonthlySummaryBar from '../components/MonthlySummaryBar';
import DriveCard from '../components/DriveCard';
import { DataContext } from '../context/DataContext';
import TaxReportService from '../services/TaxReport';

const startOfMonth = (d) => {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const DrivesScreen = () => {
  const { mileage, expenses, addTrip, updateTrip, deleteTrip } = useContext(DataContext);

  // Fallback mock data when there are no drives yet
  const mockDrives = [
    {
      id: 'm-1',
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30).toISOString(),
      distance: 13.6,
      purpose: 'Business',
      status: 'logged',
      notes: 'Client meeting',
      startCoords: { latitude: 40.7128, longitude: -74.0060 },
    },
    {
      id: 'm-2',
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 20).toISOString(),
      distance: 7.2,
      purpose: 'Personal',
      status: 'pending',
      notes: '',
      startCoords: { latitude: 34.0522, longitude: -118.2437 },
    },
  ];

  const monthStart = startOfMonth(new Date());
  const monthEnd = new Date();
  monthEnd.setHours(23, 59, 59, 999);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastDeleted, setLastDeleted] = useState(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

  const { drivesThisMonth, drivesToShow, totalMiles, totalValue } = useMemo(() => {
    const allDrives = (mileage && mileage.length > 0) ? mileage : mockDrives;
    const drivesThisMonth = allDrives.filter((d) => new Date(d.start || d.date) >= monthStart && new Date(d.start || d.date) <= monthEnd);
    const totalMiles = drivesThisMonth.reduce((s, d) => s + (d.distance || 0), 0);
    const totalValue = TaxReportService.calculateMileageDeduction(drivesThisMonth, 'business').deduction;
    return { drivesThisMonth, drivesToShow: allDrives, totalMiles, totalValue };
  }, [mileage, expenses]);

  const filteredDrives = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivesToShow.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!q) return true;
      // search by purpose, notes, or id
      return (
        (d.purpose || '').toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q) ||
        (d.id || '').toLowerCase().includes(q)
      );
    });
  }, [drivesToShow, query, statusFilter]);

  const handleDelete = (drive) => {
    if (!drive || !drive.id) return;
    // remove from store and keep a copy to allow undo
    setLastDeleted(drive);
    deleteTrip(drive);
    // show undo (animate in)
    Animated.timing(undoAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    // auto clear after 7s
    setTimeout(() => {
      Animated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setLastDeleted(null));
    }, 7000);
  };

  const handleReclassify = (drive) => {
    const newPurpose = drive.purpose === 'Business' ? 'Personal' : 'Business';
    updateTrip({ ...drive, purpose: newPurpose });
  };

  const handleSave = (updated) => {
    // persist updated drive
    if (updated && updated.id) updateTrip(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }} edges={[ 'left', 'right', 'bottom' ]}>
      {/* Sticky header */}
      <MonthlySummaryBar totalDrives={drivesThisMonth.length} totalMiles={totalMiles} loggedValue={totalValue} />

      {/* Search and filters */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, backgroundColor: '#f6f7fb' }}>
        <TextInput
          placeholder="Search drives by purpose, notes, or id"
          value={query}
          onChangeText={setQuery}
          style={{ backgroundColor: '#fff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0' }}
          accessibilityLabel="Search drives"
        />
        <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            {['all', 'logged', 'pending'].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStatusFilter(s)} style={{ marginRight: 8 }} accessibilityLabel={`Filter ${s}`}>
                <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: statusFilter === s ? '#4caf50' : '#fff', borderWidth: 1, borderColor: '#ddd' }}>
                  <Text style={{ color: statusFilter === s ? '#fff' : '#333' }}>{s === 'all' ? 'All' : s}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <SectionList
        sections={[{ title: 'Drives', data: filteredDrives }]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // compute week range for this drive (Sunday - Saturday)
          const d = new Date(item.start || item.date || Date.now());
          const day = d.getDay();
          const weekStart = new Date(d);
          weekStart.setHours(0, 0, 0, 0);
          weekStart.setDate(weekStart.getDate() - day);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          const allDrives = (mileage && mileage.length > 0) ? mileage : mockDrives;
          const weekDrives = allDrives.filter((dd) => new Date(dd.start || dd.date) >= weekStart && new Date(dd.start || dd.date) <= weekEnd);
          const weekDeduction = TaxReportService.calculateMileageDeduction(weekDrives, 'business').deduction;
          return (
            <DriveCard drive={item} weekDeduction={weekDeduction} onDelete={handleDelete} onReclassify={handleReclassify} onSave={handleSave} />
          );
        }}
        renderSectionHeader={() => null}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        accessibilityLabel="List of drives"
        ListEmptyComponent={() => (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No drives match your search.</Text>
          </View>
        )}
      />

      {/* Undo banner */}
      {lastDeleted && (
        <Animated.View style={{ position: 'absolute', left: 12, right: 12, bottom: 24, transform: [{ translateY: undoAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
          <View style={{ backgroundColor: '#333', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', flex: 1 }}>Drive deleted</Text>
            <TouchableOpacity onPress={() => {
              // restore
              addTrip(lastDeleted);
              setLastDeleted(null);
              Animated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
            }}>
              <Text style={{ color: '#4caf50', fontWeight: '700', marginLeft: 12 }}>UNDO</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default DrivesScreen;
