
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AssessmentOptionsProps {
  onSelectQuickAssessment: () => void;
  onSelectFullAssessment: () => void;
  showFullAssessmentIntro: boolean;
}

const AssessmentOptions: React.FC<AssessmentOptionsProps> = ({
  onSelectQuickAssessment,
  onSelectFullAssessment,
  showFullAssessmentIntro
}) => {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-assessment-blue">Assessment Options</h2>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-assessment-blue/5">
            <h3 className="font-medium mb-2">Quick Assessment</h3>
            <p className="text-sm text-gray-600 mb-3">
              A 2-minute speaking task to quickly evaluate your speaking abilities.
            </p>
            <Button 
              variant={!showFullAssessmentIntro ? "default" : "outline"}
              className="w-full"
              onClick={onSelectQuickAssessment}
            >
              Take Quick Assessment
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg bg-assessment-teal/5">
            <h3 className="font-medium mb-2">Full Assessment</h3>
            <p className="text-sm text-gray-600 mb-3">
              A comprehensive evaluation of all language skills (reading, writing, listening, speaking).
            </p>
            <Button 
              onClick={onSelectFullAssessment}
              className="w-full bg-assessment-teal hover:bg-assessment-lightBlue text-white"
            >
              Take Full Assessment
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Why take an assessment?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Discover your current language proficiency level</li>
            <li>• Identify your strengths and areas for improvement</li>
            <li>• Get personalized learning recommendations</li>
            <li>• Track your progress over time with regular assessments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentOptions;
