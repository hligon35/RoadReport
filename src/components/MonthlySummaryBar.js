import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MonthlySummaryBar = ({ totalDrives = 0, totalMiles = 0, loggedValue = 0 }) => {
  return (
    <View style={styles.container} accessible accessibilityRole="summary" accessibilityLabel={`Monthly summary: ${totalDrives} routes, ${totalMiles} miles, $${loggedValue} logged`}>
      <View style={styles.item}>
        <Text style={styles.value} accessibilityLabel={`${totalDrives} routes`}>{totalDrives}</Text>
        <Text style={styles.label}>Routes</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.value} accessibilityLabel={`${Number(totalMiles).toFixed(1)} miles`}>{Number(totalMiles).toFixed(1)}</Text>
        <Text style={styles.label}>Miles</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.value} accessibilityLabel={`$${Number(loggedValue).toFixed(2)} logged`}>${Number(loggedValue).toFixed(2)}</Text>
        <Text style={styles.label}>Logged Value</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    // Pull the bar slightly up to sit closer under the native header
    marginTop: -12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default MonthlySummaryBar;
