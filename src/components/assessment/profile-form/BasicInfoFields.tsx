import React from 'react';
import { Mail, Phone } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';
import { useLanguage } from '@/contexts/language/LanguageContext';

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form }) => {
  const { t } = useLanguage();
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('Full Name', 'الاسم الكامل')} <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder={t('Enter your full name', 'أدخل اسمك الكامل')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('Email Address', 'البريد الإلكتروني')} <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="your.email@example.com" className="pl-8" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('Phone Number', 'رقم الهاتف')} <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="+20 123-456-7890" className="pl-8" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
