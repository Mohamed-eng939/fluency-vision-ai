
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface FeedbackSectionProps {
  feedback: string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedback }) => {
  return (
    <Card className="shadow-lg print:shadow-none">
      <CardHeader>
        <CardTitle className="text-assessment-blue">Assessment Feedback & Recommendations</CardTitle>
        <CardDescription>Personalized insights for improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg print:bg-gray-50">
          <p className="text-gray-700 leading-relaxed text-base">
            {feedback}
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg print:bg-gray-50">
            <h4 className="font-semibold text-assessment-blue mb-2">Strengths</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Clear pronunciation and articulation</li>
              <li>• Good vocabulary range for level</li>
              <li>• Coherent idea development</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg print:bg-gray-50">
            <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complex sentence structures</li>
              <li>• Grammatical accuracy</li>
              <li>• Advanced vocabulary usage</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackSection;
