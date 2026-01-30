
import React, { createContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile, UserRole } from './types';
import { User, Session } from '@supabase/supabase-js';

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth with real Supabase
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, hasUser: !!session?.user });
        setSession(session);
        
        if (session?.user) {
          // IMPORTANT: Never block auth state on a profile fetch.
          // If PostgREST/RLS/network stalls here, the app would keep `user=null` forever.
          const basicUser: UserProfile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
            role: 'learner',
            phone: '',
            country_of_citizenship: '',
            country_of_residence: '',
            first_language: '',
            username: '',
            date_of_birth: null,
          };
          setUser(basicUser);

          // Fetch user profile from profiles table (best-effort with timeout)
          try {
            console.time('⏱️ auth: fetch profile');
            const profilePromise = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const { data: profile, error } = await Promise.race([
              Promise.resolve(profilePromise as any),
              new Promise<{ data: null; error: Error }>((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timed out after 8000ms')), 8000)
              ),
            ]);

            if (error && (error as any).code !== 'PGRST116') {
              console.error('❌ Error fetching profile:', error);
            }

            const mergedUser: UserProfile = {
              ...basicUser,
              full_name: profile?.full_name || basicUser.full_name,
              email: profile?.email || basicUser.email,
              role: (profile?.role as UserRole) || basicUser.role,
              phone: profile?.phone || '',
              country_of_citizenship: profile?.country_of_citizenship || '',
              country_of_residence: profile?.country_of_residence || '',
              first_language: profile?.first_language || '',
              username: profile?.username || '',
              date_of_birth: profile?.date_of_birth || null,
            };
            setUser(mergedUser);
          } catch (error) {
            console.error('⚠️ Profile fetch failed (continuing with basic user):', error);
          } finally {
            console.timeEnd('⏱️ auth: fetch profile');
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
      // The onAuthStateChange will handle setting the session
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Sign in function with real Supabase auth
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Sign In Error",
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
    } finally {
      setLoading(false);
    }
  };
  
  // Sign up function with real Supabase auth
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/assessment`;
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.full_name,
            role: userData.role || 'learner'
          }
        }
      });
      
      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
        return { error, data: null };
      }
      
      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: userData.full_name || email.split('@')[0],
            email: email,
            role: userData.role || 'learner'
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });
      
      return { error: null, data };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return { error, data: null };
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
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
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
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
