import React from 'react';
import { View } from 'react-native';

// Lightweight sparkline using plain Views — works without native SVG libs.
// Props:
// - data: array of numbers
// - color: bar/line color
// - height: visual height
// - label: accessibility label prefix
const MiniSparkline = ({ data = [], color = '#2e7d32', height = 26, label = 'Sparkline' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    // render a subtle empty bar
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${label}: no recent data`}
        style={{ height, backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ flex: 1, height: 2, backgroundColor: '#eee' }} />
      </View>
    );
  }

  const max = Math.max(...data.map((n) => Number(n) || 0), 1);
  const min = Math.min(...data.map((n) => Number(n) || 0), 0);
  const range = Math.max(max - min, 1);
  const pointCount = data.length;
  const barWidth = Math.max(2, Math.round((120 / Math.max(6, pointCount)) / 2));

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}: recent values ${data.slice(0, 8).join(', ')}`}
      style={{ height, flexDirection: 'row', alignItems: 'flex-end' }}
    >
      {data.map((val, i) => {
        const v = Number(val) || 0;
        const ratio = (v - min) / range;
        const barHeight = Math.max(2, Math.round(ratio * (height - 4)));
        return (
          <View
            key={`p-${i}`}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: color,
              borderRadius: 2,
              marginRight: 4,
            }}
          />
        );
      })}
    </View>
  );
};

export default MiniSparkline;
