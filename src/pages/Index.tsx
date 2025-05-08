
import React, { useState } from 'react';
import Header from '../components/Header';
import PromptSection from '../components/PromptSection';
import RecordingSection from '../components/RecordingSection';
import AssessmentReport from '../components/AssessmentReport';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import { AssessmentResult, SpeakingPrompt } from '../types/assessment';
import { analyzeAudio } from '../utils/assessmentUtils';

const Index = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    setSelectedPrompt(prompt);
    setAssessmentResult(null);
    setAudioBlob(null);
    setShowIntro(false);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    toast({
      title: "Recording completed",
      description: "Your response has been recorded. You can now analyze it or re-record.",
    });
  };

  const handleAnalyze = async () => {
    if (!audioBlob) {
      toast({
        title: "No recording found",
        description: "Please record your response before analyzing.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeAudio(audioBlob);
      setAssessmentResult(result);
      toast({
        title: "Analysis complete",
        description: `Your speech has been analyzed with CEFR level ${result.cefrLevel}.`,
      });
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your speech. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setAssessmentResult(null);
    setAudioBlob(null);
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="assessment-container py-6">
        {showIntro ? (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-assessment-blue mb-4">Welcome to FluencyVision AI</h2>
            <p className="mb-4">
              This tool evaluates your spoken language proficiency across multiple dimensions:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {['Fluency', 'Grammar', 'Pronunciation', 'Prosody', 'Vocabulary', 'Syntax', 'Coherence'].map((metric) => (
                <div key={metric} className="bg-assessment-blue/5 p-3 rounded-lg">
                  <h3 className="font-semibold text-assessment-blue">{metric}</h3>
                  <p className="text-sm text-gray-600">
                    {getMetricDescription(metric)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button
                className="bg-assessment-teal hover:bg-assessment-lightBlue text-white px-8"
                onClick={() => setShowIntro(false)}
              >
                Start Assessment
              </Button>
            </div>
          </div>
        ) : (
          <>
            <PromptSection 
              onPromptSelect={handlePromptSelect} 
              selectedPrompt={selectedPrompt} 
            />
            
            <RecordingSection 
              prompt={selectedPrompt} 
              onRecordingComplete={handleRecordingComplete} 
            />
            
            {audioBlob && !assessmentResult && !isAnalyzing && (
              <Card className="p-4 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div>
                    <p className="font-medium text-assessment-blue">Recording complete</p>
                    <p className="text-sm text-gray-500">Ready for analysis</p>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                    >
                      Start Over
                    </Button>
                    <Button 
                      className="bg-assessment-teal hover:bg-assessment-lightBlue text-white"
                      onClick={handleAnalyze}
                    >
                      Analyze Speech
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            <AssessmentReport 
              result={assessmentResult} 
              isLoading={isAnalyzing} 
            />
            
            {assessmentResult && (
              <div className="text-center mb-8">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                >
                  Start New Assessment
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="bg-assessment-blue text-white py-4 mt-12">
        <div className="assessment-container text-center">
          <p className="text-sm">
            FluencyVision AI - Advanced Language Proficiency Assessment Tool
          </p>
          <p className="text-xs opacity-75 mt-1">
            Powered by AI speech analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

const getMetricDescription = (metric: string): string => {
  switch (metric) {
    case 'Fluency':
      return 'Rate and ease of speech, pauses, fillers';
    case 'Grammar':
      return 'Correct sentence structure and grammar rules';
    case 'Pronunciation':
      return 'Accurate sounds, word stress and articulation';
    case 'Prosody':
      return 'Rhythm, intonation and stress patterns';
    case 'Vocabulary':
      return 'Word choice, range and appropriateness';
    case 'Syntax':
      return 'Sentence structure complexity and variation';
    case 'Coherence':
      return 'Logical flow and topic relevance';
    default:
      return '';
  }
};

export default Index;
