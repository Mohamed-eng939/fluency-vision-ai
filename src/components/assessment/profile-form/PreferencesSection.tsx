
import React from 'react';
import { Settings } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';
import { useLanguage } from '@/contexts/language/LanguageContext';

interface PreferencesSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({ form }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-assessment-blue border-b pb-2 flex items-center gap-2">
        <Settings className="h-5 w-5 text-amber-500" /> {t('Preferences (Optional)', 'التفضيلات (اختياري)')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="preferredContact"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('Preferred Contact Method', 'طريقة التواصل المفضّلة')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="email" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('Email', 'البريد الإلكتروني')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="whatsapp" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('WhatsApp', 'واتساب')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="phone" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('Phone', 'الهاتف')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pronunciationPreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('Pronunciation Preference', 'تفضيل النطق')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="british" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('British English', 'الإنجليزية البريطانية')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="american" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('American English', 'الإنجليزية الأمريكية')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="neutral" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('Neutral', 'محايدة')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Promo or Partner Code', 'رمز ترويجي أو رمز شريك')}</FormLabel>
              <FormControl>
                <Input placeholder={t('Enter code if you have one', 'أدخل الرمز إن وُجد')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
