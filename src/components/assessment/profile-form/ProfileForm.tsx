
import React, { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountSection } from './AccountSection';
import { PersonalInfoSection } from './PersonalInfoSection';
import { LearningContextSection } from './LearningContextSection';
import { PreferencesSection } from './PreferencesSection';
import { ConsentSection } from './ConsentSection';
import { profileFormSchema, ProfileFormValues } from './types';
import { countries, languages, cefrLevels, testReasons } from './constants';
import { StudentInfo } from '@/hooks/assessment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  onSubmit: (data: StudentInfo) => void;
  onCancel?: () => void;
}

// Profile data type matching actual Supabase profiles table structure
interface ProfileData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  country_of_citizenship?: string | null;
  country_of_residence?: string | null;
  firstLanguage?: string | null;
  testReason?: string | null;
  estimatedLevel?: string | null;
  preferredContact?: string | null;
  pronunciationPreference?: string | null;
  role: string; // Required field
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      citizenshipCountry: '',
      residenceCountry: '',
      firstLanguage: '',
      testReason: '',
      estimatedLevel: '',
      preferredContact: 'email',
      pronunciationPreference: 'neutral',
      promoCode: '',
      dataConsent: false,
      emailResults: false,
    },
  });

  // Fetch existing profile data if user is authenticated
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        
        // Fetch profile data from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
          return;
        }

        if (profile) {
          // Populate form with existing data (only use fields that exist in the profiles table)
          form.reset({
            name: profile.name || '',
            username: profile.username || '',
            email: profile.email || user.email || '',
            phone: profile.phone_number || '',
            password: '', // Never pre-fill password
            confirmPassword: '',
            citizenshipCountry: profile.country_of_citizenship || '',
            residenceCountry: profile.country_of_residence || '',
            dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
            firstLanguage: profile.firstLanguage || '',
            testReason: profile.testReason || '',
            otherReason: '', // Not stored in profiles table
            estimatedLevel: profile.estimatedLevel || '',
            preferredContact: (profile.preferredContact as any) || 'email',
            pronunciationPreference: (profile.pronunciationPreference as any) || 'neutral',
            promoCode: '', // Not stored in profiles table
            dataConsent: false, // Not stored in profiles table - always require re-consent
            emailResults: false, // Not stored in profiles table
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    fetchProfileData();
  }, [user?.id, form, toast]);

  // Auto-generate username based on name and phone
  useEffect(() => {
    const subscription = form.watch((values, { name: fieldName }) => {
      if ((fieldName === 'name' || fieldName === 'phone') && values.name && values.phone && values.phone.length >= 4) {
        const baseName = values.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const lastFourDigits = values.phone.slice(-4);
        const generatedUsername = `${baseName}${lastFourDigits}`;
        
        // Only update if user hasn't manually changed it
        if (!values.username || form.getValues('username') === generatedUsername.slice(0, -4) + values.phone.slice(-8, -4)) {
          form.setValue('username', generatedUsername);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      let currentSession = session;
      
      // If user is not authenticated, sign them up first
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              phone: values.phone
            }
          }
        });

        if (authError) {
          // If user exists, try signing in
          if (authError.message.includes('User already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: values.email,
              password: values.password
            });

            if (signInError) throw signInError;
            if (!signInData.session) throw new Error("No session after sign in");
            
            currentSession = signInData.session;
          } else {
            throw authError;
          }
        } else {
          if (!authData.session) throw new Error("No session after sign up");
          currentSession = authData.session;
        }
      }

      if (!currentSession) {
        throw new Error("No valid session found");
      }

      // Prepare profile data payload (only include fields that exist in profiles table)
      const profileData: ProfileData = {
        id: currentSession.user.id,
        name: values.name,
        username: values.username,
        email: values.email,
        phone_number: values.phone,
        date_of_birth: values.dateOfBirth?.toISOString().split('T')[0] || null,
        country_of_citizenship: values.citizenshipCountry,
        country_of_residence: values.residenceCountry,
        firstLanguage: values.firstLanguage,
        testReason: values.testReason,
        estimatedLevel: values.estimatedLevel,
        preferredContact: values.preferredContact,
        pronunciationPreference: values.pronunciationPreference,
        role: user?.role || 'learner'
      };

      // Save to Supabase using upsert (insert or update)
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        throw new Error(`Failed to save profile: ${upsertError.message}`);
      }

      // Show success message
      toast({
        title: "Success",
        description: user ? "Profile updated successfully!" : "Profile created successfully!",
      });

      // Convert to StudentInfo format for callback
      const studentInfoData: StudentInfo = {
        name: values.name,
        email: values.email,
        username: values.username,
        phone: values.phone,
        citizenshipCountry: values.citizenshipCountry,
        residenceCountry: values.residenceCountry,
        dateOfBirth: values.dateOfBirth,
        firstLanguage: values.firstLanguage,
        testReason: values.testReason,
        otherReason: values.otherReason,
        estimatedLevel: values.estimatedLevel,
        preferredContact: values.preferredContact,
        pronunciationPreference: values.pronunciationPreference,
        promoCode: values.promoCode,
        dataConsent: values.dataConsent,
        emailResults: values.emailResults,
      };

      onSubmit(studentInfoData);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {isInitializing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : (
          <>
            <PersonalInfoSection form={form} countries={countries} languages={languages} />
            <AccountSection form={form} />
            <LearningContextSection form={form} testReasons={testReasons} cefrLevels={cefrLevels} />
            <PreferencesSection form={form} />
            <ConsentSection form={form} />
            
            <Button 
              type="submit" 
              disabled={isLoading || isInitializing}
              className="w-full bg-assessment-blue hover:bg-assessment-lightBlue"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {user ? 'Updating Profile...' : 'Creating Profile...'}
                </>
              ) : (
                user ? 'Update Profile & Continue' : 'Create Profile & Start Assessment'
              )}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
};
