# RoadReport (Expo)

Scaffolded cross-platform React Native (Expo) app for mileage, expense, and delivery tracking.

## Structure
- `src/components` — UI components (MileageTracker, ExpenseLogger, Dashboard)
- `src/screens` — Screen wrappers for navigation
- `src/services` — Modular services (Auth, TaxReport, AmazonFlex, SparkDelivery placeholders)
- `src/context` — Context providers (`AuthContext`, `DataContext`)
- `src/hooks` — Custom hooks (location tracker)
- `src/utils` — Storage helpers
- `src/data` — Config data (taxRates)
- `src/navigation` — React Navigation (stack + tabs)

## Notable placeholders
- GPS: Hook skeleton in `src/hooks/useLocation.js` — integrate `expo-location` for permissions and background tracking.
- Persistence: `src/utils/storage.js` contains AsyncStorage/SQLite placeholders.
- Auth/subscriptions: Mock `AuthService` and `AuthContext`; integrate Stripe/Firebase later.
- Exports: CSV/PDF export placeholders exist in reports screen.

## Dev setup
1. Install required dependencies (recommended):

```powershell
cd "C:\Users\Harold Ligon\Documents\Coding\SparQDigital\MyMobileApps\RoadReport"
npm install
# or with yarn
# yarn install

# Then install commonly used packages:
# expo install expo-location expo-secure-store @react-native-async-storage/async-storage react-native-paper
# npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
# expo install react-native-screens react-native-safe-area-context
 - expo install expo-location expo-secure-store @react-native-async-storage/async-storage react-native-paper
 - npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
 - expo install react-native-screens react-native-safe-area-context
 - (optional for exports) expo install expo-file-system expo-sharing expo-print
```

2. Run the app with Expo:

```powershell
npx expo start
```

3. Web: Expo Web is supported; use the web option in the Expo dev tools.

## Next steps
- Wire `useLocation` to `expo-location` and implement background tracking.
- Add persistence with AsyncStorage or SQLite.
- Implement exports (CSV/PDF) and email sharing.
- Add real auth and subscription flow (Stripe) and cloud sync (Firebase/Supabase).

## Cloud Sync (Firebase / Supabase)
- Configure `src/config/cloudConfig.js` to enable a provider.
- For Firebase: set `provider: 'firebase'` and fill `firebaseConfig` with your Firebase project's config object.
	- Install Firebase SDK: `npm install firebase` or `expo install firebase`.
	- The app will initialize Firestore dynamically when `cloudConfig.firebaseConfig` is present.
- For Supabase: set `provider: 'supabase'` and fill `supabase` with `url` and `key`. Then install `@supabase/supabase-js`.

Security note: keep API keys and service credentials out of source control; use environment variables or a secure secret store in production.

## Notes
This scaffold favors modular, testable services and simple mock implementations so you can replace placeholders with production integrations later.
