
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mapScoreToCEFR, getCEFRColor } from '@/utils/reports/reportUtils';

interface SkillsBreakdownProps {
  scores: Record<string, number>;
  isFullAssessment?: boolean;
}

const SkillsBreakdown: React.FC<SkillsBreakdownProps> = ({ scores, isFullAssessment = false }) => {
  // Define skills for each assessment type
  const speakingSkills = ['fluency', 'grammar', 'vocabulary', 'pronunciation', 'prosody', 'coherence', 'structure'];
  const fullAssessmentSkills = [...speakingSkills, 'listening', 'reading', 'writing'];
  
  const skillsToDisplay = isFullAssessment ? fullAssessmentSkills : speakingSkills;

  // Determine the scoring scale based on the data
  const maxScore = Math.max(...Object.values(scores).filter(score => score > 0));
  const isPercentageScale = maxScore > 10; // If max score > 10, assume it's percentage scale

  // Create skill data with proper formatting
  const skillData = skillsToDisplay
    .filter(skill => scores[skill] !== undefined && scores[skill] > 0)
    .map(skill => {
      const rawScore = scores[skill];
      // Convert to percentage for progress bar and CEFR mapping
      const progressValue = isPercentageScale ? rawScore : (rawScore / 10) * 100;
      const normalizedScore = isPercentageScale ? rawScore : rawScore * 10;
      const cefrLevel = mapScoreToCEFR(normalizedScore);
      
      return {
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        score: rawScore,
        progressValue,
        cefrLevel,
        color: getCEFRColor(cefrLevel),
        displayScore: isPercentageScale ? `${rawScore}%` : `${rawScore}/10`
      };
    });

  return (
    <Card className="mb-6 shadow-lg print:shadow-none">
      <CardHeader>
        <CardTitle className="text-assessment-blue">
          {isFullAssessment ? 'Skills Breakdown - All Communication Skills' : 'Skills Breakdown - Speaking Assessment'}
        </CardTitle>
        <CardDescription>
          Individual performance across {isFullAssessment ? 'all assessed' : 'speaking'} skills with CEFR level mapping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillData.map((skill) => (
            <div key={skill.name} className="p-4 border rounded-lg bg-gray-50 print:bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{skill.name}</h4>
                <Badge 
                  style={{ backgroundColor: skill.color, color: 'white' }}
                  className="text-xs"
                >
                  {skill.cefrLevel}
                </Badge>
              </div>
              <div className="mb-2">
                <Progress 
                  value={skill.progressValue} 
                  className="h-2" 
                />
              </div>
              <p className="text-xs text-gray-600 text-right">
                {skill.displayScore}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsBreakdown;
