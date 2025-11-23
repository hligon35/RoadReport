// Mock Auth service: placeholder for future Stripe/Server integration
// Use Expo SecureStore for tokens in production: install expo-secure-store

export const AuthService = {
  async login(email, password) {
    // TODO: replace with real API
    return { id: 'u1', email, role: 'free', token: 'mock-token' };
  },

  async getRole(token) {
    // Placeholder returning 'free' or 'paid'
    return 'free';
  },

  async checkSubscription(userId) {
    // Placeholder for subscription status
    return { active: false, plan: null };
  },
};

export default AuthService;
