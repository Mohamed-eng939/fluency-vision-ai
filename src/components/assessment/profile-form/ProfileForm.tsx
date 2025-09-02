
import React from 'react';
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
import { supabase } from '@/lib/supabase/client';

interface ProfileFormProps {
  onSubmit: (data: StudentInfo) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
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

  // Auto-generate username based on name and phone
  React.useEffect(() => {
    const watchName = form.watch('name');
    const watchPhone = form.watch('phone');
    
    if (watchName && watchPhone && watchPhone.length >= 4) {
      const baseName = watchName.split(' ')[0].toLowerCase();
      const lastFourDigits = watchPhone.slice(-4);
      const generatedUsername = `${baseName}${lastFourDigits}`;
      
      // Only update if user hasn't manually changed it
      form.setValue('username', generatedUsername);
    }
  }, [form.watch('name'), form.watch('phone'), form]);
  
  const handleSubmit = async (values: ProfileFormValues) => {
  try {
    // 1. Sign up the user
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
        
        var session = signInData.session;
      } else {
        throw authError;
      }
    } else {
      if (!authData.session) throw new Error("No session after sign up");
      var session = authData.session;
    }

    // 2. Insert profile directly using Supabase client
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone,
        date_of_birth: values.dateOfBirth,
        country_of_citizenship: values.citizenshipCountry,
        country_of_residence: values.residenceCountry,
        first_language: values.firstLanguage,
        test_reason: values.testReason,
        other_reason: values.otherReason,
        estimated_level: values.estimatedLevel,
        preferred_contact: values.preferredContact,
        pronunciation_preference: values.pronunciationPreference,
        promo_code: values.promoCode,
        data_consent: values.dataConsent,
        email_results: values.emailResults,
        role: 'learner'
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(profileError.message);
    }

    console.log("Profile created successfully:", profile);

    // 4. Convert and submit
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

  } catch (err) {
    console.error("Error submitting profile:", err);
    alert(err.message);
  }
};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PersonalInfoSection form={form} countries={countries} languages={languages} />
        <AccountSection form={form} />
        <LearningContextSection form={form} testReasons={testReasons} cefrLevels={cefrLevels} />
        <PreferencesSection form={form} />
        <ConsentSection form={form} />
        
        <Button type="submit" className="w-full bg-assessment-blue hover:bg-assessment-lightBlue">
          Create Profile & Start Assessment
        </Button>
      </form>
    </Form>
  );
};
