// Wrapper utilities for storage. Choose AsyncStorage or SQLite depending on needs.
// Install: @react-native-async-storage/async-storage or expo-sqlite

// import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveJSON = async (key, obj) => {
  try {
    // await AsyncStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.warn('saveJSON error', e);
  }
};

export const loadJSON = async (key, fallback = null) => {
  try {
    // const v = await AsyncStorage.getItem(key);
    // return v ? JSON.parse(v) : fallback;
    return fallback;
  } catch (e) {
    console.warn('loadJSON error', e);
    return fallback;
  }
};

export default { saveJSON, loadJSON };
