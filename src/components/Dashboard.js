import React, { useContext, useMemo, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../context/DataContext';
import { calculateMileageDeduction } from '../services/TaxReport';
import { Svg, G, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Shared tile styles
const DONUT_SIZE = 80;
const DONUT_STROKE = 12;
const GAP = 14; // uniform vertical gap
const TILE_STYLE = {
  backgroundColor: '#fff',
  borderRadius: 14,
  overflow: 'hidden',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  marginBottom: GAP,
  elevation: 2,
  minHeight: 110,
};
const LEFT_STYLE = { width: '22%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 };
const MIDDLE_STYLE = { width: '56%', paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' };
const RIGHT_STYLE = { width: '22%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 };
const TITLE_STYLE = { fontSize: 18, fontWeight: '700', textAlign: 'center' };
const SUBTITLE_STYLE = { color: '#666', marginTop: 6, textAlign: 'center', fontSize: 13 };
const VALUE_STYLE = { color: '#444', marginTop: 8, fontSize: 13, textAlign: 'center' };
const USAGE_STYLE = { color: '#2e7d32', marginTop: 6, fontSize: 14, fontWeight: '700', textAlign: 'center' };

const CircleStat = ({ label, value, subtitle, format }) => {
  const size = Math.min(120, Math.floor(width / 3) - 32);
  const rendered = format ? format(value) : String(value);
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${rendered}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 8,
          borderColor: '#2e7d32',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0b3d0b' }}>{rendered}</Text>
        {subtitle ? <Text style={{ fontSize: 12, color: '#444' }}>{subtitle}</Text> : null}
      </View>
      <Text style={{ marginTop: 8, fontSize: 14, color: '#111' }}>{label}</Text>
    </View>
  );
};

const startOfWeek = (d) => {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - day);
  return dt;
};

const formatShortDate = (d) => {
  try {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  } catch (e) {
    return '';
  }
};

const formatAbbrMonthDay = (d) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

const inRange = (iso, start, end) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  return t >= start.getTime() && t <= end.getTime();
};

const getMapImageUrl = (drive) => {
  try {
    if (!drive) return 'https://via.placeholder.com/200x120?text=Map';
    if (drive.mapImage) return drive.mapImage;
    const mapConfig = require('../config/mapConfig').default;
    const sc = drive.startCoords || drive.startLocation;
    if (sc && sc.latitude && sc.longitude) {
      const lat = sc.latitude;
      const lon = sc.longitude;
      const zoom = mapConfig.defaultZoom || 13;
      const size = mapConfig.defaultSizeInline || '200x120';
      if (mapConfig.googleApiKey) {
        const marker = `color:red|${lat},${lon}`;
        return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=${zoom}&size=${size}&markers=${encodeURIComponent(marker)}&key=${mapConfig.googleApiKey}`;
      }
      const marker = `${lat},${lon},red-pushpin`;
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=${size}&markers=${marker}`;
    }
    return 'https://via.placeholder.com/200x120?text=Map';
  } catch (e) {
    return 'https://via.placeholder.com/200x120?text=Map';
  }
};

// Donut with two segments: business and personal (drawn as SVG arcs)
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

const describeArcPath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const Donut = ({ size = 64, strokeWidth = 10, businessPercent = 0, colorBusiness = '#4caf50', colorPersonal = '#e0e0e0' }) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const b = Math.max(0, Math.min(1, businessPercent));
  const p = Math.max(0, Math.min(1, 1 - b));

  // Angles in degrees from top (-90)
  const startAngle = -90;
  const bEnd = startAngle + b * 360;
  const pEnd = bEnd + p * 360; // should reach startAngle + 360

  return (
    <Svg width={size} height={size}>
      {/* background ring */}
      <G rotation="0">
        <Circle cx={cx} cy={cy} r={radius} stroke={'#f1f1f1'} strokeWidth={strokeWidth} fill="none" />
        {/* personal segment first (so business draws on top if overlapping) */}
        {p > 0.001 ? (
          <Path d={describeArcPath(cx, cy, radius, bEnd, pEnd)} stroke={colorPersonal} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        ) : null}
        {/* business segment */}
        {b > 0.001 ? (
          <Path d={describeArcPath(cx, cy, radius, startAngle, bEnd)} stroke={colorBusiness} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
        ) : null}
      </G>
    </Svg>
  );
};

// Promo / greeting banner displayed above the tiles (enlarged + logo placeholder)
const PromoBanner = ({ name }) => (
  <View style={{ backgroundColor: '#1565c0', borderRadius: 16, padding: 24, marginBottom: GAP, flexDirection: 'row', alignItems: 'center', minHeight: 160 }}>
    <Image source={{ uri: 'https://via.placeholder.com/120x120?text=Logo' }} style={{ width: 120, height: 120, borderRadius: 12, marginRight: 16 }} />
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{`Good morning${name ? `, ${name}` : ''}`}</Text>
      <Text style={{ color: '#e3f2fd', marginTop: 10, fontSize: 16 }}>Save time logging routes — try Smart Auto-Categorize</Text>
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{ backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 }}>
          <Text style={{ color: '#1565c0', fontWeight: '700' }}>Try</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: 12 }}>
          <Text style={{ color: '#bbdefb', fontSize: 14 }}>Learn more</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const Dashboard = () => {
  const { mileage = [], expenses = [] } = useContext(DataContext);
  const navigation = useNavigation();

  const now = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(now), [now]);
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekStart]);

  const last30Start = useMemo(() => {
    const d = new Date(now);
    d.setDate(now.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);
  const last30End = useMemo(() => {
    const d = new Date(now);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [now]);

  // Right-side range selector: 'month' (previous calendar month) or 'week' (last 7 days)
  const [rightRange, setRightRange] = useState('month');

  const computeRightRange = (range, refDate) => {
    const rNow = new Date(refDate || new Date());
    if (range === 'week') {
      const start = new Date();
      start.setDate(rNow.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    // month: previous calendar month
    const start = new Date(rNow.getFullYear(), rNow.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rNow.getFullYear(), rNow.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const { start: rightStart, end: rightEnd } = computeRightRange(rightRange, now);

  const formatMonthOnly = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const renderStaggeredDates = (start, end, firstWithDash = true) => {
    const dateFontSize = 12;
    const charWidth = Math.round(dateFontSize * 0.6);
    const offset = charWidth;
    return (
      <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: dateFontSize, color: '#444', textAlign: 'center' }}>{`${formatAbbrMonthDay(start)}${firstWithDash ? ' -' : ''}`}</Text>
        <Text style={{ fontSize: dateFontSize, color: '#444', marginTop: 2, marginLeft: offset, textAlign: 'center' }}>{formatAbbrMonthDay(end)}</Text>
      </View>
    );
  };

  const {
    weekTrips,
    weekExpensesTotal,
    weekDeduction,
    monthTrips,
    monthExpensesTotal,
    monthDeduction,
  } = useMemo(() => {
    // Use the selected right-side range for the left (week) graphs too so the toggle controls both sides
    const wTrips = (mileage || []).filter((t) => inRange(t.start || t.date, rightStart, rightEnd));
    const wExpenses = (expenses || []).filter((e) => inRange(e.date, rightStart, rightEnd));
    const wExpensesTotal = wExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const wDed = calculateMileageDeduction(wTrips, 'business');

    const mTrips = (mileage || []).filter((t) => inRange(t.start || t.date, rightStart, rightEnd));
    const mExpenses = (expenses || []).filter((e) => inRange(e.date, rightStart, rightEnd));
    const mExpensesTotal = mExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const mDed = calculateMileageDeduction(mTrips, 'business');

    return {
      weekTrips: wTrips,
      weekExpensesTotal: wExpensesTotal,
      weekDeduction: wDed,
      monthTrips: mTrips,
      monthExpensesTotal: mExpensesTotal,
      monthDeduction: mDed,
    };
  }, [mileage, expenses, rightStart, rightEnd]);

  const unclassifiedCount = useMemo(() => {
    const uTrips = (mileage || []).filter((t) => !t.purpose || String(t.purpose).toLowerCase().includes('misc'));
    const uExpenses = (expenses || []).filter((e) => !e.classification || String(e.classification).toLowerCase().includes('misc'));
    return (uTrips.length || 0) + (uExpenses.length || 0);
  }, [mileage, expenses]);

  // compute classification ratios for tiles
  const { tripsWeekPct, tripsMonthPct, milesWeekPct, milesMonthPct, expensesWeekPct, expensesMonthPct, tripsWeekCount, milesWeekTotal, expensesWeekTotalVal } = useMemo(() => {
    const isBusiness = (s) => String(s || '').toLowerCase().includes('bus');

    const tripsWeekCount = (weekTrips || []).length;
    const tripsWeekBusiness = (weekTrips || []).filter((t) => isBusiness(t.purpose) || isBusiness(t.classification)).length;
    const tripsWeekPct = tripsWeekCount ? tripsWeekBusiness / tripsWeekCount : 0;

    const tripsMonthCount = (monthTrips || []).length;
    const tripsMonthBusiness = (monthTrips || []).filter((t) => isBusiness(t.purpose) || isBusiness(t.classification)).length;
    const tripsMonthPct = tripsMonthCount ? tripsMonthBusiness / tripsMonthCount : 0;

    const milesWeekTotal = (weekTrips || []).reduce((s, t) => s + (t.distance || 0), 0);
    const milesWeekBusiness = (weekTrips || []).reduce((s, t) => s + ((isBusiness(t.purpose) || isBusiness(t.classification)) ? (t.distance || 0) : 0), 0);
    const milesWeekPct = milesWeekTotal ? milesWeekBusiness / milesWeekTotal : 0;

    const milesMonthTotal = (monthTrips || []).reduce((s, t) => s + (t.distance || 0), 0);
    const milesMonthBusiness = (monthTrips || []).reduce((s, t) => s + ((isBusiness(t.purpose) || isBusiness(t.classification)) ? (t.distance || 0) : 0), 0);
    const milesMonthPct = milesMonthTotal ? milesMonthBusiness / milesMonthTotal : 0;

    const weekExpenses = (expenses || []).filter((e) => inRange(e.date, weekStart, weekEnd));
    const monthExpenses = (expenses || []).filter((e) => inRange(e.date, last30Start, last30End));
    const expensesWeekTotalVal = weekExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const expensesWeekBusiness = weekExpenses.reduce((s, e) => s + ((isBusiness(e.classification) ? (e.amount || 0) : 0)), 0);
    const expensesWeekPct = expensesWeekTotalVal ? expensesWeekBusiness / expensesWeekTotalVal : 0;

    const expensesMonthTotalVal = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const expensesMonthBusiness = monthExpenses.reduce((s, e) => s + ((isBusiness(e.classification) ? (e.amount || 0) : 0)), 0);
    const expensesMonthPct = expensesMonthTotalVal ? expensesMonthBusiness / expensesMonthTotalVal : 0;

    return { tripsWeekPct, tripsMonthPct, milesWeekPct, milesMonthPct, expensesWeekPct, expensesMonthPct, tripsWeekCount, milesWeekTotal, expensesWeekTotalVal };
  }, [weekTrips, monthTrips, expenses, weekStart, weekEnd, last30Start, last30End]);

  const metrics = [
    {
      key: 'routes',
      title: 'Routes',
      subtitle: `${tripsWeekCount || 0} this week`,
      weekPct: tripsWeekPct,
      monthPct: tripsMonthPct,
    },
    {
      key: 'miles',
      title: 'Miles',
      subtitle: `${(milesWeekTotal || 0).toFixed(1)} mi this week`,
      weekPct: milesWeekPct,
      monthPct: milesMonthPct,
    },
    {
      key: 'expenses',
      title: 'Expenses',
      subtitle: `$${(expensesWeekTotalVal || 0).toFixed(2)} this week`,
      weekPct: expensesWeekPct,
      monthPct: expensesMonthPct,
    },
  ];

  return (
    <View style={{ flex: 1, padding: 12 }}>

      {/* Greeting / promo banner */}
      <PromoBanner />

      {/* Range filter for right-side graphs (legend placed opposite the toggle) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: GAP }}>
        {/* Legend for business/personal colors (moved here opposite the toggle) */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#4caf50', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#333' }}>Business</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, backgroundColor: '#e53935', borderRadius: 3, marginRight: 6 }} />
            <Text style={{ fontSize: 12, color: '#333' }}>Personal</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setRightRange((r) => (r === 'month' ? 'week' : 'month'))}
          style={{ backgroundColor: '#f4f6f8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#e6e9ed', minWidth: 92, alignItems: 'center', justifyContent: 'center' }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Toggle right graph range"
        >
          <Text style={{ fontSize: 13, color: '#222', fontWeight: '600' }}>{rightRange === 'month' ? 'Last month' : 'Last week'}</Text>
        </TouchableOpacity>
      </View>

      {/* Three metric tiles: Routes, Miles, Expenses (enlarged) */}
      <View style={{ marginBottom: 16 }}>
        {(() => {
          const isBusiness = (s) => String(s || '').toLowerCase().includes('bus');
          const weekTripBusinessCount = (weekTrips || []).filter((t) => isBusiness(t.purpose) || isBusiness(t.classification)).length;
          const weekTripTotalCount = (weekTrips || []).length;
          const weekTripPersonalCount = Math.max(0, weekTripTotalCount - weekTripBusinessCount);
          const weekBusinessMiles = (weekTrips || []).reduce((s, t) => s + ((isBusiness(t.purpose) || isBusiness(t.classification)) ? (t.distance || 0) : 0), 0);
          const IRS_RATE_2025 = 0.7; // $0.70 per mile for 2025
          const weekEstimatedDeduction = weekBusinessMiles * IRS_RATE_2025;
          return metrics.map((tile) => (
            <View key={tile.key} style={TILE_STYLE}>
              {/* Left: week donut (approx 22%) */}
              <View style={LEFT_STYLE}>
                <Donut size={DONUT_SIZE} strokeWidth={DONUT_STROKE} businessPercent={tile.weekPct || 0} colorBusiness="#4caf50" colorPersonal="#e53935" />
                {/* Left caption: show staggered look when week-mode; show 'This month' when month-mode */}
                {rightRange === 'week' ? (
                  renderStaggeredDates(rightStart, rightEnd)
                ) : (
                  <View style={{ marginTop: 6, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#444', textAlign: 'center', fontWeight: '600' }}>This month</Text>
                    <Text style={{ fontSize: 12, color: '#444', marginTop: 4, textAlign: 'center' }}>{formatMonthOnly(now)}</Text>
                  </View>
                )}
              </View>

              {/* Middle: title and info (56%) - centered */}
              <View style={MIDDLE_STYLE}>
                <Text style={TITLE_STYLE}>{tile.title}</Text>
                <Text style={SUBTITLE_STYLE}>{tile.subtitle}</Text>
                {tile.key === 'routes' ? (
                  <>
                    <Text style={VALUE_STYLE}>{`${weekTripBusinessCount} business • ${weekTripPersonalCount} personal`}</Text>
                    <Text style={USAGE_STYLE}>{`Usage Value: $${Number(weekEstimatedDeduction || 0).toFixed(2)}`}</Text>
                  </>
                ) : tile.key === 'miles' ? (
                  <>
                    {(() => {
                      const businessMiles = Number((weekBusinessMiles || 0).toFixed(1));
                      const personalMiles = Number(Math.max(0, (milesWeekTotal || 0) - (weekBusinessMiles || 0)).toFixed(1));
                      return (
                        <View style={{ marginTop: 8, alignItems: 'center' }}>
                          <Text style={VALUE_STYLE}>{`${businessMiles} business`}</Text>
                          <Text style={{ ...VALUE_STYLE, marginTop: 4 }}>{`${personalMiles} personal`}</Text>
                        </View>
                      );
                    })()}
                  </>
                ) : tile.key === 'expenses' ? (
                  <>
                    {(() => {
                      const weekExpensesList = (expenses || []).filter((e) => inRange(e.date, weekStart, weekEnd));
                      const expensesBusiness = weekExpensesList.reduce((s, e) => s + ((String(e.classification || '').toLowerCase().includes('bus')) ? (e.amount || 0) : 0), 0);
                      return (
                        <View style={{ marginTop: 8, alignItems: 'center' }}>
                          <Text style={USAGE_STYLE}>{`Usage Value: $${expensesBusiness.toFixed(2)}`}</Text>
                        </View>
                      );
                    })()}
                  </>
                ) : null}
              </View>

              {/* Right: month donut (approx 22%) */}
              <View style={RIGHT_STYLE}>
                <Donut size={DONUT_SIZE} strokeWidth={DONUT_STROKE} businessPercent={tile.monthPct || 0} colorBusiness="#1976d2" colorPersonal="#e53935" />
                {rightRange === 'month' ? (
                  <View style={{ marginTop: 6, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#444', textAlign: 'center', fontWeight: '600' }}>Last month</Text>
                    <Text style={{ fontSize: 12, color: '#444', marginTop: 4, textAlign: 'center' }}>{formatMonthOnly(rightStart)}</Text>
                  </View>
                ) : (
                  renderStaggeredDates(rightStart, rightEnd, true)
                )}
              </View>
            </View>
          ));
        })()}
      </View>

      {/* Legend moved above beside the range toggle to improve layout */}

      {/* Old summaries/layout removed; dashboard focuses on the three metric tiles. */}
    </View>
  );
};

export default Dashboard;
