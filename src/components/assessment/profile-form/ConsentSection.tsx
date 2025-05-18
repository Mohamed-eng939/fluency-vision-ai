
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';

interface ConsentSectionProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ConsentSection: React.FC<ConsentSectionProps> = ({ form }) => {
  const watchEmailResults = form.watch('emailResults');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-assessment-blue border-b pb-2 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-red-500" /> Consent & Follow-Up
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="dataConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to have my audio responses used anonymously to improve the LinguaSpeak AI system.
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="emailResults"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Email me my results when they are ready.
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        {watchEmailResults && (
          <div className="bg-green-50 p-3 rounded-md text-green-700 text-sm">
            Results will be sent to: {form.watch('email')}
          </div>
        )}
      </div>
    </div>
  );
};
