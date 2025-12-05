import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DashboardScreen from '../screens/DashboardScreen';
import Miscellaneous from '../screens/Miscellaneous';
import { DataContext } from '../context/DataContext';
import { ModalCloseContext } from '../context/ModalCloseContext';
import ProfileHeaderButton from '../components/ProfileHeaderButton';

const Stack = createNativeStackNavigator();

const UnclassifiedHeaderButton = () => {
  const navigation = useNavigation();
  const { mileage, expenses } = useContext(DataContext);
  const { closeAll } = useContext(ModalCloseContext) || {};

  const uTrips = (mileage || []).filter((t) => !t.purpose || String(t.purpose).toLowerCase().includes('misc'));
  const uExpenses = (expenses || []).filter((e) => !e.classification || String(e.classification).toLowerCase().includes('misc'));
  const count = (uTrips.length || 0) + (uExpenses.length || 0);

  return (
    <TouchableOpacity
      onPress={() => { try { closeAll && closeAll(); } catch (e) {} ; navigation.navigate('Miscellaneous'); }}
      style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}
      accessibilityRole="button"
      accessibilityLabel={`Miscellaneous items ${count}`}
    >
      <View style={{}}>
        <Text style={{ color: '#333', textAlign: 'center' }}>Attention{'\n'}Needed</Text>
      </View>
      <View style={{ marginLeft: 6, minWidth: 24, height: 24, borderRadius: 12, backgroundColor: count ? '#FFBF00' : '#008450', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SmallBackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 6 }} accessibilityRole="button" accessibilityLabel="Back to dashboard">
      <Text style={{ fontSize: 16, color: '#1565c0' }}>{'‹ Back'}</Text>
    </TouchableOpacity>
  );
};

const HeaderTitleStack = ({ title = 'Miscellaneous', subtitle = 'Items' }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 16, fontWeight: '700' }}>{title}</Text>
    <Text style={{ fontSize: 12, color: '#666' }}>{subtitle}</Text>
  </View>
);

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
        options={{ title: 'Dashboard', headerLeft: () => <UnclassifiedHeaderButton />, headerRight: () => <ProfileHeaderButton /> }}
      />
      <Stack.Screen
        name="Miscellaneous"
        component={Miscellaneous}
        options={{
          // custom stacked title and smaller back button
          headerTitle: () => <HeaderTitleStack />,
          headerLeft: () => <SmallBackButton />,
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
