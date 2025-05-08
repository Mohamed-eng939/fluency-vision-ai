
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PromptSection from '@/components/PromptSection';
import RecordingSection from '@/components/RecordingSection';
import AssessmentReport from '@/components/AssessmentReport';
import FullAssessmentIntro from '@/components/FullAssessmentIntro';
import FullAssessment from '@/components/FullAssessment';
import { SpeakingPrompt, AssessmentResult } from '@/types/assessment';
import { analyzeAudio, fullAssessmentTests } from '@/utils/assessmentUtils';
import { useToast } from '@/components/ui/use-toast';

const AssessmentPage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullAssessment, setShowFullAssessment] = useState(false);
  const [showFullAssessmentIntro, setShowFullAssessmentIntro] = useState(false);
  const { toast } = useToast();

  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    setSelectedPrompt(prompt);
    setAssessmentResult(null);
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      // In a real app, this would send the audio to a backend for processing
      const result = await analyzeAudio(audioBlob);
      setAssessmentResult(result);
    } catch (error) {
      console.error("Error processing recording:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartFullAssessment = () => {
    setShowFullAssessmentIntro(false);
    setShowFullAssessment(true);
  };

  const handleFullAssessmentComplete = () => {
    setShowFullAssessment(false);
    toast({
      title: "Assessment Complete",
      description: "Your full assessment has been completed and is being processed.",
    });
    // In a real app, you would process the results here
  };

  const handleFullAssessmentExit = () => {
    setShowFullAssessment(false);
    toast({
      title: "Assessment Saved",
      description: "Your progress has been saved. You can continue later.",
    });
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setAssessmentResult(null);
  };

  if (showFullAssessment) {
    return (
      <FullAssessment 
        assessment={fullAssessmentTests[0]} 
        onComplete={handleFullAssessmentComplete}
        onExit={handleFullAssessmentExit}
      />
    );
  }

  if (showFullAssessmentIntro) {
    return (
      <FullAssessmentIntro 
        assessment={fullAssessmentTests[0]} 
        onStartAssessment={handleStartFullAssessment}
        onClose={() => setShowFullAssessmentIntro(false)}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:max-w-5xl">
      <h1 className="text-3xl font-bold text-assessment-blue mb-6">
        LinguaSpeak AI Assessment
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!assessmentResult ? (
            <>
              <PromptSection 
                onPromptSelect={handlePromptSelect} 
                selectedPrompt={selectedPrompt}
              />
              
              <RecordingSection 
                prompt={selectedPrompt}
                onRecordingComplete={handleRecordingComplete}
              />

              {isProcessing && (
                <Card className="mb-8">
                  <CardContent className="p-8 text-center">
                    <div className="animate-pulse text-assessment-blue">
                      <p className="text-lg font-medium">Processing your recording...</p>
                      <p className="text-sm mt-2 text-gray-600">
                        Our AI is analyzing your speaking skills. This may take a few moments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              <AssessmentReport result={assessmentResult} isLoading={isProcessing} />
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleReset}
                  variant="outline" 
                  className="mr-4"
                >
                  Take Another Quick Assessment
                </Button>
                <Button 
                  onClick={() => setShowFullAssessmentIntro(true)}
                  className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
                >
                  Take Full Assessment
                </Button>
              </div>
            </>
          )}
        </div>
        
        <div className="lg:col-span-1">
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
                    onClick={() => {
                      setShowFullAssessmentIntro(false);
                      setAssessmentResult(null);
                    }}
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
                    onClick={() => setShowFullAssessmentIntro(true)}
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
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
