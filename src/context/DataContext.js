import React, { createContext, useState, useEffect } from 'react';
// Data persistence: AsyncStorage or SQLite can be used. Placeholders below.
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [mileage, setMileage] = useState([]); // array of trips
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // TODO: load persisted data (AsyncStorage/SQLite)
  }, []);

  const addTrip = (trip) => {
    setMileage((s) => [trip, ...s]);
    // persist
  };

  const addExpense = (expense) => {
    setExpenses((s) => [expense, ...s]);
    // persist
  };

  const clearAll = () => {
    setMileage([]);
    setExpenses([]);
  };

  return (
    <DataContext.Provider value={{ mileage, expenses, addTrip, addExpense, clearAll }}>
      {children}
    </DataContext.Provider>
  );
};
