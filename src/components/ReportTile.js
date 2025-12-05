import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const ReportTile = ({ item, type = 'route', onClassify = () => {}, onDelete = () => {}, onEdit = () => {}, selectionMode = false, selected = false, onSelectToggle = () => {} }) => {
  const swipeRef = useRef(null);

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

  const img = type === 'route' ? (item.mapImage || 'https://via.placeholder.com/160x120?text=Map') : (item.image || 'https://via.placeholder.com/160x120?text=Receipt');
  const isBusiness = ((item.purpose || item.classification) || '').toLowerCase().includes('bus');
  // dummy address fallbacks to match Miscellaneous screen behavior
  const startAddr = item.startAddress || item.origin || item.from || item.startLabel || '123 Main St, Anytown';
  const endAddr = item.endAddress || item.destination || item.to || item.endLabel || '456 Market St, Anytown';
  const purchaseAddr = item.address || item.location || item.vendorAddress || item.placeAddress || (item.notes && item.notes.substring(0, 60)) || 'Store Address, Anytown';
  const startDisplay = type === 'route' ? startAddr : purchaseAddr;

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      // Make full-swipe confirmation reliable: moderate friction and deliberate thresholds
      friction={1.2}
      overshootLeft={true}
      overshootRight={true}
      leftThreshold={80}
      rightThreshold={80}
      ref={swipeRef}
      onSwipeableOpen={(direction) => {
        // direction === 'left' means left actions were opened (user swiped RIGHT)
        try {
          if (direction === 'left') onClassify('Business'); else onClassify('Personal');
        } catch (e) {}
        // close swipeable after action
        try { swipeRef && swipeRef.current && swipeRef.current.close && swipeRef.current.close(); } catch (e) {}
      }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={() => { if (selectionMode) onSelectToggle(item.id || item.key); }}>
        <View style={{ padding: 12, borderRadius: 10, backgroundColor: selectionMode && selected ? '#e3f2fd' : '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 150, position: 'relative' }}>
          <View style={{ width: '30%', paddingRight: 8, marginLeft: 0, position: 'relative', marginTop:5 }}>
            <Image source={{ uri: img }} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
            {/* classification badge (replacing Route/Expense label) */}
            <View style={{ position: 'absolute', right: 0, top: -8, backgroundColor: isBusiness ? '#4caf50' : '#ffb74d', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{isBusiness ? 'Business' : 'Unclaimed'}</Text>
            </View>
          </View>

          <View style={{ width: '54%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 }}>
            <Text style={{ fontWeight: '700', textAlign: 'left', alignSelf: 'flex-start' }}>{item.purpose || item.description || (type === 'route' ? 'Miscellaneous' : 'Miscellaneous')}</Text>
            <Text style={{ color: '#666', marginTop: 15, textAlign: 'left', alignSelf: 'flex-start' }}>{type === 'route' ? (item.start ? new Date(item.start).toLocaleString() : '') : (item.createdAt || item.date ? new Date(item.createdAt || item.date).toLocaleString() : '')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 23, marginLeft:-13, alignItems: 'center' }}>
              <View style={{ width: 20, alignItems: 'center', marginLeft: 7 }}>
                <Ionicons name="location-outline" size={20} color="#000" />
              </View>
              <View style={{ flex: 1, paddingLeft: 0, flexShrink: 1 }}>
                <Text style={{ color: '#333', fontSize: 15, lineHeight: 18 }} numberOfLines={2} ellipsizeMode="tail">
                  {startDisplay}
                </Text>
                {type === 'route' ? <Text style={{ color: '#333', marginTop: 4, fontSize: 15, lineHeight: 18 }}>{endAddr}</Text> : null}
              </View>
            </View>
          </View>

          <View style={{ width: '16%', minWidth: 72, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6, paddingTop: 0 }}>
            <View style={{ marginBottom: 40, alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', marginTop: 0 }}>
              {type === 'route' ? (
                <View style={{ backgroundColor: 'rgba(255,165,0,0.9)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, minWidth: 72, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: -3 }}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{Number(item.distance || 0).toFixed(1)} mi</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(255,165,0,0.9)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, minWidth: 72, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end', marginTop: -3 }}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{item.amount ? `$${Number(item.amount).toFixed(2)}` : ''}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => onEdit(item)} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginBottom: 6, alignSelf: 'flex-end' }}>
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this item?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDelete(item) }])} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6, alignSelf: 'flex-end' }}>
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default ReportTile;
