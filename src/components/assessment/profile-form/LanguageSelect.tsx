
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

interface LanguageSelectProps {
  form: UseFormReturn<ProfileFormValues>;
  languages: string[];
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  form,
  languages
}) => {
  return (
    <FormField
      control={form.control}
      name="firstLanguage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>First Language <span className="text-red-500">*</span></FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[200px]">
              {languages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
