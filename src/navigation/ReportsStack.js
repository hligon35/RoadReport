import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Reports from '../screens/Reports';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileHeaderButton from '../components/ProfileHeaderButton';

const Stack = createNativeStackNavigator();

const ReportsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      headerLargeTitle: false,
      headerStyle: { height: 56 },
      headerTitleStyle: { fontSize: 18, fontWeight: '700' },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="ReportsMain"
      component={Reports}
      options={({ navigation }) => ({
        title: 'Reports',
        headerLeft: () => (
          <View style={styles.legendContainer} accessibilityRole="toolbar">
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#4caf50' }]} />
              <Text style={styles.legendText}>Business</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: '#ffb74d' }]} />
              <Text style={styles.legendText}>Unclaimed</Text>
            </View>
          </View>
        ),
        headerRight: () => <ProfileHeaderButton />,
      })}
    />
    <Stack.Screen
      name="ReportsMonth"
      component={ReportsScreen}
      options={({ route }) => ({ title: route && route.params && route.params.monthLabel ? route.params.monthLabel : 'Report' })}
    />
  </Stack.Navigator>
);

export default ReportsStack;

const styles = StyleSheet.create({
  legendContainer: { flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 8, paddingRight: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6, borderWidth: 0.5, borderColor: '#ccc' },
  legendText: { fontSize: 12, color: '#333' },
});
