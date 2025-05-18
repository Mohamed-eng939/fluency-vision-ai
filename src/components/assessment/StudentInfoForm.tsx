
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateUniqueId } from '@/utils/assessmentUtils';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface StudentInfo {
  name: string;
  email?: string;
  institution?: string;
  sessionId: string;
  countryCode: string;
  phoneNumber: string;
}

interface StudentInfoFormProps {
  onComplete: (info: StudentInfo) => void;
  isFullAssessment?: boolean;
}

// Define the validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email").or(z.string().length(0)),
  institution: z.string().optional(),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
});

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ 
  onComplete,
  isFullAssessment = false 
}) => {
  const { toast } = useToast();
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      institution: "",
      countryCode: "+1",
      phoneNumber: ""
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Generate a unique session ID with prefix Q for Quick or F for Full assessment
    const prefix = isFullAssessment ? 'F' : 'Q';
    const sessionId = generateUniqueId(prefix);
    
    onComplete({
      name: values.name,
      email: values.email || undefined,
      institution: values.institution || undefined,
      sessionId,
      countryCode: values.countryCode,
      phoneNumber: values.phoneNumber
    });
    
    // Show success toast
    toast({
      title: "Registration successful",
      description: "Your assessment will begin shortly",
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-assessment-blue text-xl">
          {isFullAssessment ? 'Full Assessment Registration' : 'Quick Assessment Registration'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem className="space-y-2">
              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        placeholder="+1"
                        className="w-24"
                        {...field}
                      />
                    </FormControl>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormControl>
                      <Input
                        placeholder="Phone number"
                        className="flex-1"
                        {...field}
                      />
                    </FormControl>
                  )}
                />
              </div>
              {(form.formState.errors.countryCode || form.formState.errors.phoneNumber) && (
                <div className="flex items-center text-sm text-destructive mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>
                    {form.formState.errors.countryCode?.message || form.formState.errors.phoneNumber?.message}
                  </span>
                </div>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="School or institution name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-assessment-teal hover:bg-assessment-lightBlue"
              >
                Start Assessment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StudentInfoForm;
