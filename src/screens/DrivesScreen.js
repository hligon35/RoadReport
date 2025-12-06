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
  const mockDrives = useMemo(() => [
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
  ], []);

  const monthStart = useMemo(() => startOfMonth(new Date()), []);
  const monthEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const [query, setQuery] = useState('');
  const [lastDeleted, setLastDeleted] = useState(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

  const { drivesThisMonth, drivesToShow, totalMiles, totalValue } = useMemo(() => {
    const allDrives = (mileage && mileage.length > 0) ? mileage : mockDrives;
    const drivesThisMonth = allDrives.filter((d) => new Date(d.start || d.date) >= monthStart && new Date(d.start || d.date) <= monthEnd);
    const totalMiles = drivesThisMonth.reduce((s, d) => s + (d.distance || 0), 0);
    const totalValue = TaxReportService.calculateMileageDeduction(drivesThisMonth, 'business').deduction;
    return { drivesThisMonth, drivesToShow: allDrives, totalMiles, totalValue };
  }, [mileage, mockDrives, monthStart, monthEnd]);

  const filteredDrives = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drivesToShow.filter((d) => {
      if (!q) return true;
      // search by purpose, notes, or id
      return (
        (d.purpose || '').toLowerCase().includes(q) ||
        (d.notes || '').toLowerCase().includes(q) ||
        (d.id || '').toLowerCase().includes(q)
      );
    });
  }, [drivesToShow, query]);

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
    updateRoute({ ...drive, purpose: newPurpose, classification: String(newPurpose).toLowerCase() });
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
          placeholder="Search routes by purpose, notes, or id"
          value={query}
          onChangeText={setQuery}
          style={{ backgroundColor: '#fff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0' }}
          accessibilityLabel="Search routes"
        />
        {/* filters removed: Routes list uses full-text search only */}
      </View>

      <SectionList
        sections={[{ title: 'Routes', data: filteredDrives }]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Render tile using Miscellaneous-style layout (no badge)
          const imgSource = item.mapImage ? { uri: item.mapImage } : require('../../assets/icon.png');
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
                  const classification = direction === 'left' ? 'Business' : 'Personal';
                  try { updateRoute && updateRoute({ ...item, purpose: classification, classification: String(classification).toLowerCase() }); } catch (e) {}
                  try { swipeRef && swipeRef.current && swipeRef.current.close && swipeRef.current.close(); } catch (e) {}
                } catch (e) {
                  try { swipeRef && swipeRef.current && swipeRef.current.close && swipeRef.current.close(); } catch (e) {}
                }
              }}
            >
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 150 }}>
              <View style={{ width: '30%', paddingRight: 8, position: 'relative', marginTop:5 }}>
                <Image source={imgSource} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
              </View>
              <View style={{ width: '54%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 }}>
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
                    {/* notes field: show actual notes or a visible placeholder when empty */}
                    <TouchableOpacity activeOpacity={0.7} onPress={() => { /* placeholder for future edit-open */ }}>
                      <Text style={{ marginTop: 8, color: item.notes ? '#444' : '#9e9e9e', fontSize: 13, fontStyle: item.notes ? 'normal' : 'italic' }}>
                        {item.notes ? item.notes : 'Add notes…'}
                      </Text>
                    </TouchableOpacity>
              </View>
              <View style={{ width: '16%', minWidth: 72, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6, paddingTop: 0 }}>
                  <View style={{ marginBottom: 40, alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', marginTop: 0 }}>
                    <Text style={{ color: '#222', fontWeight: '700', fontSize: 14, textAlign: 'right' }}>{(item.distance != null) ? Number(item.distance).toFixed(1) + ' mi' : '0.0 mi'}</Text>
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
        accessibilityLabel="List of routes"
        ListEmptyComponent={() => (
            <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No routes match your search.</Text>
          </View>
        )}
      />

      {/* Undo banner */}
      {lastDeleted && (
        <Animated.View style={{ position: 'absolute', left: 12, right: 12, bottom: 24, transform: [{ translateY: undoAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
          <View style={{ backgroundColor: '#333', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', flex: 1 }}>Route deleted</Text>
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
