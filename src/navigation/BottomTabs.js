import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardStack from './DashboardStack';
import DrivesStack from './DrivesStack';
import ExpensesStack from './ExpensesStack';
import ReportsStack from './ReportsStack';
import SettingsStack from './SettingsStack';
import { DataContext } from '../context/DataContext';
import { ModalCloseContext } from '../context/ModalCloseContext';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  const { mileage, expenses } = useContext(DataContext);
  const { closeAll } = useContext(ModalCloseContext);

  const unclassifiedExists = useMemo(() => {
    const uTrips = (mileage || []).some((t) => !t.purpose || String(t.purpose).toLowerCase().includes('misc'));
    const uExpenses = (expenses || []).some((e) => !e.classification || String(e.classification).toLowerCase().includes('misc'));
    return uTrips || uExpenses;
  }, [mileage, expenses]);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#222',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        listeners={() => ({
          tabPress: () => {
            try { closeAll(); } catch (e) {}
          },
        })}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            const iconSize = size || 22;

            const TabIcon = () => {
              const pulse = useRef(new Animated.Value(1)).current;

              useEffect(() => {
                let anim;
                if (unclassifiedExists) {
                  anim = Animated.loop(
                    Animated.sequence([
                      Animated.timing(pulse, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                      Animated.timing(pulse, { toValue: 1.0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                    ])
                  );
                  anim.start();
                }
                return () => {
                  if (anim) anim.stop();
                };
              }, [pulse]);

              return (
                <View style={{ width: iconSize + 12, height: iconSize + 12, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={iconSize} color={focused ? '#222' : '#888'} />

                  {unclassifiedExists && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -6,
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#d32f2f',
                        borderWidth: 2,
                        borderColor: '#fff',
                        transform: [{ scale: pulse }],
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 1,
                        elevation: 2,
                      }}
                    />
                  )}
                </View>
              );
            };

            return <TabIcon />;
          },
        }}
      />

      <Tab.Screen
        name="Drives"
        component={DrivesStack}
        listeners={() => ({ tabPress: () => { try { closeAll(); } catch (e) {} } })}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'car' : 'car-outline'} size={size || 22} color={focused ? '#222' : '#888'} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesStack}
        listeners={() => ({ tabPress: () => { try { closeAll(); } catch (e) {} } })}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size || 22} color={focused ? '#222' : '#888'} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStack}
        listeners={() => ({ tabPress: () => { try { closeAll(); } catch (e) {} } })}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'stats-chart' : 'bar-chart-outline'} size={size || 22} color={focused ? '#222' : '#888'} />
          ),
        }}
      />
      {/* Profile/Settings is mounted at root in AppNavigator; no bottom tab entry here */}
    </Tab.Navigator>
  );
};

export default BottomTabs;
