import React, { useContext } from 'react';
import { SafeAreaView, View, Text, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const SettingsScreen = () => {
  const { user, loginMock, logout, upgradeToPaidMock } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22 }}>Settings</Text>
        <Text>User: {user ? user.name : 'Not logged in'}</Text>
        {!user ? (
          <Button title="Mock Login" onPress={() => loginMock('demo@example.com')} />
        ) : (
          <>
            <Button title="Mock Upgrade to Paid" onPress={upgradeToPaidMock} />
            <Button title="Logout" onPress={logout} />
          </>
        )}
        <Text style={{ marginTop: 12, color: '#666' }}>RBAC: free vs paid controls export features.</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
