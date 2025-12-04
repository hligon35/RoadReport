// Cloud provider configuration. Leave provider null to disable cloud sync.
// For Firebase: set provider = 'firebase' and provide firebaseConfig
// For Supabase: set provider = 'supabase' and provide supabaseUrl and supabaseKey

const cloudConfig = {
  provider: null, // 'firebase' | 'supabase' | null
  // firebaseConfig: {
  //   apiKey: 'YOUR_API_KEY',
  //   authDomain: 'YOUR_AUTH_DOMAIN',
  //   projectId: 'YOUR_PROJECT_ID',
  //   // ...other Firebase config
  // },
  // supabase: {
  //   url: 'https://your-supabase-url',
  //   key: 'public-anon-key',
  // }
};

export default cloudConfig;
