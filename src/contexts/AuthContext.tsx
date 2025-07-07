import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// User role types
export type UserRole = 'admin' | 'assessor' | 'learner';

// Extended profile type that includes the new fields
interface ExtendedProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  organization_id: string | null;
  created_at: string | null;
  // Extended fields that we added
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  native_language?: string | null;
  username?: string | null;
  updated_at?: string | null;
}

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
interface AuthContextType {
  user: UserProfile | null;
  session: any; // Session from Supabase Auth
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          
          // Fetch user profile - use type assertion to handle extended fields
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profile) {
            const extendedProfile = profile as ExtendedProfile;
            setUser({
              id: extendedProfile.id,
              name: extendedProfile.name || extendedProfile.full_name,
              email: extendedProfile.email,
              role: (extendedProfile.role as UserRole) || 'learner',
              phone: extendedProfile.phone,
              country: extendedProfile.country,
              native_language: extendedProfile.native_language
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem loading your account information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/');
      } else if (event === 'SIGNED_IN' && newSession) {
        // Fetch user profile
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
            
          if (profile) {
            const extendedProfile = profile as ExtendedProfile;
            setUser({
              id: extendedProfile.id,
              name: extendedProfile.name || extendedProfile.full_name,
              email: extendedProfile.email,
              role: (extendedProfile.role as UserRole) || 'learner',
              phone: extendedProfile.phone,
              country: extendedProfile.country,
              native_language: extendedProfile.native_language
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, toast]);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Signed In",
        description: "You have successfully signed in.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { error };
    }
  };
  
  // Sign up function
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'learner'
          }
        }
      });
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error, data: null };
      }
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { error, data: null };
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/');
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive"
      });
    }
  };
  
  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }
    
    try {
      // Map name to both name and full_name for consistency
      const profileUpdate = {
        ...updates,
        full_name: updates.name || updates.name,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Update local state
      setUser({ ...user, ...updates });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { error };
    }
  };
  
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

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
