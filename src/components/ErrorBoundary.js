import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

/**
 * Simple error boundary to catch render errors in production and show fallback UI.
 * Place at high level (e.g., wrap `App` root) to prevent full white-screen crashes.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // TODO: hook into logging/monitoring service (Sentry/LogRocket)
    try {
      // send to remote logger if configured
      // Logger.captureException(error, { extra: info });
    } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>An unexpected error occurred. Please restart the app.</Text>
          <Button title="Reload" onPress={() => { this.setState({ hasError: false, error: null }); }} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', marginBottom: 12, textAlign: 'center' },
});
