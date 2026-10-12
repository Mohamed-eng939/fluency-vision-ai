
import React from 'react';
import { User } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';
import { BasicInfoFields } from './BasicInfoFields';
import { DateOfBirthField } from './DateOfBirthField';
import { CountrySelect } from './CountrySelect';
import { LanguageSelect } from './LanguageSelect';
import { useLanguage } from '@/contexts/language/LanguageContext';

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  countries: string[];
  languages: string[];
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  form,
  countries,
  languages
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-assessment-blue border-b pb-2 flex items-center gap-2">
        <User className="h-5 w-5 text-green-500" /> {t('Personal Information', 'المعلومات الشخصية')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BasicInfoFields form={form} />

        <DateOfBirthField form={form} />

        <CountrySelect
          form={form}
          name="citizenshipCountry"
          label={t('Country of Citizenship', 'بلد الجنسية')}
          placeholder={t('Select country', 'اختر البلد')}
          countries={countries}
        />

        <CountrySelect
          form={form}
          name="residenceCountry"
          label={t('Country of Residence', 'بلد الإقامة')}
          placeholder={t('Select country', 'اختر البلد')}
          countries={countries}
        />
        
        <LanguageSelect form={form} languages={languages} />
      </div>
    </div>
  );
};
