
// Re-export from the auth context
export { useAuth, useIsAdmin, useIsAssessor, useIsLearner } from './hooks';
export { AuthProvider } from './AuthContext';
export type { UserProfile, UserRole } from './types';
