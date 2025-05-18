
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
  countryCode: string;
  phoneNumber: string;
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
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !countryCode.trim() || !phoneNumber.trim()) {
      return; // Don't submit if required fields are empty
    }
    
    // Generate a unique session ID with prefix Q for Quick or F for Full assessment
    const prefix = isFullAssessment ? 'F' : 'Q';
    const sessionId = generateUniqueId(prefix);
    
    onComplete({
      name,
      email: email || undefined,
      institution: institution || undefined,
      sessionId,
      countryCode,
      phoneNumber
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
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input
                id="countryCode"
                placeholder="+1"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24"
                required
              />
              <Input
                id="phoneNumber"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                required
              />
            </div>
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
              disabled={!name.trim() || !countryCode.trim() || !phoneNumber.trim()}
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
