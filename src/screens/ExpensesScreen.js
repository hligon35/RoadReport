import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, Image, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import ExpenseLogger from '../components/ExpenseLogger';
import { DataContext } from '../context/DataContext';
import { Ionicons } from '@expo/vector-icons';

const ExpensesScreen = () => {
  const { expenses, updateExpense, deleteExpense } = useContext(DataContext);

  const list = useMemo(() => (expenses || []), [expenses]);

  // measurement refs + pin positioning (same approach as Miscellaneous)
  const tileRefs = useRef(new Map());
  const imageRefs = useRef(new Map());
  const addrRefs = useRef(new Map());
  const tileLayouts = useRef(new Map());
  const contentLayouts = useRef(new Map());
  const addrLayouts = useRef(new Map());
  const imageLayouts = useRef(new Map());
  const [pinPositions, setPinPositions] = useState({});
  const [layoutTick, setLayoutTick] = useState(0);

  useEffect(() => {
    if (!list || !list.length) return;
    const newPositions = {};
    list.forEach((item) => {
      if (pinPositions[item.id]) return;
      const tLayout = tileLayouts.current.get(item.id);
      const contentLayout = contentLayouts.current.get(item.id);
      const aLayout = addrLayouts.current.get(item.id);
      if (tLayout && contentLayout && aLayout) {
        const addrAbsX = contentLayout.x + aLayout.x;
        const addrAbsY = contentLayout.y + aLayout.y;
        const left = addrAbsX + (aLayout.width / 2) - 12;
        const top = addrAbsY + (aLayout.height / 2) - 12;
        newPositions[item.id] = { left, top };
      }
    });
    if (Object.keys(newPositions).length) {
      setPinPositions((prev) => ({ ...prev, ...newPositions }));
    }
  }, [layoutTick, pinPositions, list]);

  const renderItem = ({ item }) => {
    const img = item.receiptPhoto || item.image || 'https://via.placeholder.com/160x120?text=Receipt';
    const dateStr = item.date ? new Date(item.date).toLocaleString() : (item.createdAt ? new Date(item.createdAt).toLocaleString() : '');

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

    const swipeRef = React.createRef();

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
            if (direction === 'left') updateExpense && updateExpense({ ...item, classification: 'business' }); else updateExpense && updateExpense({ ...item, classification: 'personal' });
          } catch (e) {}
          try { swipeRef && swipeRef.current && swipeRef.current.close && swipeRef.current.close(); } catch (e) {}
        }}
        useNativeAnimations
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => {}}>
          <View ref={(r) => { if (r) tileRefs.current.set(item.id, r); }} onLayout={(e) => { tileLayouts.current.set(item.id, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 150, position: 'relative' }}>
            <View ref={(r) => { if (r) imageRefs.current.set(item.id, r); }} onLayout={(e) => { imageLayouts.current.set(item.id, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: '35%', paddingRight: 8, position: 'relative', marginTop:5 }}>
              <Image source={{ uri: img }} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
            </View>
            <View onLayout={(e) => { contentLayouts.current.set(item.id, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: '55%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', textAlign: 'left', alignSelf: 'flex-start' }}>{item.description || item.category || 'Expense'}</Text>
              </View>
              <Text style={{ color: '#666', marginTop: 15, textAlign: 'left', alignSelf: 'flex-start' }}>{dateStr}</Text>
              <View style={{ flexDirection: 'row', marginTop: 33, marginLeft:-13, alignItems: 'center' }}>
                <View ref={(r) => { if (r) addrRefs.current.set(item.id, r); }} onLayout={(e) => { addrLayouts.current.set(item.id, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: 20, alignItems: 'center', marginLeft: 7 }}>
                  <Ionicons name="location-outline" size={20} color="#000" />
                </View>
                <View style={{ flex: 1, flexShrink: 1 }}>
                  <Text
                    style={{ color: '#333', fontSize: 16, lineHeight: 20 }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.vendor || item.location || item.note || ''}
                  </Text>
                </View>
              </View>
              {item.notes ? <Text style={{ marginTop: 6 }}>{item.notes}</Text> : null}
            </View>
            <View style={{ width: '10%', justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6, paddingTop: 0 }}>
              <View style={{ marginBottom: 40, alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', marginTop: 0 }}>
                <View style={{ backgroundColor: 'rgba(255,165,0,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: -3, minWidth: 110, flexShrink: 0 }}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#000', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>
                    {(() => {
                      try {
                        const amt = typeof item.amount === 'number' ? item.amount : (item.amount ? Number(item.amount) : NaN);
                        if (!isFinite(amt)) return '';
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amt);
                      } catch (e) {
                        return item.amount ? `$${Number(item.amount).toFixed(2)}` : '';
                      }
                    })()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => updateExpense && updateExpense(item)} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginBottom: 6, alignSelf: 'flex-end' }}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteExpense && deleteExpense(item)} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6, alignSelf: 'flex-end' }}>
                <Ionicons name="trash" size={16} color="#fff" />
              </TouchableOpacity>
              {/* Render measured pin aligned with the address icon for expenses */}
              {pinPositions[item.id] ? (
                <View style={{ position: 'absolute', left: pinPositions[item.id].left, top: pinPositions[item.id].top, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="location" size={14} color="#fff" />
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
      <ExpenseLogger />
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        ListEmptyComponent={() => <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: '#666' }}>No expenses yet.</Text></View>}
      />
    </SafeAreaView>
  );
};

export default ExpensesScreen;
