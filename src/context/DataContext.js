import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloudSyncService from '../services/CloudSyncService';

export const DataContext = createContext();

const KEY_MILEAGE = 'rr:mileage:v1';
const KEY_EXPENSES = 'rr:expenses:v1';

export const DataProvider = ({ children }) => {
  const [mileage, setMileage] = useState([]); // array of trips
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load persisted data on mount
    (async () => {
      try {
        const m = await AsyncStorage.getItem(KEY_MILEAGE);
        const e = await AsyncStorage.getItem(KEY_EXPENSES);
        if (m) setMileage(JSON.parse(m));
        if (e) setExpenses(JSON.parse(e));
        // DEV: if no mileage persisted and running in dev, seed with 5 dummy trips
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

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(KEY_EXPENSES, JSON.stringify(expenses));
      } catch (err) {
        console.warn('save expenses error', err);
      }
    })();
  }, [expenses]);

  const addTrip = (trip) => {
    setMileage((s) => [trip, ...s]);
    // fire-and-forget cloud sync
    try {
      CloudSyncService.syncToCloud([trip]);
    } catch (e) {
      console.warn('addTrip cloud sync failed', e);
    }
  };

  const updateTrip = (updated) => {
    setMileage((s) => s.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    try {
      CloudSyncService.syncToCloud([updated]);
    } catch (e) {
      console.warn('updateTrip cloud sync failed', e);
    }
  };

  const deleteTrip = (trip) => {
    setMileage((s) => s.filter((t) => t.id !== trip.id));
    try {
      CloudSyncService.syncToCloud([{ id: trip.id, _deleted: true }]);
    } catch (e) {
      console.warn('deleteTrip cloud sync failed', e);
    }
  };

  const addExpense = (expense) => {
    setExpenses((s) => [expense, ...s]);
  };

  const updateExpense = (updated) => {
    setExpenses((s) => s.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  };

  const deleteExpense = (expense) => {
    setExpenses((s) => s.filter((e) => e.id !== expense.id));
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
    <DataContext.Provider value={{ mileage, expenses, loading, addTrip, updateTrip, deleteTrip, addExpense, clearAll }}>
      {children}
    </DataContext.Provider>
  );
};
