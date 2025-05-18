
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Mail } from 'lucide-react';

interface ProcessingStepProps {
  hasEmail: boolean;
  email?: string;
  onBypassProcessing?: () => void;
  isAdmin?: boolean;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  hasEmail,
  email,
  onBypassProcessing,
  isAdmin = false
}) => {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-assessment-blue">Thank You!</h2>
        <p className="text-gray-600">Your responses are being analyzed</p>
      </CardHeader>
      
      <CardContent className="space-y-8 py-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-assessment-blue/10 flex items-center justify-center">
            {hasEmail ? (
              <Mail className="h-8 w-8 text-assessment-blue" />
            ) : (
              <Clock className="h-8 w-8 text-assessment-blue" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Thanks for completing the Quick Assessment</h3>
            <p className="text-gray-600">
              {hasEmail ? (
                <>
                  You'll receive your results by email at <span className="font-medium">{email}</span> within 15 minutes.
                </>
              ) : (
                <>
                  Your responses are being analyzed. Your results will be available shortly.
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Our system is analyzing your responses to provide you with accurate feedback on your speaking skills.
          </p>
          
          {isAdmin && onBypassProcessing && (
            <div className="pt-4">
              <button 
                onClick={onBypassProcessing}
                className="text-xs text-assessment-blue hover:underline"
              >
                [Admin: Bypass Processing Delay]
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStep;
