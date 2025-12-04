Running tests

Install test runtime deps (if not already installed):

```powershell
npm install --save-dev react-test-renderer
```

Then run:

```powershell
npm test
```

If you see open-handle warnings, try:

```powershell
npm test -- --detectOpenHandles
```

Notes:
- Ensure `.babelrc` uses `babel-preset-expo` (already configured in this repo).
- If you upgraded React to a non-Expo-managed version, install a matching `react-test-renderer` version (major should match React).