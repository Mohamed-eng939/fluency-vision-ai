
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { UserRole } from './types';

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based access hooks
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

export const useIsAssessor = () => {
  const { user } = useAuth();
  return user?.role === 'assessor';
};

export const useIsLearner = () => {
  const { user } = useAuth();
  return user?.role === 'learner' || !user?.role;
};
