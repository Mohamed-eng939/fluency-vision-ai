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
    const watchName = form.watch('name');
    const watchPhone = form.watch('phone');
    if (watchName && watchPhone && watchPhone.length >= 4) {
      const baseName = watchName.split(' ')[0].toLowerCase();
      const lastFourDigits = watchPhone.slice(-4);
      const generatedUsername = `${baseName}${lastFourDigits}`;
      form.setValue('username', generatedUsername);
    }
  }, [form.watch('name'), form.watch('phone'), form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.name, phone: values.phone } }
      });

      let session = authData?.session;

      if (authError) {
        if (authError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: values.email,
              password: values.password
            });
          if (signInError) throw signInError;
          session = signInData.session;
        } else {
          throw authError;
        }
      }

      if (!session) throw new Error("No active session after sign up/sign in");

      console.log("🟢 Token:", session.access_token);

      // 2. Prepare payload
      const payload = {
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
      };

      // 3. Call Edge Function
      const res = await fetch(
        `https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/profile-manager`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Profile submission failed");
      }

      const result = await res.json();
      console.log("✅ Profile saved:", result);

      // 4. Pass to parent
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

    } catch (err: any) {
      console.error("🔥 Error submitting profile:", err);
      setErrorMsg(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
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

        {errorMsg && (
          <div className="p-3 mt-2 rounded-md bg-red-100 text-red-700 border border-red-300">
            ❌ {errorMsg}
          </div>
        )}

        <Button
  type="submit"
  disabled={loading}
  className={`w-full ${
    errorMsg
      ? "bg-red-600 hover:bg-red-700"
      : "bg-assessment-blue hover:bg-assessment-lightBlue"
  }`}
>
  {loading
    ? "Saving..."
    : errorMsg
    ? `❌ ${errorMsg}`
    : "Create Profile & Start Assessment"}
</Button>

      </form>
    </Form>
  );
};
