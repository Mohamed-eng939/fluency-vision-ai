
import React, { createContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, UserProfile, UserRole } from './types';

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Set to false for testing
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth - simplified for testing
  useEffect(() => {
    // Check for existing session in localStorage for testing
    const savedUser = localStorage.getItem('test_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setSession({ user: userData });
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setLoading(false);
  }, []);
  
  // Sign in function - simplified for testing
  const signIn = async (email: string, password: string) => {
    try {
      // For testing - accept any email/password combination
      const testUser: UserProfile = {
        id: `test-${Date.now()}`,
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        role: email.includes('admin') ? 'admin' : 
              email.includes('assessor') ? 'assessor' : 'learner'
      };
      
      setUser(testUser);
      setSession({ user: testUser });
      
      // Save to localStorage for persistence
      localStorage.setItem('test_user', JSON.stringify(testUser));
      
      toast({
        title: "Signed In",
        description: `You have successfully signed in as ${testUser.role}.`,
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
  
  // Sign up function - simplified for testing
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // For testing - accept any email/password combination
      const testUser: UserProfile = {
        id: `test-${Date.now()}`,
        name: userData.name || email.split('@')[0],
        email: email,
        role: userData.role || 'learner'
      };
      
      setUser(testUser);
      setSession({ user: testUser });
      
      // Save to localStorage for persistence
      localStorage.setItem('test_user', JSON.stringify(testUser));
      
      toast({
        title: "Account Created",
        description: "Your test account has been created successfully.",
      });
      
      return { error: null, data: { user: testUser } };
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
      setUser(null);
      setSession(null);
      localStorage.removeItem('test_user');
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
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('test_user', JSON.stringify(updatedUser));
      
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
