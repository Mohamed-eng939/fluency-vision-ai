
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

    // Get the Supabase auth session token
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error("Not authenticated");
    }

    // Send request to the edge function
    const res = await fetch(
      "https://rrslhxigqtfllunmowcy.supabase.co/functions/v1/profile-manager",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Profile submission failed");
    }

    console.log("Profile saved successfully:", result);
    // Optionally trigger onSubmit to parent
    onSubmit(values);

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
