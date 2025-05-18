
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { generateUniqueId } from '@/utils/assessmentUtils';

const studentInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  institution: z.string().optional()
});

type StudentInfoFormValues = z.infer<typeof studentInfoSchema>;

interface StudentInfoFormProps {
  onComplete: (studentInfo: {
    name: string;
    email?: string;
    institution?: string;
    sessionId: string;
  }) => void;
  isFullAssessment?: boolean;
}

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ 
  onComplete,
  isFullAssessment = false 
}) => {
  const { toast } = useToast();
  const [sessionId] = useState(() => generateUniqueId(isFullAssessment ? 'F' : 'Q'));
  
  const form = useForm<StudentInfoFormValues>({
    resolver: zodResolver(studentInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      institution: ''
    }
  });
  
  const onSubmit = (data: StudentInfoFormValues) => {
    onComplete({
      ...data,
      sessionId
    });
    
    toast({
      title: "Information Saved",
      description: "Your assessment will begin now."
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-assessment-blue">
          {isFullAssessment ? 'Full Assessment' : 'Quick Assessment'} Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your name" 
                      {...field}
                      autoFocus
                    />
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
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution/Organization (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your school or organization" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">
                Your unique session ID: <span className="font-mono">{sessionId}</span>
              </p>
              <p className="text-xs text-gray-500">
                This ID will be associated with your assessment results
              </p>
            </div>
            
            <Button type="submit" className="w-full mt-4 bg-assessment-teal hover:bg-assessment-lightBlue text-white">
              Start Assessment
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-gray-500">
          Your data is kept secure and only used for assessment purposes
        </p>
      </CardFooter>
    </Card>
  );
};

export default StudentInfoForm;
