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
import { supabase } from '@/lib/supabase/client';

export const ProfileForm: React.FC = () => {
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
  const [toast, setToast] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setToast(null);

    try {
      // 1️⃣ Sign up or Sign in
      let session;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name, phone: values.phone } },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
          if (signInError) throw signInError;
          session = signInData.session;
        } else {
          throw signUpError;
        }
      } else {
        session = signUpData?.session;
      }

      if (!session) throw new Error('No active session found');

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

      if (dbError) throw dbError;

      setToast({ type: 'success', message: '✅ Profile created and saved successfully!' });
      form.reset();
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 relative">
        <PersonalInfoSection form={form} countries={countries} languages={languages} />
        <AccountSection form={form} />
        <LearningContextSection form={form} testReasons={testReasons} cefrLevels={cefrLevels} />
        <PreferencesSection form={form} />
        <ConsentSection form={form} />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-assessment-blue hover:bg-assessment-lightBlue"
        >
          {loading ? 'Savingيااارب...' : 'Create Profile & Start Assessment'}
        </Button>

        {/* Toast Message */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 px-4 py-3 rounded-md shadow-md text-white font-medium ${
              toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {toast.message}
          </div>
        )}
      </form>
    </Form>
  );
};
