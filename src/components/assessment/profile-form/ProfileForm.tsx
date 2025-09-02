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
import { toast } from 'sonner';

interface ProfileFormProps {
  onSubmit: (data: StudentInfo) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
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

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Auto-generate username
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'name' || name === 'phone') && value.name && value.phone?.length >= 4) {
        const baseName = value.name.split(' ')[0].toLowerCase();
        const lastFour = value.phone.slice(-4);
        form.setValue('username', `${baseName}${lastFour}`);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset error after timeout
  React.useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1️⃣ Try to sign up first
      let session;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name, phone: values.phone } },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          // User exists, try to sign in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
          if (signInError) {
            if (signInError.message.includes('Invalid login credentials')) {
              throw new Error('Email already registered with different password');
            }
            throw signInError;
          }
          session = signInData.session;
        } else if (signUpError.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account');
        } else {
          throw signUpError;
        }
      } else {
        session = signUpData?.session;
      }

      if (!session) throw new Error('Authentication failed');

      const userId = session.user.id;

      // 2️⃣ Save profile to "profiles" table
      const { error: dbError } = await supabase.from('profiles').upsert([
        {
          id: userId,
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
        },
      ]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // 3️⃣ Convert to StudentInfo and submit
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

      toast.success('Profile created successfully!');
      onSubmit(studentInfoData);

    } catch (err: any) {
      console.error('Profile submission error:', err);
      const errorMessage = err.message || 'Unexpected error occurred';
      setErrorMsg(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Saving...';
    if (errorMsg) return `Error: ${errorMsg}`;
    return 'Create Profile & Start Assessment';
  };

  const getButtonStyle = () => {
    if (errorMsg) return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground';
    return 'bg-primary hover:bg-primary/90 text-primary-foreground';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <PersonalInfoSection form={form} countries={countries} languages={languages} />
        <AccountSection form={form} />
        <LearningContextSection form={form} testReasons={testReasons} cefrLevels={cefrLevels} />
        <PreferencesSection form={form} />
        <ConsentSection form={form} />

        <Button
          type="submit"
          disabled={loading}
          className={`w-full ${getButtonStyle()}`}
        >
          {getButtonText()}
        </Button>
      </form>
    </Form>
  );
};