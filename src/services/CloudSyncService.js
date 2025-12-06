// CloudSyncService: placeholder synchronous functions for cloud sync.
// Replace with Firebase/Supabase or other provider implementation later.

import cloudConfig from '../config/cloudConfig';

const noop = async () => ({ ok: true });

const adapters = {
  none: {
    syncToCloud: noop,
    syncFromCloud: noop,
  },
  firebase: {
    // Firebase adapter skeleton: requires adding firebase SDK and initialization in app.
    syncToCloud: async (payload) => {
      try {
        // Example: push to Firestore collection 'routes'
        // This dynamic loader avoids requiring firebase unless configured.
        if (cloudConfig && cloudConfig.firebaseConfig) {
          try {
            const firebase = require('firebase/app');
            require('firebase/firestore');
            if (!firebase.apps || !firebase.apps.length) {
              firebase.initializeApp(cloudConfig.firebaseConfig);
            }
            const db = firebase.firestore();
            await Promise.all(payload.map((p) => db.collection('routes').doc(p.id).set(p, { merge: true })));
            return { ok: true };
          } catch (innerErr) {
            console.warn('CloudSyncService.firebase dynamic firestore error', innerErr);
            // fallthrough to log and return ok:false
            return { ok: false, error: innerErr };
          }
        }
        console.log('CloudSyncService.firebase.syncToCloud (skeleton, no config)', payload && payload.length ? `${payload.length} items` : payload);
        return { ok: true };
      } catch (err) {
        console.warn('CloudSyncService.firebase.syncToCloud error', err);
        return { ok: false, error: err };
      }
    },
    syncFromCloud: async () => {
      if (cloudConfig && cloudConfig.firebaseConfig) {
        try {
          const firebase = require('firebase/app');
          require('firebase/firestore');
          if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(cloudConfig.firebaseConfig);
          }
          const db = firebase.firestore();
          const snap = await db.collection('routes').get();
          const data = snap.docs.map((d) => d.data());
          return { ok: true, data };
        } catch (e) {
          console.warn('CloudSyncService.firebase.syncFromCloud error', e);
          return { ok: false, error: e };
        }
      }
      console.log('CloudSyncService.firebase.syncFromCloud (skeleton no config)');
      return { ok: true, data: null };
    },
  },
  supabase: {
    syncToCloud: async (payload) => {
      try {
        // Example: using @supabase/supabase-js
        // const { createClient } = require('@supabase/supabase-js');
        // const client = createClient(cloudConfig.supabase.url, cloudConfig.supabase.key);
        // await Promise.all(payload.map(p => client.from('routes').upsert(p)));
        console.log('CloudSyncService.supabase.syncToCloud (skeleton)', payload && payload.length ? `${payload.length} items` : payload);
        return { ok: true };
      } catch (err) {
        console.warn('CloudSyncService.supabase.syncToCloud error', err);
        return { ok: false, error: err };
      }
    },
    syncFromCloud: async () => {
      console.log('CloudSyncService.supabase.syncFromCloud (skeleton)');
      return { ok: true, data: null };
    },
  },
};

const getAdapter = () => {
  const p = cloudConfig && cloudConfig.provider;
  if (!p) return adapters.none;
  return adapters[p] || adapters.none;
};

export const syncToCloud = async (payload) => {
  const adapter = getAdapter();
  return adapter.syncToCloud(payload);
};

export const syncFromCloud = async () => {
  const adapter = getAdapter();
  return adapter.syncFromCloud();
};

export default { syncToCloud, syncFromCloud };
