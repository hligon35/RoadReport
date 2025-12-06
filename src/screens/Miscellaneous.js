import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, Modal, TextInput, Animated } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ModalCloseContext } from '../context/ModalCloseContext';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../context/DataContext';
import { Swipeable } from 'react-native-gesture-handler';

const Miscellaneous = () => {
  const { mileage, expenses, updateRoute, updateExpense } = useContext(DataContext);

  const formatSpelledDateTime = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      return `${date} - ${time}`;
    } catch (e) {
      return new Date(iso).toString();
    }
  };

  const unclassifiedRoutes = useMemo(() => (mileage || []).filter((t) => !t.purpose || t.purpose === 'miscellaneous' || String(t.purpose).toLowerCase().includes('misc')), [mileage]);
  const unclassifiedExpenses = useMemo(() => (expenses || []).filter((e) => !e.classification || e.classification === 'miscellaneous' || String(e.classification).toLowerCase().includes('misc')), [expenses]);

  const combined = useMemo(() => {
    const routes = (unclassifiedRoutes || []).map((t) => ({ ...t, _type: 'route', key: t.id }));
    const exps = (unclassifiedExpenses || []).map((e) => ({ ...e, _type: 'expense', key: e.id }));
    const all = [...routes, ...exps];
    all.sort((a, b) => new Date(b.start || b.date) - new Date(a.start || a.date));
    return all;
  }, [unclassifiedRoutes, unclassifiedExpenses]);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkEditVisible, setBulkEditVisible] = useState(false);
  const [bulkName, setBulkName] = useState('');
  const [bulkClassification, setBulkClassification] = useState('');
  const [editItem, setEditItem] = useState(null); // null = bulk edit, object = single edit
  const [editName, setEditName] = useState('');
  const [editClassification, setEditClassification] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDateObj, setEditDateObj] = useState(null); // JS Date for pickers
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [wasBulkOpen, setWasBulkOpen] = useState(false);
  const swipeableRefs = useRef(new Map());
  const tileRefs = useRef(new Map());
  const addrRefs = useRef(new Map());
  const imageRefs = useRef(new Map());
  const tileLayouts = useRef(new Map());
  const contentLayouts = useRef(new Map());
  const imageLayouts = useRef(new Map());
  const addrLayouts = useRef(new Map());
  const [pinPositions, setPinPositions] = useState({});
  const [layoutTick, setLayoutTick] = useState(0);
  const navigation = useNavigation();

  // after layout updates, compute missing pin positions in batch
  React.useEffect(() => {
    if (!combined || !combined.length) return;
    const newPositions = {};
    combined.forEach((item) => {
      if (pinPositions[item.key]) return;
      const tLayout = tileLayouts.current.get(item.key);
      const contentLayout = contentLayouts.current.get(item.key);
      const aLayout = addrLayouts.current.get(item.key);
      if (tLayout && contentLayout && aLayout) {
        const addrAbsX = contentLayout.x + aLayout.x;
        const addrAbsY = contentLayout.y + aLayout.y;
        const left = addrAbsX + (aLayout.width / 2) - 12;
        const top = addrAbsY + (aLayout.height / 2) - 12;
        newPositions[item.key] = { left, top };
      }
    });
    if (Object.keys(newPositions).length) {
      setPinPositions((prev) => ({ ...prev, ...newPositions }));
    }
    // only re-run when layoutTick changes (onLayout handlers increment it)
  }, [layoutTick, pinPositions, combined]);

  // temporary picker state
  const [pickerMonth, setPickerMonth] = useState(0);
  const [pickerDay, setPickerDay] = useState(1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerHour, setPickerHour] = useState(12);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [pickerAmPm, setPickerAmPm] = useState('AM');

  const openDatePicker = () => {
    const d = editDateObj || new Date();
    setPickerMonth(d.getMonth());
    setPickerDay(d.getDate());
    setPickerYear(d.getFullYear());
    console.log('openDatePicker: initialized', d);
    // hide the edit modal so the picker modal can appear on top (Android z-order)
    if (bulkEditVisible) {
      setWasBulkOpen(true);
      setBulkEditVisible(false);
    } else setWasBulkOpen(false);
    setDatePickerVisible(true);
  };

  const openTimePicker = () => {
    const d = editDateObj || new Date();
    let hr = d.getHours();
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12; if (hr === 0) hr = 12;
    setPickerHour(hr);
    setPickerMinute(d.getMinutes());
    setPickerAmPm(ampm);
    console.log('openTimePicker: initialized', d);
    if (bulkEditVisible) {
      setWasBulkOpen(true);
      setBulkEditVisible(false);
    } else setWasBulkOpen(false);
    setTimePickerVisible(true);
  };

  const applyDatePicker = () => {
    const hour = editDateObj ? editDateObj.getHours() : 12;
    const minute = editDateObj ? editDateObj.getMinutes() : 0;
    const nd = new Date(pickerYear, pickerMonth, pickerDay, hour, minute);
    setEditDateObj(nd);
    setEditDate(nd.toISOString());
    setDatePickerVisible(false);
    // restore bulk edit modal if it was open
    if (wasBulkOpen) {
      setBulkEditVisible(true);
      setWasBulkOpen(false);
    }
  };

  const applyTimePicker = () => {
    let hr = pickerHour % 12;
    if (pickerAmPm === 'PM') hr += 12;
    const day = editDateObj ? editDateObj.getDate() : new Date().getDate();
    const month = editDateObj ? editDateObj.getMonth() : new Date().getMonth();
    const year = editDateObj ? editDateObj.getFullYear() : new Date().getFullYear();
    const nd = new Date(year, month, day, hr, pickerMinute);
    setEditDateObj(nd);
    setEditDate(nd.toISOString());
    setTimePickerVisible(false);
    if (wasBulkOpen) {
      setBulkEditVisible(true);
      setWasBulkOpen(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            setSelectedIds(new Set());
          } else {
            setSelectionMode(false);
            setSelectedIds(new Set());
          }
        }} style={{ paddingHorizontal: 8, paddingVertical: 8, backgroundColor: 'transparent', borderRadius: 4 }}>
          <Ionicons name={selectionMode ? 'checkbox' : 'checkbox-outline'} size={20} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectionMode]);

  // Close overlays / reset selection when parent tab changes (so switching tabs doesn't leave misc modal open)
  React.useEffect(() => {
    const parent = navigation.getParent && navigation.getParent();
    if (!parent || !parent.addListener) return;
    const onTabPress = (e) => {
      try {
        // determine pressed route name from parent state using event.target (route key)
        const parentState = parent.getState && parent.getState();
        const pressedKey = e && e.target;
        const pressedRoute = parentState && parentState.routes && parentState.routes.find((r) => r.key === pressedKey);
        const pressedName = pressedRoute ? pressedRoute.name : null;
        // close any open modals/pickers and clear selection mode
        setBulkEditVisible(false);
        setDatePickerVisible(false);
        setTimePickerVisible(false);
        setSelectionMode(false);
        setSelectedIds(new Set());
        setWasBulkOpen(false);
        // navigate to pressed tab to ensure Miscellaneous does not block
        if (pressedName) {
          parent.navigate(pressedName);
        }
      } catch (err) {
        // fallback: just clear state
        setBulkEditVisible(false);
        setDatePickerVisible(false);
        setTimePickerVisible(false);
        setSelectionMode(false);
        setSelectedIds(new Set());
        setWasBulkOpen(false);
      }
    };
    const unsubscribe = parent.addListener('tabPress', onTabPress);
    return unsubscribe;
  }, [navigation]);

  // register a global close handler so modals/pickers close when navigation requests it
  const { register } = useContext(ModalCloseContext);
  React.useEffect(() => {
    const closer = () => {
      setBulkEditVisible(false);
      setDatePickerVisible(false);
      setTimePickerVisible(false);
      setSelectionMode(false);
      setSelectedIds(new Set());
      setWasBulkOpen(false);
    };
    const unregister = register(closer);
    return () => unregister && unregister();
  }, [register]);

  const classifyRoute = (route, cls) => {
    const updated = { ...route, purpose: cls, classification: cls ? String(cls).toLowerCase() : cls };
    updateRoute(updated);
  };

  const classifyExpense = (expense, cls) => {
    const updated = { ...expense, classification: cls ? String(cls).toLowerCase() : cls, purpose: cls };
    updateExpense(updated);
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const formatAbbrevDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return String(d); }
  };
  const formatTime = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return String(d); }
  };

  const daysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[ 'left', 'right', 'bottom' ]}>
      <View style={{ padding: 12, flex: 1 }}>

        <View style={{ height: 8 }} />

        {selectionMode ? (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => { if (selectedIds.size) { setEditItem(null); setBulkName(''); setBulkClassification(''); setBulkEditVisible(true); } }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#1976d2', borderRadius: 8, marginRight: 8 }}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (selectedIds.size) {
                Alert.alert('Delete items', `Delete ${selectedIds.size} items?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {
                  selectedIds.forEach((id) => {
                    const route = (mileage || []).find((t) => t.id === id);
                    if (route) updateRoute({ ...route, _deleted: true });
                    const exp = (expenses || []).find((e) => e.id === id);
                    if (exp) updateExpense({ ...exp, _deleted: true });
                  });
                  setSelectionMode(false); setSelectedIds(new Set());
                } }]);
              }
            }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#d32f2f', borderRadius: 8, marginRight: 8 }}>
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSelectionMode(false); setSelectedIds(new Set()); }} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#9e9e9e', borderRadius: 8 }}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

        <FlatList
          data={combined}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const imgSource = item._type === 'route' ? (item.mapImage ? { uri: item.mapImage } : require('../../assets/icon.png')) : (item.image ? { uri: item.image } : require('../../assets/icon.png'));
            // dummy address fallbacks for display only
            const startAddr = (item.startAddress || item.origin || item.from || item.startLabel || item.startName) || '123 Main St, Anytown';
            const endAddr = (item.endAddress || item.destination || item.to || item.endLabel || item.endName) || '456 Market St, Anytown';
            // display-friendly start address: insert a zero-width space after the first comma
            // this lets the text break there if needed, but doesn't force a newline
            const startDisplay = (item._type === 'route' && startAddr && startAddr.includes(',')) ? startAddr.replace(',', ',\u200B') : startAddr;
            // expense purchase address fallback
            const purchaseAddr = (item.address || item.location || item.vendorAddress || item.placeAddress || item.addressLine) || (item.notes && item.notes.substring(0, 60)) || 'Store Address, Anytown';

            const renderLeftActions = (progress, dragX) => {
              const trans = dragX.interpolate({ inputRange: [0, 120], outputRange: [-20, 0], extrapolate: 'clamp' });
              const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
              return (
                <Animated.View style={{ justifyContent: 'center', paddingLeft: 12, transform: [{ translateX: trans }], opacity }}>
                  <TouchableOpacity onPress={() => { if (item._type === 'route') classifyRoute(item, 'Business'); else classifyExpense(item, 'Business'); }} style={{ backgroundColor: '#4caf50', padding: 12, borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Business</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            };

            const renderRightActions = (progress, dragX) => {
              const trans = dragX.interpolate({ inputRange: [-120, 0], outputRange: [0, 20], extrapolate: 'clamp' });
              const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
              return (
                <Animated.View style={{ justifyContent: 'center', paddingRight: 12, transform: [{ translateX: trans }], opacity }}>
                  <TouchableOpacity onPress={() => { if (item._type === 'route') classifyRoute(item, 'Personal'); else classifyExpense(item, 'Personal'); }} style={{ backgroundColor: '#ff7043', padding: 12, borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Personal</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            };

            

            return (
              <Swipeable
                  ref={(r) => { if (r) swipeableRefs.current.set(item.key, r); }}
                  renderLeftActions={renderLeftActions}
                  renderRightActions={renderRightActions}
                  friction={1.2}
                  overshootLeft={true}
                  overshootRight={true}
                  leftThreshold={40}
                  rightThreshold={40}
                  useNativeAnimations={true}
                  onSwipeableOpen={(direction) => {
                    try {
                      const classification = direction === 'left' ? 'Business' : 'Personal';
                      try {
                        if (item._type === 'route') classifyRoute(item, classification); else classifyExpense(item, classification);
                      } catch (e) {}
                      try { const s = swipeableRefs.current.get(item.key); s && s.close && s.close(); } catch (e) {}
                    } catch (e) {
                      try { const s = swipeableRefs.current.get(item.key); s && s.close && s.close(); } catch (e) {}
                    }
                  }}
                >
                  <View ref={(r) => { if (r) tileRefs.current.set(item.key, r); }} onLayout={(e) => { tileLayouts.current.set(item.key, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ padding: 12, borderRadius: 10, backgroundColor: selectionMode && selectedIds.has(item.key) ? '#e3f2fd' : '#fff', marginTop: 6, marginBottom: 6, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, overflow: 'hidden', flexDirection: 'row', minHeight: 150, position: 'relative' }}>
                    {/* Use non-intercepting wrapper View so Swipeable receives gestures; selection uses the checkbox control */}
                    <View style={{ width: '30%', paddingRight: 8 }}>

                      {selectionMode ? (
                        <TouchableOpacity onPress={() => {
                          const s = new Set(selectedIds);
                          if (s.has(item.key)) s.delete(item.key); else s.add(item.key);
                          setSelectedIds(s);
                        }} style={{ position: 'absolute', left: -8, top: -8, width: 36, height: 36, borderRadius: 18, backgroundColor: selectedIds.has(item.key) ? '#1976d2' : 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                          {selectedIds.has(item.key) ? <Ionicons name="checkmark" size={18} color="#fff" /> : <Ionicons name="ellipse-outline" size={18} color="#9e9e9e" />}
                        </TouchableOpacity>
                      ) : null}
                      <Image source={imgSource} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' }} resizeMode="cover" />
                      {/* Badge placed as part of the image (top-right corner) */}
                      <View style={{ position: 'absolute', right: 0, top: -8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: item._type === 'route' ? '#2e7d32' : '#6d4c41' }}>{item._type === 'route' ? 'Route' : 'Expense'}</Text>
                      </View>
                      {/* previously a center pin overlay was here; replaced by measured pin rendered at tile level */}
                    </View>
                    <View onLayout={(e) => { contentLayouts.current.set(item.key, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: '54%', justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: 8 }}>
                      {item._type === 'route' ? (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', textAlign: 'left', alignSelf: 'flex-start' }}>{item.purpose || 'Miscellaneous'}</Text>
                          </View>
                          <Text style={{ color: '#666', marginTop: 15, textAlign: 'left', alignSelf: 'flex-start' }}>{formatSpelledDateTime(item.start || item.date)}</Text>
                          <View style={{ flexDirection: 'row', marginTop: 23, marginLeft:-13, alignItems: 'center' }}>
                            <View ref={(r) => { if (r) addrRefs.current.set(item.key, r); }} onLayout={(e) => { addrLayouts.current.set(item.key, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: 20, alignItems: 'center', marginLeft: 7 }}>
                              <Ionicons name="location-outline" size={20} color="#000" />
                            </View>
                            <View style={{ flex: 1, paddingLeft: 0, flexShrink: 1 }}>
                              <Text
                                style={{ color: '#333', fontSize: 15, lineHeight: 18 }}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                adjustsFontSizeToFit
                                minimumFontScale={0.85}
                                allowFontScaling
                              >
                                {startDisplay}
                              </Text>
                              <Text
                                style={{ color: '#333', marginTop: 4, fontSize: 15, lineHeight: 18 }}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                adjustsFontSizeToFit
                                minimumFontScale={0.85}
                                allowFontScaling
                              >
                                {endAddr}
                              </Text>
                            </View>
                          </View>
                            {/* notes field for routes: show actual notes or a visible placeholder when empty */}
                            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                              setEditItem(item);
                              setEditName(item.purpose || '');
                              setEditClassification(item.classification || item.purpose || '');
                              setEditAmount(item.amount ? String(item.amount) : '');
                              setEditDistance(item.distance ? String(item.distance) : '');
                              const raw = item.start || item.createdAt || item.date || '';
                              setEditDate(raw);
                              try { setEditDateObj(raw ? new Date(raw) : new Date()); } catch (e) { setEditDateObj(new Date()); }
                              setEditNotes(item.notes || '');
                              setBulkEditVisible(true);
                            }}>
                              <Text style={{ marginTop: 8, color: item.notes ? '#444' : '#9e9e9e', fontSize: 13, fontStyle: item.notes ? 'normal' : 'italic' }}>
                                {item.notes ? item.notes : 'Add notes…'}
                              </Text>
                            </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <Text style={{ fontWeight: '700', textAlign: 'left', alignSelf: 'flex-start' }}>{item.purpose || 'Miscellaneous'}</Text>
                          </View>
                          <Text style={{ color: '#666', marginTop: 15, textAlign: 'left', alignSelf: 'flex-start' }}>{formatSpelledDateTime(item.createdAt || item.date)}</Text>
                          <View style={{ flexDirection: 'row', marginTop: 33, marginLeft:-13, alignItems: 'center' }}>
                            <View ref={(r) => { if (r) addrRefs.current.set(item.key, r); }} onLayout={(e) => { addrLayouts.current.set(item.key, e.nativeEvent.layout); setLayoutTick((t) => t + 1); }} style={{ width: 20, alignItems: 'center', marginLeft: 7 }}>
                              <Ionicons name="location-outline" size={20} color="#000" />
                            </View>
                            <View style={{ flex: 1, flexShrink: 1 }}>
                              <Text
                                style={{ color: '#333', fontSize: 15, lineHeight: 18 }}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                adjustsFontSizeToFit
                                minimumFontScale={0.85}
                                allowFontScaling
                              >
                                {purchaseAddr}
                              </Text>
                            </View>
                          </View>
                          {/* notes field: show actual notes or a visible placeholder when empty */}
                          <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            setEditItem(item);
                            setEditName(item.description || item.purpose || '');
                            setEditClassification(item.classification || item.purpose || '');
                            setEditAmount(item.amount ? String(item.amount) : '');
                            setEditDistance(item.distance ? String(item.distance) : '');
                            const raw = item.start || item.createdAt || item.date || '';
                            setEditDate(raw);
                            try { setEditDateObj(raw ? new Date(raw) : new Date()); } catch (e) { setEditDateObj(new Date()); }
                            setEditNotes(item.notes || '');
                            setBulkEditVisible(true);
                          }}>
                            <Text style={{ marginTop: 8, color: item.notes ? '#444' : '#9e9e9e', fontSize: 13, fontStyle: item.notes ? 'normal' : 'italic' }}>
                              {item.notes ? item.notes : 'Add notes…'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                      <View style={{ width: '16%', minWidth: 72, justifyContent: 'flex-start', alignItems: 'flex-end', paddingRight: 6, paddingTop: 0 }}>
                        <View style={{ marginBottom: 40, alignItems: 'flex-end', justifyContent: 'flex-start', width: '100%', marginTop: 0 }}>
                              {item._type === 'route' ? (
                                <Text style={{ color: '#222', fontWeight: '700', fontSize: 14, textAlign: 'right' }}>{(item.distance != null) ? Number(item.distance).toFixed(1) + ' mi' : '0.0 mi'}</Text>
                              ) : (
                                <Text style={{ color: '#222', fontWeight: '700', fontSize: 14, textAlign: 'right' }}>{(() => { try { const amt = typeof item.amount === 'number' ? item.amount : (item.amount ? Number(item.amount) : NaN); if (!isFinite(amt)) return ''; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amt); } catch (e) { return item.amount ? `$${Number(item.amount).toFixed(2)}` : ''; } })()}</Text>
                              )}
                        </View>
                        <TouchableOpacity onPress={() => {
                          // open single-item edit
                          setEditItem(item);
                          setEditName(item.purpose || item.description || '');
                          setEditClassification(item.classification || item.purpose || '');
                          setEditAmount(item.amount ? String(item.amount) : '');
                          setEditDistance(item.distance ? String(item.distance) : '');
                          const raw = item.start || item.createdAt || item.date || '';
                          setEditDate(raw);
                          try {
                            setEditDateObj(raw ? new Date(raw) : new Date());
                          } catch (e) { setEditDateObj(new Date()); }
                          setEditNotes(item.notes || '');
                          setBulkEditVisible(true);
                        }} style={{ padding: 6, backgroundColor: '#1976d2', borderRadius: 6, marginBottom: 6, alignSelf: 'flex-end' }}>
                        <Ionicons name="pencil" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        Alert.alert('Delete', 'Delete this item?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => {
                          if (item._type === 'route') updateRoute({ ...item, _deleted: true }); else updateExpense({ ...item, _deleted: true });
                        } }]);
                      }} style={{ padding: 6, backgroundColor: '#d32f2f', borderRadius: 6, alignSelf: 'flex-end' }}>
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                      {/* Render measured pin aligned with the address icon for expenses */}
                      {item._type === 'expense' && pinPositions[item.key] ? (
                        <View style={{ position: 'absolute', left: pinPositions[item.key].left, top: pinPositions[item.key].top, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="location" size={14} color="#fff" />
                        </View>
                      ) : null}
                    </View>
                  </View>
              </Swipeable>
            );
          }}
          ListEmptyComponent={() => <Text style={{ color: '#666', paddingVertical: 8 }}>No miscellaneous items.</Text>}
        />

        <Modal visible={bulkEditVisible} animationType="slide" transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16 }}>
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>{editItem ? 'Edit' : 'Multi-Edit'}</Text>
                {!editItem ? (
                  <>
                    <Text style={{ marginBottom: 6 }}>Name (leave blank to keep)</Text>
                    <TextInput value={bulkName} onChangeText={setBulkName} placeholder="New name" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                    <Text style={{ marginBottom: 6 }}>Classification</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                      <TouchableOpacity onPress={() => setBulkClassification('Business')} style={{ padding: 8, backgroundColor: bulkClassification === 'Business' ? '#4caf50' : '#eee', borderRadius: 6, marginRight: 8 }}>
                        <Text style={{ color: bulkClassification === 'Business' ? '#fff' : '#000' }}>Business</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setBulkClassification('Personal')} style={{ padding: 8, backgroundColor: bulkClassification === 'Personal' ? '#ff7043' : '#eee', borderRadius: 6 }}>
                        <Text style={{ color: bulkClassification === 'Personal' ? '#fff' : '#000' }}>Personal</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <TouchableOpacity onPress={() => { setBulkEditVisible(false); setSelectedIds(new Set()); setBulkName(''); setBulkClassification(''); }} style={{ padding: 10, marginRight: 8 }}>
                        <Text>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        // apply bulk edit: only name and classification
                        selectedIds.forEach((id) => {
                          const route = (mileage || []).find((t) => t.id === id);
                          if (route) {
                            const updated = { ...route };
                            if (bulkName) updated.purpose = bulkName;
                            if (bulkClassification) updated.purpose = bulkClassification;
                            updateRoute(updated);
                          }
                          const exp = (expenses || []).find((e) => e.id === id);
                          if (exp) {
                            const updated = { ...exp };
                            if (bulkName) updated.description = bulkName;
                            if (bulkClassification) updated.classification = bulkClassification;
                            updateExpense(updated);
                          }
                        });
                        setBulkEditVisible(false); setSelectedIds(new Set()); setSelectionMode(false); setBulkName(''); setBulkClassification('');
                      }} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 6 }}>
                        <Text style={{ color: '#fff' }}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ marginBottom: 6 }}>Name</Text>
                    <TextInput value={editName} onChangeText={setEditName} placeholder="Name" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                    <Text style={{ marginBottom: 6 }}>Purpose</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                      <TouchableOpacity onPress={() => setEditClassification('Business')} style={{ padding: 8, backgroundColor: editClassification === 'Business' ? '#4caf50' : '#eee', borderRadius: 6, marginRight: 8 }}>
                        <Text style={{ color: editClassification === 'Business' ? '#fff' : '#000' }}>Business</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setEditClassification('Personal')} style={{ padding: 8, backgroundColor: editClassification === 'Personal' ? '#ff7043' : '#eee', borderRadius: 6 }}>
                        <Text style={{ color: editClassification === 'Personal' ? '#fff' : '#000' }}>Personal</Text>
                      </TouchableOpacity>
                    </View>
                    {editItem._type === 'route' ? (
                      <>
                        <Text style={{ marginBottom: 6 }}>Distance (mi)</Text>
                        <TextInput value={editDistance} onChangeText={setEditDistance} placeholder="Distance" keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                        <Text style={{ marginBottom: 6 }}>Date</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                          <TouchableOpacity onPress={openDatePicker} style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginRight: 6 }}>
                            <Text>{formatAbbrevDate(editDateObj)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={openTimePicker} style={{ width: 110, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, justifyContent: 'center' }}>
                            <Text>{formatTime(editDateObj)}</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={{ marginBottom: 6 }}>Notes</Text>
                        <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Notes" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                      </>
                    ) : (
                      <>
                        <Text style={{ marginBottom: 6 }}>Amount</Text>
                        <TextInput value={editAmount} onChangeText={setEditAmount} placeholder="0.00" keyboardType="numeric" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                        <Text style={{ marginBottom: 6 }}>Date</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                          <TouchableOpacity onPress={openDatePicker} style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginRight: 6 }}>
                            <Text>{formatAbbrevDate(editDateObj)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={openTimePicker} style={{ width: 110, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, justifyContent: 'center' }}>
                            <Text>{formatTime(editDateObj)}</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={{ marginBottom: 6 }}>Notes</Text>
                        <TextInput value={editNotes} onChangeText={setEditNotes} placeholder="Notes" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginBottom: 12 }} />
                      </>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <TouchableOpacity onPress={() => { setBulkEditVisible(false); setEditItem(null); }} style={{ padding: 10, marginRight: 8 }}>
                        <Text>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        // apply single edit
                        if (!editItem) return;
                        if (editItem._type === 'route') {
                          const updated = { ...editItem };
                          if (editName) updated.purpose = editName;
                          if (editClassification) updated.purpose = editClassification;
                          if (editDistance) updated.distance = Number(editDistance);
                          if (editDate) updated.start = editDate;
                          if (editNotes) updated.notes = editNotes;
                          updateRoute(updated);
                        } else {
                          const updated = { ...editItem };
                          if (editName) updated.description = editName;
                          if (editClassification) updated.classification = editClassification;
                          if (editAmount) updated.amount = Number(editAmount);
                          if (editDate) updated.createdAt = editDate;
                          if (editNotes) updated.notes = editNotes;
                          updateExpense(updated);
                        }
                        setBulkEditVisible(false); setEditItem(null); setEditName(''); setEditClassification(''); setEditAmount(''); setEditDistance(''); setEditDate(''); setEditNotes('');
                      }} style={{ padding: 10, backgroundColor: '#1976d2', borderRadius: 6 }}>
                        <Text style={{ color: '#fff' }}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
                
              </View>
            </View>
        </Modal>

        {/* Date picker modal (separate so it isn't clipped) */}
        <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)} hardwareAccelerated statusBarTranslucent onShow={() => { console.log('DatePicker Modal onShow, visible=', datePickerVisible); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#ddd' }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Select Date</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Picker selectedValue={pickerMonth} style={{ width: 160, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerMonth(v)}>
                  {months.map((m, i) => <Picker.Item key={m} label={String(m)} value={i} color="#000" />)}
                </Picker>
                <Picker selectedValue={pickerDay} style={{ width: 100, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerDay(v)}>
                  {Array.from({ length: daysInMonth(pickerYear, pickerMonth) }, (_, i) => i + 1).map((d) => <Picker.Item key={d} label={String(d)} value={String(d)} color="#000" />)}
                </Picker>
                <Picker selectedValue={String(pickerYear)} style={{ width: 120, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerYear(Number(v))}>
                  {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => <Picker.Item key={y} label={String(y)} value={String(y)} color="#000" />)}
                </Picker>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={{ padding: 8, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={applyDatePicker} style={{ padding: 8, backgroundColor: '#1976d2', borderRadius: 6 }}><Text style={{ color: '#fff' }}>OK</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time picker modal */}
        <Modal visible={timePickerVisible} transparent animationType="fade" onRequestClose={() => setTimePickerVisible(false)} hardwareAccelerated statusBarTranslucent onShow={() => { console.log('TimePicker Modal onShow, visible=', timePickerVisible); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#ddd' }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Select Time</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Picker selectedValue={String(pickerHour)} style={{ width: 120, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerHour(Number(v))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <Picker.Item key={h} label={String(h)} value={String(h)} color="#000" />)}
                </Picker>
                <Picker selectedValue={String(pickerMinute)} style={{ width: 120, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerMinute(Number(v))}>
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => <Picker.Item key={m} label={(m < 10 ? '0' : '') + m} value={String(m)} color="#000" />)}
                </Picker>
                <Picker selectedValue={pickerAmPm} style={{ width: 100, color: '#000' }} itemStyle={{ fontSize: 16, color: '#000' }} onValueChange={(v) => setPickerAmPm(v)}>
                  <Picker.Item label="AM" value="AM" color="#000" />
                  <Picker.Item label="PM" value="PM" color="#000" />
                </Picker>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setTimePickerVisible(false)} style={{ padding: 8, marginRight: 8 }}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity onPress={applyTimePicker} style={{ padding: 8, backgroundColor: '#1976d2', borderRadius: 6 }}><Text style={{ color: '#fff' }}>OK</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Miscellaneous;
