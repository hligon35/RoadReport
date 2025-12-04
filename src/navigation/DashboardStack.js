import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import Unclassified from '../screens/Unclassified';
import { DataContext } from '../context/DataContext';

const Stack = createNativeStackNavigator();

const UnclassifiedHeaderButton = () => {
  const navigation = useNavigation();
  const { mileage, expenses } = useContext(DataContext);

  const uTrips = (mileage || []).filter((t) => !t.purpose || String(t.purpose).toLowerCase().includes('unclass'));
  const uExpenses = (expenses || []).filter((e) => !e.classification || String(e.classification).toLowerCase().includes('unclass'));
  const count = (uTrips.length || 0) + (uExpenses.length || 0);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Unclassified')}
      style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}
      accessibilityRole="button"
      accessibilityLabel={`Unclassified items ${count}`}
    >
      <View style={{}}>
        <Text style={{ color: '#333' }}>Unclassified</Text>
      </View>
      <View style={{ marginLeft: 6, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: count ? '#FFBF00' : '#008450', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DashboardStack = () => {
  return (
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
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: 'Dashboard', headerLeft: () => <UnclassifiedHeaderButton /> }}
      />
      <Stack.Screen name="Unclassified" component={Unclassified} options={{ title: 'Unclassified Items' }} />
    </Stack.Navigator>
  );
};

export default DashboardStack;
