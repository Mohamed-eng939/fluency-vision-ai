
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, FileText, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AssessmentOptionsProps {
  onSelectQuickAssessment: () => void;
}

const AssessmentOptions: React.FC<AssessmentOptionsProps> = ({
  onSelectQuickAssessment
}) => {
  const [showFullAssessmentDialog, setShowFullAssessmentDialog] = useState(false);

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-assessment-blue text-center">Choose Your Assessment Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center p-6 border rounded-lg bg-assessment-blue/5 hover:bg-assessment-blue/10 transition-colors">
            <Zap className="h-24 w-24 text-assessment-blue mb-4" />
            <h3 className="font-medium text-xl mb-3 text-center">Quick Assessment</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              A 2-minute speaking task to quickly evaluate your speaking abilities.
            </p>
            <Button 
              className="w-full mt-auto"
              onClick={onSelectQuickAssessment}
            >
              Create Profile
            </Button>
          </div>
          
          <div className="flex flex-col items-center p-6 border rounded-lg bg-assessment-teal/5 hover:bg-assessment-teal/10 transition-colors">
            <div className="relative">
              <FileText className="h-24 w-24 text-gray-400 mb-4" />
              <div className="absolute -right-2 -top-2 bg-assessment-teal text-white p-1 rounded-full">
                <Lock className="h-5 w-5" />
              </div>
            </div>
            <h3 className="font-medium text-xl mb-3 text-center">Full Assessment</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              A comprehensive evaluation of all language skills (reading, writing, listening, speaking).
            </p>
            <Button 
              onClick={() => setShowFullAssessmentDialog(true)}
              className="w-full mt-auto bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Why take an assessment?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Discover your current language proficiency level</li>
            <li>• Identify your strengths and areas for improvement</li>
            <li>• Get personalized learning recommendations</li>
            <li>• Track your progress over time with regular assessments</li>
          </ul>
        </div>
      </CardContent>
      
      <Dialog open={showFullAssessmentDialog} onOpenChange={setShowFullAssessmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full Assessment Coming Soon</DialogTitle>
            <DialogDescription>
              We're currently developing our comprehensive Full Assessment feature. 
              This will include reading, writing, listening, and extended speaking sections. 
              Please check back soon or try our Quick Assessment in the meantime.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowFullAssessmentDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AssessmentOptions;
