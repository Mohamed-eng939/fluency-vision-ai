
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
    // Build the payload based on your API's expected fields
    const payload = {
      name: values.name,
      username: values.username,
      email: values.email,
      phone_number: values.phone,
      date_of_birth: values.dateOfBirth,
      country_of_citizenship: values.citizenshipCountry,
      country_of_residence: values.residenceCountry,
      firstLanguage: values.firstLanguage,
      testReason: values.testReason,
      otherReason: values.otherReason,
      estimatedLevel: values.estimatedLevel,
      preferredContact: values.preferredContact,
      pronunciationPreference: values.pronunciationPreference,
      promoCode: values.promoCode,
      dataConsent: values.dataConsent,
    };

   

    // Sign in to get access token
const { data, error } = await supabase.auth.signInWithPassword({
  email: '1khaledmohamedmagdy@gmail.com',
  password: '12345678'
});

if (error) {
  throw new Error(`Sign-in failed: ${error.message}`);
}

if (!data?.session) {
  throw new Error("No session returned from Supabase");
}

const accessToken = data.session.access_token;

// Call the Edge Function
const res = await fetch(`https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/profile-manager`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyc2xoeGlncXRmbGx1bm1vd2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjQ0NSwiZXhwIjoyMDY2NTI4NDQ1fQ.N7ivuDinyFic2yeFPm3x8HFtyuNirbTBzu8GE7t-Nb0`
  },
  body: JSON.stringify(payload)
});

const result = await res.json();

if (!res.ok) {
  throw new Error(result.error || "Profile submission failed");
}

console.log("Profile saved successfully:", result);

// Convert ProfileFormValues to StudentInfo
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
