
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';
import { useLanguage } from '@/contexts/language/LanguageContext';

interface DateOfBirthFieldProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({ form }) => {
  const { t } = useLanguage();
  // Generate years from 1924 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1923 }, (_, i) => currentYear - i);

  // Generate months
  const months = [
    { value: 0, label: t('January', 'يناير') },
    { value: 1, label: t('February', 'فبراير') },
    { value: 2, label: t('March', 'مارس') },
    { value: 3, label: t('April', 'أبريل') },
    { value: 4, label: t('May', 'مايو') },
    { value: 5, label: t('June', 'يونيو') },
    { value: 6, label: t('July', 'يوليو') },
    { value: 7, label: t('August', 'أغسطس') },
    { value: 8, label: t('September', 'سبتمبر') },
    { value: 9, label: t('October', 'أكتوبر') },
    { value: 10, label: t('November', 'نوفمبر') },
    { value: 11, label: t('December', 'ديسمبر') },
  ];

  return (
    <FormField
      control={form.control}
      name="dateOfBirth"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{t('Date of Birth', 'تاريخ الميلاد')} <span className="text-red-500">*</span></FormLabel>
          <div className="flex gap-2">
            <Select
              value={field.value ? field.value.getMonth().toString() : ''}
              onValueChange={(value) => {
                const currentDate = field.value || new Date();
                const newDate = new Date(currentDate.getFullYear(), parseInt(value), currentDate.getDate());
                field.onChange(newDate);
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('Month', 'الشهر')} />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={field.value ? field.value.getDate().toString() : ''}
              onValueChange={(value) => {
                const currentDate = field.value || new Date();
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(value));
                field.onChange(newDate);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={t('Day', 'اليوم')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={field.value ? field.value.getFullYear().toString() : ''}
              onValueChange={(value) => {
                const currentDate = field.value || new Date();
                const newDate = new Date(parseInt(value), currentDate.getMonth(), currentDate.getDate());
                field.onChange(newDate);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder={t('Year', 'السنة')} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
