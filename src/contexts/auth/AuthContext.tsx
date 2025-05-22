
import React, { createContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile, UserRole } from './types';
import { fetchUserProfile, signInWithEmail, signOut as supabaseSignOut, signUpWithEmail, updateUserProfile } from './authService';

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          
          // Fetch user profile
          const { data: profile, error } = await fetchUserProfile(currentSession.user.id);
            
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: (profile.role as UserRole) || 'learner',
              phone: profile.phone,
              country: profile.country,
              native_language: profile.native_language
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
          const { data: profile } = await fetchUserProfile(newSession.user.id);
            
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: (profile.role as UserRole) || 'learner',
              phone: profile.phone,
              country: profile.country,
              native_language: profile.native_language
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
      const { error } = await signInWithEmail(email, password);
      
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
      
      // The function to create a profile in the public.profiles table is handled by a database trigger
      // So we don't need to manually create the profile here
      
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
      await supabaseSignOut();
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
      const { error } = await updateUserProfile(user.id, updates);
      
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
