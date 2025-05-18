
import React from 'react';
import { AssessmentMetrics, CEFRLevel, TestSection } from '@/types/assessment';
import { generateRecommendations } from '@/utils/scoring/recommendationsGenerator';
import { Book, Lightbulb } from 'lucide-react';

interface LearningRecommendationsProps {
  metrics: AssessmentMetrics;
  cefrLevel: CEFRLevel;
  isQuickAssessment: boolean;
  assessmentSections?: TestSection[];
}

const LearningRecommendations: React.FC<LearningRecommendationsProps> = ({
  metrics,
  cefrLevel,
  isQuickAssessment,
  assessmentSections = []
}) => {
  // Generate recommendations for the lowest scoring areas
  const recommendations = generateRecommendations(metrics, 3);
  
  // Helper function to recommend resources based on CEFR level
  const recommendResourcesForLevel = (level: CEFRLevel) => {
    switch (level) {
      case 'C2':
      case 'C1+':
      case 'C1':
        return [
          'Academic journals and research papers',
          'Advanced business communication materials',
          'Complex literary texts and technical documents',
          'Advanced debate and discussion workshops'
        ];
      case 'B2+':
      case 'B2':
        return [
          'Newspaper articles and opinion pieces',
          'Professional development materials',
          'Intermediate to advanced podcasts',
          'Group discussion activities on abstract topics'
        ];
      case 'B1+':
      case 'B1':
        return [
          'General interest magazine articles',
          'TED talks and informative videos',
          'Conversation practice on familiar topics',
          'Intermediate grammar exercises'
        ];
      case 'A2+':
      case 'A2':
        return [
          'Simplified news articles and stories',
          'Guided conversation exercises',
          'Basic vocabulary building activities',
          'Elementary grammar practice'
        ];
      default:
        return [
          'Picture dictionaries and visual learning materials',
          'Basic phrase books and simple dialogues',
          'Beginner listening exercises with visual support',
          'Foundation vocabulary flashcards'
        ];
    }
  };
  
  // Get appropriate resources for the candidate's level
  const levelResources = recommendResourcesForLevel(cefrLevel);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 text-assessment-teal mr-2" />
          Skill Improvement Recommendations
        </h3>
        
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="border-l-4 border-assessment-teal pl-4 py-2">
              <h4 className="font-medium text-lg mb-2">Improve your {rec.area}</h4>
              <ul className="space-y-2">
                {rec.tips.map((tip, tipIdx) => (
                  <li key={tipIdx} className="flex items-start">
                    <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2 mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Book className="h-5 w-5 text-assessment-teal mr-2" />
          CEFR Level {cefrLevel} Study Materials
        </h3>
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="mb-3">Based on your current level <span className="font-semibold">{cefrLevel}</span>, we recommend the following resources:</p>
          
          <ul className="space-y-2">
            {levelResources.map((resource, idx) => (
              <li key={idx} className="flex items-start">
                <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2 mt-0.5">✓</span>
                {resource}
              </li>
            ))}
          </ul>
          
          {isQuickAssessment && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm italic">
                For a more comprehensive assessment and personalized recommendations, consider taking our Full Assessment test, which evaluates all language skills.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Next Steps</h3>
        <p className="text-sm">
          Consider focusing on your areas for improvement while maintaining practice in your strength areas. 
          Regular practice with authentic materials at your level will help you progress 
          towards {cefrLevel.includes('C') ? 'mastery' : 'the next CEFR level'}.
        </p>
      </div>
    </div>
  );
};

export default LearningRecommendations;
