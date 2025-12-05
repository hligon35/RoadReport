import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Settings from '../screens/SettingsScreen';
import WorkHoursScreen from '../screens/WorkHoursScreen';
import EmailSettingsScreen from '../screens/EmailSettingsScreen';
import PushNotificationsScreen from '../screens/PushNotificationsScreen';
import NamedLocationsScreen from '../screens/NamedLocationsScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import CustomPurposesScreen from '../screens/CustomPurposesScreen';
import ContactsScreen from '../screens/ContactsScreen';
import MileageRatesScreen from '../screens/MileageRatesScreen';
import AccountScreen from '../screens/AccountScreen';
import DriveDetectionScreen from '../screens/DriveDetectionScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createNativeStackNavigator();

const SettingsStack = () => (
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
      name="SettingsMain"
      component={Settings}
      options={({ navigation }) => ({
        title: 'Profile',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 6 }} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={20} color="#1565c0" />
          </TouchableOpacity>
        ),
      })}
    />
    <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
    <Stack.Screen name="DriveDetection" component={DriveDetectionScreen} options={{ title: 'Drive Detection' }} />
    <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
    <Stack.Screen name="WorkHours" component={WorkHoursScreen} options={{ title: 'Work Hours' }} />
    <Stack.Screen name="EmailSettings" component={EmailSettingsScreen} options={{ title: 'Email Communications' }} />
    <Stack.Screen name="PushNotifications" component={PushNotificationsScreen} options={{ title: 'Push Notifications' }} />
    <Stack.Screen name="NamedLocations" component={NamedLocationsScreen} options={{ title: 'Named Locations' }} />
    <Stack.Screen name="Vehicles" component={VehiclesScreen} options={{ title: 'Vehicles' }} />
    <Stack.Screen name="CustomPurposes" component={CustomPurposesScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="Contacts" component={ContactsScreen} options={{ title: 'Contacts' }} />
    <Stack.Screen name="MileageRates" component={MileageRatesScreen} options={{ title: 'Mileage Rates' }} />
  </Stack.Navigator>
);

export default SettingsStack;
