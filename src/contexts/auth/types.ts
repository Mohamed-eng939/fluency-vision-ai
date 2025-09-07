
// User role types
export type UserRole = 'admin' | 'assessor' | 'learner';

// User profile types
export interface UserProfile {
  id: string;
  full_name?: string | null; // Changed from 'name' to match DB column
  email?: string | null;
  role: UserRole;
  phone?: string | null;
  country_of_citizenship?: string | null; // Changed from 'country' to match DB column
  country_of_residence?: string | null;
  first_language?: string | null; // Changed from 'native_language' to match DB column
  username?: string | null;
  date_of_birth?: string | null;
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
