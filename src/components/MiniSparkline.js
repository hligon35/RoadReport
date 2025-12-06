import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * MiniSparkline - lightweight sparkline that doesn't require SVG.
 * Uses `useMemo` to avoid re-calculations on unrelated renders.
 */
const MiniSparkline = ({ data = [], color = '#2e7d32', height = 26, label = 'Sparkline' }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  const metrics = useMemo(() => {
    if (!hasData) return null;
    const nums = data.map((n) => Number(n) || 0);
    const max = Math.max(...nums, 1);
    const min = Math.min(...nums, 0);
    const range = Math.max(max - min, 1);
    const pointCount = nums.length;
    const barWidth = Math.max(2, Math.round((120 / Math.max(6, pointCount)) / 2));
    return { nums, max, min, range, pointCount, barWidth };
  }, [data, hasData]);

  if (!hasData) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${label}: no recent data`}
        style={[styles.container, { height }]}
      >
        <View style={styles.emptyBar} />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}: recent values ${data.slice(0, 8).join(', ')}`}
      style={[styles.row, { height }]}
    >
      {metrics.nums.map((v, i) => {
        const ratio = (v - metrics.min) / metrics.range;
        const barHeight = Math.max(2, Math.round(ratio * (height - 4)));
        return <View key={`p-${i}`} style={[styles.bar, { width: metrics.barWidth, height: barHeight, backgroundColor: color }]} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  emptyBar: { flex: 1, height: 2, backgroundColor: '#eee' },
  bar: { borderRadius: 2, marginRight: 4 },
});

export default React.memo(MiniSparkline);
