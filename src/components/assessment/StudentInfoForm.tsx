
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateUniqueId } from '@/utils/assessmentUtils';

interface StudentInfo {
  name: string;
  email?: string;
  institution?: string;
  sessionId: string;
}

interface StudentInfoFormProps {
  onComplete: (info: StudentInfo) => void;
  isFullAssessment?: boolean;
}

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ 
  onComplete,
  isFullAssessment = false 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return; // Don't submit if name is empty
    }
    
    // Generate a unique session ID with prefix Q for Quick or F for Full assessment
    const prefix = isFullAssessment ? 'F' : 'Q';
    const sessionId = generateUniqueId(prefix);
    
    onComplete({
      name,
      email: email || undefined,
      institution: institution || undefined,
      sessionId
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input
              id="institution"
              placeholder="School or institution name"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-assessment-teal hover:bg-assessment-lightBlue"
              disabled={!name.trim()}
            >
              Start Assessment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentInfoForm;
