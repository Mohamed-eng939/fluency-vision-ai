
// User role types
export type UserRole = 'admin' | 'assessor' | 'learner';

// User profile types
export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  phone?: string | null;
  country?: string | null;
  native_language?: string | null;
}

// Auth context interface
export interface AuthContextType {
  user: UserProfile | null;
  session: any; // Session from Supabase Auth
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
}
