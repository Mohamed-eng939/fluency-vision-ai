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
import { supabase } from '@/lib/supabase/client';

interface ProfileFormProps {
  onSubmit: (data: StudentInfo) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Auto-generate username
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.name && values.phone && values.phone.length >= 4) {
        const baseName = values.name.split(' ')[0].toLowerCase();
        const lastFour = values.phone.slice(-4);
        form.setValue('username', `${baseName}${lastFour}`, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated. Please log in first.");
      }
      const user = sessionData.session.user;

      // 2. Prepare profile payload
      const payload = {
        id: user.id, // link to auth user
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone,
        date_of_birth: values.dateOfBirth ?? null,
        country_of_citizenship: values.citizenshipCountry ?? null,
        country_of_residence: values.residenceCountry ?? null,
        first_language: values.firstLanguage ?? null,
        test_reason: values.testReason ?? null,
        other_reason: values.otherReason ?? null,
        estimated_level: values.estimatedLevel ?? null,
        preferred_contact: values.preferredContact ?? 'email',
        pronunciation_preference: values.pronunciationPreference ?? 'neutral',
        promo_code: values.promoCode ?? null,
        data_consent: values.dataConsent,
        email_results: values.emailResults,
        updated_at: new Date().toISOString(),
      };

      // 3. Insert or update profile
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;

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
      console.error("Error submitting profile:", err);
      setErrorMsg(err.message);
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

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-assessment-blue hover:bg-assessment-lightBlue"
        >
          {loading ? "Saving Profile..." : "Create Profile & Start Assessment"}
        </Button>
      </form>
    </Form>
  );
};
