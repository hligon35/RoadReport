import React, { useContext, useMemo, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, SectionList, TextInput, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import MonthlySummaryBar from '../components/MonthlySummaryBar';
// DriveCard replaced with inline tile layout to match Miscellaneous styling
import { DataContext } from '../context/DataContext';
import TaxReportService from '../services/TaxReport';

const startOfMonth = (d) => {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const DrivesScreen = () => {
  const { mileage, expenses, addRoute, updateRoute, deleteRoute } = useContext(DataContext);

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
    deleteRoute(drive);
    // show undo (animate in)
    Animated.timing(undoAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    // auto clear after 7s
    setTimeout(() => {
      Animated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setLastDeleted(null));
    }, 7000);
  };

  const handleReclassify = (drive) => {
    const newPurpose = drive.purpose === 'Business' ? 'Personal' : 'Business';
    updateRoute({ ...drive, purpose: newPurpose });
  };

  const handleSave = (updated) => {
    // persist updated drive
    if (updated && updated.id) updateRoute(updated);
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
            {['all', 'logged'].map((s) => (
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
          // Render tile using Miscellaneous-style layout (no badge)
          const img = item.mapImage || 'https://via.placeholder.com/160x120?text=Map';
          const startAddr = (item.startAddress || item.origin || item.from || item.startLabel || item.startName) || '123 Main St, Anytown';
          const endAddr = (item.endAddress || item.destination || item.to || item.endLabel || item.endName) || '456 Market St, Anytown';
          const startDisplay = startAddr;
          const formatted = item.start ? new Date(item.start).toLocaleString() : (item.date ? new Date(item.date).toLocaleString() : '');
          const swipeRef = React.createRef();
          const renderLeftActions = (progress, dragX) => {
            const trans = dragX.interpolate({ inputRange: [0, 120], outputRange: [-20, 0], extrapolate: 'clamp' });
            const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
            return (
              <Animated.View style={{ justifyContent: 'center', paddingLeft: 12, transform: [{ translateX: trans }], opacity }}>
                <View style={{ backgroundColor: '#4caf50', padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Business</Text>
                </View>
              </Animated.View>
            );
          };
          const renderRightActions = (progress, dragX) => {
            const trans = dragX.interpolate({ inputRange: [-120, 0], outputRange: [0, 20], extrapolate: 'clamp' });
            const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
            return (
              <Animated.View style={{ justifyContent: 'center', paddingRight: 12, transform: [{ translateX: trans }], opacity }}>
                <View style={{ backgroundColor: '#ff7043', padding: 12, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Personal</Text>
                </View>
              </Animated.View>
            );
          };

          return (
            <Swipeable
              ref={swipeRef}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              friction={1.2}
              overshootLeft={true}
              overshootRight={true}
              leftThreshold={80}
              rightThreshold={80}
              onSwipeableOpen={(direction) => {
                try {
                  if (direction === 'left') handleReclassify({ ...item, purpose: 'Business' }); else handleReclassify({ ...item, purpose: 'Personal' });
                } catch (e) {}
                try { swipeRef && swipeRef.current && swipeRef.current.close && swipeRef.current.close(); } catch (e) {}
              }}
            >
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 150 }}>
              <View style={{ width: '35%', paddingRight: 8, position: 'relative', marginTop:5 }}>
                <Image source={{ uri: img }} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
              </View>
              <View style={{ width: '55%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', textAlign: 'left', alignSelf: 'flex-start' }}>{item.purpose || 'Miscellaneous'}</Text>
                </View>
                <Text style={{ color: '#666', marginTop: 15, textAlign: 'left', alignSelf: 'flex-start' }}>{formatted}</Text>
                <View style={{ flexDirection: 'row', marginTop: 23, marginLeft:-13, alignItems: 'center' }}>
                  <View style={{ width: 20, alignItems: 'center', marginLeft: 7 }}>
                    <Ionicons name="location-outline" size={20} color="#000" />
                  </View>
                  <View style={{ flex: 1, paddingLeft: 0, flexShrink: 1 }}>
                    <Text style={{ color: '#333', fontSize: 15, lineHeight: 18 }} numberOfLines={2} ellipsizeMode="tail">{startDisplay}</Text>
                    <Text style={{ color: '#333', marginTop: 4, fontSize: 15, lineHeight: 18 }} numberOfLines={2} ellipsizeMode="tail">{endAddr}</Text>
                  </View>
                </View>
              </View>
              <View style={{ width: '10%', justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6, paddingTop: 0 }}>
                <View style={{ marginBottom: 40, alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', marginTop: 0 }}>
                  <View style={{ backgroundColor: 'rgba(255,165,0,0.75)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minWidth: 65, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: -3 }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{Number(item.distance || 0).toFixed(1)} mi</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleSave(item)} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginBottom: 6, alignSelf: 'flex-end' }}>
                  <Ionicons name="pencil" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6, alignSelf: 'flex-end' }}>
                  <Ionicons name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </Swipeable>
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
              addRoute(lastDeleted);
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
