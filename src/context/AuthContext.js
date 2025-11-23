import React, { createContext, useState, useEffect } from 'react';
// Placeholder: uses Expo SecureStore for token/role storage (install expo-secure-store)
// import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {id, name, role: 'free'|'paid'}

  useEffect(() => {
    // TODO: load user from SecureStore on mount
  }, []);

  const loginMock = async (email) => {
    // Mock login: in future replace with real auth + Stripe checks
    const mockUser = { id: 'u1', name: 'Demo User', role: 'free' };
    setUser(mockUser);
    // await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
    return mockUser;
  };

  const upgradeToPaidMock = async () => {
    // Mock upgrade flow
    if (!user) return null;
    const updated = { ...user, role: 'paid' };
    setUser(updated);
    // await SecureStore.setItemAsync('user', JSON.stringify(updated));
    return updated;
  };

  const logout = async () => {
    setUser(null);
    // await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ user, loginMock, logout, upgradeToPaidMock }}>
      {children}
    </AuthContext.Provider>
  );
};
