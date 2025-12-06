/**
 * Storage utilities.
 * - Non-sensitive values use AsyncStorage.
 * - Sensitive values (prefix `secure:`) use `expo-secure-store` via the project's SecureStoreWrapper.
 *
 * This central wrapper makes it easy to migrate keys to secure storage and to audit storage usage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecureStoreWrapper from '../services/SecureStoreWrapper';

/**
 * Decide whether a key should be stored in secure storage.
 * Convention: keys starting with `secure:` are sensitive and go to SecureStore.
 * @param {string} key
 * @returns {boolean}
 */
const isSecureKey = (key) => typeof key === 'string' && key.indexOf('secure:') === 0;

/**
 * Save an object as JSON to storage. Uses SecureStore for keys prefixed with `secure:`.
 * @param {string} key
 * @param {any} obj
 */
export const saveJSON = async (key, obj) => {
  try {
    const str = JSON.stringify(obj);
    if (isSecureKey(key)) {
      // remove prefix when saving to SecureStore to keep keys concise
      const k = key.replace(/^secure:/, '');
      return await SecureStoreWrapper.saveSecret(k, str);
    }
    await AsyncStorage.setItem(key, str);
    return true;
  } catch (e) {
    console.warn('saveJSON error', e);
    return false;
  }
};

/**
 * Load JSON from storage and parse it. Returns `fallback` if not found or parse fails.
 * @param {string} key
 * @param {any} fallback
 */
export const loadJSON = async (key, fallback = null) => {
  try {
    if (isSecureKey(key)) {
      const k = key.replace(/^secure:/, '');
      const v = await SecureStoreWrapper.getSecret(k);
      return v ? JSON.parse(v) : fallback;
    }
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    console.warn('loadJSON error', e);
    return fallback;
  }
};

export default { saveJSON, loadJSON };
