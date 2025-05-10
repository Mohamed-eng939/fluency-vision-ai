
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AssessmentResult } from '../types/assessment';
import { Progress } from './ui/progress';
import { AudioWaveform, MoveRight, Lightbulb } from 'lucide-react';

interface DetailedFeedbackProps {
  result: AssessmentResult;
  detailedFeedback?: Record<string, string> | null;
}

const DetailedFeedback: React.FC<DetailedFeedbackProps> = ({ 
  result,
  detailedFeedback
}) => {
  const { metrics, cefrLevel, feedback, transcript } = result;

  // Organize feedback into categories
  const categories = [
    { name: 'Fluency', value: metrics.fluency, feedback: feedback.fluency, color: 'bg-blue-500' },
    { name: 'Pronunciation', value: metrics.pronunciation, feedback: feedback.pronunciation, color: 'bg-green-500' },
    { name: 'Vocabulary', value: metrics.vocabulary, feedback: feedback.vocabulary, color: 'bg-purple-500' },
    { name: 'Grammar', value: metrics.grammar, feedback: feedback.grammar, color: 'bg-amber-500' },
    { name: 'Coherence', value: metrics.coherence, feedback: feedback.coherence, color: 'bg-rose-500' }
  ];

  // Calculate normalized scores (0-100)
  const getCategoryScore = (value: number) => Math.round((value / 10) * 100);
  
  // Get advice based on category and score
  const getAdvice = (category: string, score: number): string => {
    if (score <= 60) {
      // Needs improvement
      switch(category) {
        case 'Fluency':
          return 'Practice speaking regularly, even just to yourself. Try recording yourself speaking for 1-2 minutes daily.';
        case 'Pronunciation':
          return 'Listen and repeat native speech. Use apps that provide pronunciation feedback.';
        case 'Vocabulary':
          return 'Learn vocabulary in context through reading and listening. Use flashcards with example sentences.';
        case 'Grammar':
          return 'Focus on one grammar point at a time. Practice by writing short paragraphs using the target structure.';
        case 'Coherence':
          return 'Organize your thoughts before speaking. Practice using connecting words and phrases.';
        default:
          return 'Regular practice will help you improve over time.';
      }
    } else if (score <= 80) {
      // Good but can improve
      switch(category) {
        case 'Fluency':
          return 'Challenge yourself with discussions on complex topics. Join language exchange meetings.';
        case 'Pronunciation':
          return 'Focus on intonation and rhythm patterns. Record yourself reading passages aloud.';
        case 'Vocabulary':
          return 'Expand your vocabulary in specific domains. Learn idiomatic expressions and collocations.';
        case 'Grammar':
          return 'Practice complex sentence structures. Get feedback on your writing from native speakers.';
        case 'Coherence':
          return 'Practice impromptu speaking on various topics. Focus on smooth transitions between ideas.';
        default:
          return 'You\'re doing well! Focus on fine-tuning your skills.';
      }
    } else {
      // Excellent
      return 'You\'re performing excellently in this area. Keep maintaining your skills through regular practice.';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AudioWaveform className="h-5 w-5 text-assessment-teal" />
            Detailed Assessment Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {transcript && (
              <div className="mb-5 p-4 bg-gray-50 rounded-md border text-sm">
                <p className="font-medium text-xs text-gray-500 mb-1">Your transcript:</p>
                <p className="italic">{transcript}</p>
              </div>
            )}
            
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-sm font-medium">
                    {getCategoryScore(category.value)}%
                  </div>
                </div>
                <Progress 
                  value={getCategoryScore(category.value)} 
                  className="h-2"
                />
                <div className="p-3 bg-gray-50 rounded-md border-l-4 text-sm space-y-3" style={{ borderLeftColor: category.color.replace('bg-', '#') }}>
                  <p>
                    {detailedFeedback?.[category.name] || category.feedback}
                  </p>
                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Advice:</span>{' '}
                      {getAdvice(category.name, getCategoryScore(category.value))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 bg-assessment-blue/5 p-4 rounded-md">
              <p className="font-medium mb-2">Overall Assessment</p>
              <p className="text-sm mb-3">{feedback.overall}</p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-assessment-blue mt-4">
                <span>CEFR Level: {cefrLevel}</span>
                <MoveRight className="h-4 w-4" />
                <a href="#" className="underline">
                  Learn about CEFR levels
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2 items-start">
              <span className="bg-assessment-teal/20 text-assessment-teal p-1 rounded-full flex items-center justify-center h-5 w-5 mt-0.5 flex-shrink-0">1</span>
              <span>
                <strong>Focus on {getWeakestCategory(metrics).name}:</strong> This is your area for greatest improvement.
                Try our targeted {getWeakestCategory(metrics).name.toLowerCase()} exercises to build this skill.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="bg-assessment-teal/20 text-assessment-teal p-1 rounded-full flex items-center justify-center h-5 w-5 mt-0.5 flex-shrink-0">2</span>
              <span>
                <strong>Practice regularly:</strong> Set aside 15-20 minutes daily for targeted practice.
                Consistency is more important than long, infrequent sessions.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="bg-assessment-teal/20 text-assessment-teal p-1 rounded-full flex items-center justify-center h-5 w-5 mt-0.5 flex-shrink-0">3</span>
              <span>
                <strong>Take a {cefrLevel} level course:</strong> Based on your assessment, we recommend
                materials at the {cefrLevel} level to continue your progress.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to find the weakest category
function getWeakestCategory(metrics: any) {
  const categories = [
    { name: 'Fluency', value: metrics.fluency },
    { name: 'Pronunciation', value: metrics.pronunciation },
    { name: 'Vocabulary', value: metrics.vocabulary },
    { name: 'Grammar', value: metrics.grammar },
    { name: 'Coherence', value: metrics.coherence }
  ];
  
  return categories.reduce((prev, current) => 
    prev.value < current.value ? prev : current
  );
}

export default DetailedFeedback;
