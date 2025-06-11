
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Mic, FileText, BarChart } from 'lucide-react';

interface ProcessingResultsProps {
  current: number;
  total: number;
  isProcessing: boolean;
}

const ProcessingResults: React.FC<ProcessingResultsProps> = ({
  current,
  total,
  isProcessing
}) => {
  const progress = total > 0 ? (current / total) * 100 : 0;
  
  const processingSteps = [
    { icon: Mic, label: "Analyzing audio quality", step: 1 },
    { icon: FileText, label: "Processing transcripts", step: 2 },
    { icon: Brain, label: "Evaluating language skills", step: 3 },
    { icon: BarChart, label: "Generating final report", step: 4 }
  ];
  
  const currentStepIndex = Math.floor((current / total) * processingSteps.length);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-assessment-blue animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-assessment-blue">Processing Your Assessment</h2>
          <p className="text-gray-600">
            Analyzing your responses to generate comprehensive results...
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing response {current} of {total}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Processing steps */}
          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;
              
              return (
                <div 
                  key={step.step}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    isCompleted ? 'bg-green-50 text-green-700' :
                    isCurrent ? 'bg-blue-50 text-assessment-blue' :
                    'bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCompleted ? 'bg-green-100' :
                    isCurrent ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isCurrent ? 'animate-pulse' : ''
                    }`} />
                  </div>
                  <span className="font-medium">{step.label}</span>
                  {isCompleted && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Estimated time */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>This usually takes 30-60 seconds per response</p>
            <p>Please don't close this window while processing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingResults;
