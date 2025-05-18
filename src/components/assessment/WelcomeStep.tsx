
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-assessment-blue">Quick Assessment</h2>
        <p className="text-gray-600">Welcome to your speaking test</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Overview</h3>
            <p className="text-gray-700">
              You will answer a short series of spoken questions designed to estimate your CEFR level.
              The questions will adapt to your ability level.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>You'll be presented with one speaking prompt at a time</li>
              <li>Speak naturally in response to each prompt</li>
              <li>The test adapts based on your performance</li>
              <li>Most learners complete 4-10 questions</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Tips for best results</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Speak clearly at a normal pace</li>
              <li>Use a quiet environment with minimal background noise</li>
              <li>Answer the questions thoroughly but concisely</li>
              <li>You may be asked to talk about yourself, your experiences, and your opinions</li>
              <li>There are no right or wrong answers - just speak naturally</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4">
          <Button className="w-full" onClick={onStart}>
            Start Test <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground">
        <p className="w-full">
          Your responses will be analyzed by our AI assessment system to estimate your English speaking proficiency level.
        </p>
      </CardFooter>
    </Card>
  );
};

export default WelcomeStep;
