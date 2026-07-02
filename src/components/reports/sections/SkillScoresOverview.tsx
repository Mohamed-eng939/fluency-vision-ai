
import React from 'react';
import { AssessmentMetrics } from '@/types/assessment';
import SkillScoreProgress from '../elements/SkillScoreProgress';
import { mapScoreToCEFR } from '@/utils/reports/reportUtils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SkillScoresOverviewProps {
  metrics: AssessmentMetrics;
  justifications: {
    fluency: string;
    grammar: string;
    vocabulary: string;
    [key: string]: string;
  };
  title?: string;
}

const SkillScoresOverview: React.FC<SkillScoresOverviewProps> = ({
  metrics,
  justifications,
  title = 'Skill Scores'
}) => {
  // Only the three engine-backed criteria are shown to learners (per scope rules).
  const skills = [
    {
      name: 'Fluency',
      score: metrics.fluency * 10,
      cefrLevel: mapScoreToCEFR(metrics.fluency * 10),
      justification: justifications.fluency
    },
    {
      name: 'Grammar',
      score: metrics.grammar * 10,
      cefrLevel: mapScoreToCEFR(metrics.grammar * 10),
      justification: justifications.grammar
    },
    {
      name: 'Vocabulary',
      score: metrics.vocabulary * 10,
      cefrLevel: mapScoreToCEFR(metrics.vocabulary * 10),
      justification: justifications.vocabulary
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {skills.map((skill) => (
            <div key={skill.name} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div className="flex items-center mb-2 sm:mb-0">
                  <h4 className="font-medium text-assessment-blue mr-2">{skill.name}</h4>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-assessment-teal/10 text-assessment-teal">
                    {skill.cefrLevel}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{Math.round(skill.score)}%</span>
                </div>
              </div>
              
              <SkillScoreProgress value={skill.score} />
              
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value={`feedback-${skill.name}`} className="border-none">
                  <AccordionTrigger className="text-sm py-2 text-gray-700">
                    View Feedback
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-gray-600 mt-1">{skill.justification}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillScoresOverview;
