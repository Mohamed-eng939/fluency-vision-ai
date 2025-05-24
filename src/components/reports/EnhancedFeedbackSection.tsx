
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BookOpen } from 'lucide-react';

interface EnhancedFeedbackSectionProps {
  scores: Record<string, number>;
  cefrLevel: string;
  name: string;
}

const EnhancedFeedbackSection: React.FC<EnhancedFeedbackSectionProps> = ({ 
  scores, 
  cefrLevel, 
  name 
}) => {
  // Calculate strengths and weaknesses
  const skillsArray = Object.entries(scores).map(([skill, score]) => ({
    skill,
    score: Number(score)
  }));

  const sortedByScore = [...skillsArray].sort((a, b) => b.score - a.score);
  const strengths = sortedByScore.slice(0, 2);
  const weaknesses = sortedByScore.slice(-2);

  // Generate personalized interpretation
  const generateInterpretation = () => {
    const avgScore = skillsArray.reduce((sum, item) => sum + item.score, 0) / skillsArray.length;
    const strongAreas = strengths.map(s => s.skill.toLowerCase()).join(' and ');
    const weakAreas = weaknesses.map(w => w.skill.toLowerCase()).join(' and ');

    return `${name}'s performance indicates a ${cefrLevel} level proficiency with particular strengths in ${strongAreas}. 
    The assessment shows consistent performance across most speaking dimensions, with ${weakAreas} presenting the greatest 
    opportunities for improvement. This profile suggests ${name} can communicate effectively at the ${cefrLevel} level 
    but would benefit from targeted practice in the identified areas to achieve more balanced proficiency.`;
  };

  // Generate recommendations based on weaknesses and CEFR level
  const generateRecommendations = () => {
    const recommendations: Record<string, string[]> = {
      'fluency': [
        'Practice speaking for 15 minutes daily without stopping',
        'Record yourself telling stories and listen for hesitations',
        'Join conversation groups to practice spontaneous speech'
      ],
      'grammar': [
        'Focus on verb tense consistency in connected speech',
        'Practice complex sentence structures through shadowing exercises',
        'Use grammar-checking tools when writing to internalize patterns'
      ],
      'vocabulary': [
        'Learn 10 new topic-specific words weekly and use them in speech',
        'Read extensively in your areas of interest',
        'Practice using synonyms and varied expressions for common concepts'
      ],
      'pronunciation': [
        'Work with minimal pairs to distinguish similar sounds',
        'Practice word and sentence stress patterns daily',
        'Use pronunciation apps with feedback features'
      ],
      'prosody': [
        'Listen to and mimic native speaker intonation patterns',
        'Practice emotional expression through speech',
        'Focus on rhythm and stress in connected speech'
      ],
      'coherence': [
        'Practice using linking words and transition phrases',
        'Plan speech with clear beginning, middle, and end',
        'Record explanations of complex topics and review for clarity'
      ],
      'structure': [
        'Practice organizing ideas before speaking',
        'Learn discourse markers for different speech functions',
        'Study speech patterns for presentations and discussions'
      ]
    };

    return weaknesses.map(weakness => ({
      skill: weakness.skill,
      tips: recommendations[weakness.skill.toLowerCase()] || [
        'Focus on regular practice and exposure to authentic materials',
        'Seek feedback from native speakers or qualified teachers',
        'Use targeted exercises specific to this skill area'
      ]
    }));
  };

  const interpretation = generateInterpretation();
  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
          <CardDescription>Personalized interpretation of your assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg print:bg-gray-50 mb-6">
            <p className="text-gray-700 leading-relaxed text-base">
              {interpretation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg print:bg-gray-50">
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Your Strengths
              </h4>
              <div className="space-y-2">
                {strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{strength.skill}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {strength.score}%
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-600 mt-3">
                Continue leveraging these strengths while developing other areas.
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg print:bg-gray-50">
              <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Areas for Growth
              </h4>
              <div className="space-y-2">
                {weaknesses.map((weakness, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{weakness.skill}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {weakness.score}%
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-orange-600 mt-3">
                Focus your practice efforts on these key areas for improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Personalized Learning Recommendations
          </CardTitle>
          <CardDescription>Targeted practice suggestions based on your assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-4 border-assessment-teal pl-4 py-2">
                <h4 className="font-medium text-lg mb-3 text-assessment-blue">
                  Improve your {rec.skill}
                </h4>
                <div className="space-y-2">
                  {rec.tips.map((tip, tipIdx) => (
                    <div key={tipIdx} className="flex items-start gap-3">
                      <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full text-xs font-bold min-w-[20px] h-5 flex items-center justify-center mt-0.5">
                        {tipIdx + 1}
                      </span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg print:bg-gray-50">
              <h4 className="font-semibold text-assessment-blue mb-2">Next Steps for {cefrLevel} Level</h4>
              <p className="text-sm text-gray-700">
                To progress from {cefrLevel} to the next level, focus on consistent daily practice 
                incorporating the recommendations above. Consider joining speaking clubs, finding a 
                language exchange partner, and seeking regular feedback from qualified instructors. 
                Track your progress with periodic self-assessments and celebrate improvements in your 
                target areas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFeedbackSection;
