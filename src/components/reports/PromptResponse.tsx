
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PromptResponseProps {
  prompt: string;
  transcript: string;
}

const PromptResponse: React.FC<PromptResponseProps> = ({ prompt, transcript }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Assessment Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 italic bg-blue-50 p-4 rounded-lg print:bg-gray-50">
            "{prompt}"
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Candidate Response</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
            {transcript}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptResponse;
