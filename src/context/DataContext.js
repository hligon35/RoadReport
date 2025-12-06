import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloudSyncService from '../services/CloudSyncService';

export const DataContext = createContext();

const KEY_MILEAGE = 'rr:mileage:v1';
const KEY_EXPENSES = 'rr:expenses:v1';
const KEY_VEHICLES = 'rr:vehicles:v1';
const KEY_CONTACTS = 'rr:contacts:v1';
const KEY_CATEGORIES = 'rr:categories:v1';

export const DataProvider = ({ children }) => {
  const [mileage, setMileage] = useState([]); // array of routes
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load persisted data on mount
    (async () => {
      try {
        const m = await AsyncStorage.getItem(KEY_MILEAGE);
        const e = await AsyncStorage.getItem(KEY_EXPENSES);
        if (m) setMileage(JSON.parse(m));
        if (e) setExpenses(JSON.parse(e));
        const v = await AsyncStorage.getItem(KEY_VEHICLES);
        const c = await AsyncStorage.getItem(KEY_CONTACTS);
        const cat = await AsyncStorage.getItem(KEY_CATEGORIES);
        if (v) setVehicles(JSON.parse(v));
        if (c) setContacts(JSON.parse(c));
        if (cat) setCategories(JSON.parse(cat));
          // DEV: if no mileage persisted and running in dev, seed with 5 dummy routes
        if (__DEV__) {
          const hasMileage = m && Array.isArray(JSON.parse(m)) && JSON.parse(m).length > 0;
          if (!hasMileage) {
            const now = new Date();
            const makeISO = (d) => new Date(d).toISOString();
            const sample = [
              {
                id: `dev-${Date.now()}-1`,
                start: makeISO(now),
                distance: 12.4,
                purpose: 'Business - Delivery',
                classification: 'business',
                startCoords: { latitude: 37.7749, longitude: -122.4194 },
              },
              {
                id: `dev-${Date.now()}-2`,
                start: makeISO(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
                distance: 6.7,
                purpose: 'Personal - Grocery',
                classification: 'personal',
                startCoords: { latitude: 37.7849, longitude: -122.4094 },
              },
              {
                id: `dev-${Date.now()}-3`,
                start: makeISO(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
                distance: 22.1,
                purpose: 'Business - Meeting',
                classification: 'business',
                startCoords: { latitude: 37.7649, longitude: -122.4294 },
              },
              {
                id: `dev-${Date.now()}-4`,
                start: makeISO(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
                distance: 3.2,
                purpose: 'Personal - Coffee',
                classification: 'personal',
                startCoords: { latitude: 37.7549, longitude: -122.4394 },
              },
              {
                id: `dev-${Date.now()}-5`,
                start: makeISO(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)), // 25 days ago
                distance: 48.9,
                purpose: 'Business - Airport',
                classification: 'business',
                startCoords: { latitude: 37.8049, longitude: -122.3994 },
              },
              // add a miscellaneous route for dev testing
              {
                id: `dev-${Date.now()}-un-1`,
                start: makeISO(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
                distance: 7.6,
                // purpose intentionally left undefined to mark miscellaneous
                startCoords: { latitude: 37.7929, longitude: -122.4100 },
              },
              {
                id: `dev-${Date.now()}-un-2`,
                start: makeISO(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)),
                distance: 3.9,
                purpose: 'miscellaneous',
                startCoords: { latitude: 37.7829, longitude: -122.4200 },
              },
            ];
            setMileage(sample);
            try {
              await AsyncStorage.setItem(KEY_MILEAGE, JSON.stringify(sample));
            } catch (err) {
              console.warn('seed mileage save error', err);
            }
          }
          // DEV: seed sample expenses if none present
          const hasExpenses = e && Array.isArray(JSON.parse(e)) && JSON.parse(e).length > 0;
          if (!hasExpenses) {
            const now2 = new Date();
            const makeISO2 = (d) => new Date(d).toISOString();
            const sampleExpenses = [
              {
                id: `dev-exp-${Date.now()}-1`,
                date: makeISO2(now2),
                amount: 24.5,
                description: 'Vehicle tolls',
                classification: 'business',
              },
              {
                id: `dev-exp-${Date.now()}-2`,
                date: makeISO2(new Date(now2.getTime() - 2 * 24 * 60 * 60 * 1000)),
                amount: 8.75,
                description: 'Lunch',
                classification: 'personal',
              },
              {
                id: `dev-exp-${Date.now()}-3`,
                date: makeISO2(new Date(now2.getTime() - 4 * 24 * 60 * 60 * 1000)),
                amount: 62.0,
                description: 'Parking',
                classification: 'business',
              },
              {
                id: `dev-exp-${Date.now()}-4`,
                date: makeISO2(new Date(now2.getTime() - 8 * 24 * 60 * 60 * 1000)),
                amount: 15.0,
                description: 'Snacks',
                classification: 'personal',
              },
              {
                id: `dev-exp-${Date.now()}-5`,
                date: makeISO2(new Date(now2.getTime() - 20 * 24 * 60 * 60 * 1000)),
                amount: 120.0,
                description: 'Equipment',
                classification: 'business',
              },
              // miscellaneous expense samples
              {
                id: `dev-exp-${Date.now()}-un-1`,
                date: makeISO2(new Date(now2.getTime() - 3 * 24 * 60 * 60 * 1000)),
                amount: 19.99,
                description: 'Parking fee',
                // classification intentionally missing
              },
              {
                id: `dev-exp-${Date.now()}-un-2`,
                date: makeISO2(new Date(now2.getTime() - 7 * 24 * 60 * 60 * 1000)),
                amount: 6.5,
                description: 'Beverage',
                classification: 'miscellaneous',
              },
            ];
            setExpenses(sampleExpenses);
            try {
              await AsyncStorage.setItem(KEY_EXPENSES, JSON.stringify(sampleExpenses));
            } catch (err) {
              console.warn('seed expenses save error', err);
            }
          }
        }
      } catch (err) {
        console.warn('DataProvider load error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist mileage whenever it changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_MILEAGE, JSON.stringify(mileage));
      } catch (err) {
        console.warn('save mileage error', err);
      }
    })();
  }, [mileage]);

  // Persist vehicles & contacts
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_VEHICLES, JSON.stringify(vehicles));
      } catch (err) {
        console.warn('save vehicles error', err);
      }
    })();
  }, [vehicles]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_CONTACTS, JSON.stringify(contacts));
      } catch (err) {
        console.warn('save contacts error', err);
      }
    })();
  }, [contacts]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_CATEGORIES, JSON.stringify(categories));
      } catch (err) {
        console.warn('save categories error', err);
      }
    })();
  }, [categories]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_EXPENSES, JSON.stringify(expenses));
      } catch (err) {
        console.warn('save expenses error', err);
      }
    })();
  }, [expenses]);

  const addRoute = (route) => {
    const now = new Date().toISOString();
    const withMeta = { ...route, lastEdited: now, createdAt: route.createdAt || now };
    setMileage((s) => [withMeta, ...s]);
    // fire-and-forget cloud sync
    try {
      CloudSyncService.syncToCloud([withMeta]);
    } catch (e) {
      console.warn('addRoute cloud sync failed', e);
    }
  };

  const updateRoute = (updated) => {
    const now = new Date().toISOString();
    const withMeta = { ...updated, lastEdited: now };
    setMileage((s) => s.map((t) => (t.id === updated.id ? { ...t, ...withMeta } : t)));
    try {
      CloudSyncService.syncToCloud([withMeta]);
    } catch (e) {
      console.warn('updateRoute cloud sync failed', e);
    }
  };

  const deleteRoute = (route) => {
    setMileage((s) => s.filter((t) => t.id !== route.id));
    try {
      CloudSyncService.syncToCloud([{ id: route.id, _deleted: true }]);
    } catch (e) {
      console.warn('deleteRoute cloud sync failed', e);
    }
  };

  const addExpense = (expense) => {
    const now = new Date().toISOString();
    const withMeta = { ...expense, lastEdited: now, createdAt: expense.date || now };
    setExpenses((s) => [withMeta, ...s]);
  };

  const updateExpense = (updated) => {
    const now = new Date().toISOString();
    const withMeta = { ...updated, lastEdited: now };
    setExpenses((s) => s.map((e) => (e.id === updated.id ? { ...e, ...withMeta } : e)));
  };

  const deleteExpense = (expense) => {
    setExpenses((s) => s.filter((e) => e.id !== expense.id));
  };

  // Vehicles
  const addVehicle = (vehicle) => {
    setVehicles((s) => [vehicle, ...s]);
  };

  const updateVehicle = (updated) => {
    setVehicles((s) => s.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)));
  };

  const deleteVehicle = (vehicle) => {
    setVehicles((s) => s.filter((v) => v.id !== vehicle.id));
  };

  // Contacts
  const addContact = (contact) => {
    setContacts((s) => [contact, ...s]);
  };

  const updateContact = (updated) => {
    setContacts((s) => s.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const deleteContact = (contact) => {
    setContacts((s) => s.filter((c) => c.id !== contact.id));
  };

  // Categories (custom purposes -> categories)
  const addCategory = (cat) => {
    setCategories((s) => [cat, ...s]);
  };

  const updateCategory = (updated) => {
    setCategories((s) => s.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const deleteCategory = (cat) => {
    setCategories((s) => s.filter((c) => c.id !== cat.id));
  };

  const clearAll = async () => {
    setMileage([]);
    setExpenses([]);
    try {
      await AsyncStorage.removeItem(KEY_MILEAGE);
      await AsyncStorage.removeItem(KEY_EXPENSES);
    } catch (err) {
      console.warn('clearAll error', err);
    }
  };

  return (
    <DataContext.Provider value={{
      mileage,
      expenses,
      vehicles,
      contacts,
      categories,
      loading,
      addRoute,
      updateRoute,
      deleteRoute,
      addExpense,
      updateExpense,
      deleteExpense,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addContact,
      updateContact,
      deleteContact,
      addCategory,
      updateCategory,
      deleteCategory,
      clearAll,
    }}>
      {children}
    </DataContext.Provider>
  );
};
