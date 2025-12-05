import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

const WorkHoursScreen = () => {
  const [enabled, setEnabled] = React.useState(true);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Work Hours</Text>
        <Text style={styles.desc}>Configure your typical work hours so frequent drives and detection can use them.</Text>
        <View style={{ height: 16 }} />
        <View style={styles.row}>
          <Text style={styles.rowText}>Enabled</Text>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
        <View style={{ height: 12 }} />
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Edit Work Hours</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowText: { fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center' },
});

export default WorkHoursScreen;
