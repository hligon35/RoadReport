import * as SecureStore from 'expo-secure-store';

export const saveSecret = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (e) {
    console.warn('SecureStore save failed', e);
    return false;
  }
};

export const getSecret = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.warn('SecureStore get failed', e);
    return null;
  }
};

export default { saveSecret, getSecret };
