
import React from 'react';
import { GraduationCap } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from './types';

interface LearningContextSectionProps {
  form: UseFormReturn<ProfileFormValues>;
  testReasons: { value: string; label: string }[];
  cefrLevels: { value: string; label: string }[];
}

export const LearningContextSection: React.FC<LearningContextSectionProps> = ({
  form,
  testReasons,
  cefrLevels
}) => {
  const watchTestReason = form.watch('testReason');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-assessment-blue border-b pb-2 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-blue-500" /> Learning Context
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="testReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Taking the Test <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {testReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {watchTestReason === 'other' && (
          <FormField
            control={form.control}
            name="otherReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please Specify <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Your reason for taking the test" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="estimatedLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated English Level <span className="text-red-500">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cefrLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
