import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Expenses from '../screens/Expenses';
import { useContext } from 'react';
import { ModalCloseContext } from '../context/ModalCloseContext';
import ProfileHeaderButton from '../components/ProfileHeaderButton';

const Stack = createNativeStackNavigator();

const ExpensesStack = () => {
  const { closeAll } = useContext(ModalCloseContext) || {};

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
        name="ExpensesMain"
        component={Expenses}
        options={({ navigation, route }) => ({
          title: 'Expenses',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                try { closeAll && closeAll(); } catch (e) {}
                const isOpen = route && route.params && route.params.openAdd;
                if (isOpen) navigation.setParams({ openAdd: null }); else navigation.setParams({ openAdd: Date.now() });
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Ionicons name="add" size={22} color="#1976d2" />
            </TouchableOpacity>
          ),
          headerRight: () => <ProfileHeaderButton />,
        })}
      />
    </Stack.Navigator>
  );
};

export default ExpensesStack;
