
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCEFRColor, mapScoreToCEFR } from '@/utils/scoring/cefrUtils';
import CEFRRadarChart from '../elements/CEFRRadarChart';

interface CEFRSkillsBreakdownProps {
  skillScores: Record<string, number>;
  cefrLevels?: Record<string, string>;
  overallCEFR?: string;
  showRadarChart?: boolean;
}

const CEFRSkillsBreakdown: React.FC<CEFRSkillsBreakdownProps> = ({
  skillScores,
  cefrLevels,
  overallCEFR,
  showRadarChart = true
}) => {
  // Generate CEFR levels if not provided
  const finalCefrLevels = cefrLevels || Object.fromEntries(
    Object.entries(skillScores).map(([skill, score]) => [
      skill,
      mapScoreToCEFR(score, skill as any)
    ])
  );

  const skillsToShow = [
    { key: 'grammar', label: 'Grammar' },
    { key: 'fluency', label: 'Fluency' },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'pronunciation', label: 'Pronunciation' },
    { key: 'prosody', label: 'Prosody' },
    { key: 'coherence', label: 'Coherence' }
  ];

  // Add optional skills if they exist
  if (skillScores.syntax !== undefined) {
    skillsToShow.push({ key: 'syntax', label: 'Syntax' });
  }
  if (skillScores.listening !== undefined) {
    skillsToShow.push({ key: 'listening', label: 'Listening' });
  }
  if (skillScores.reading !== undefined) {
    skillsToShow.push({ key: 'reading', label: 'Reading' });
  }
  if (skillScores.writing !== undefined) {
    skillsToShow.push({ key: 'writing', label: 'Writing' });
  }

  return (
    <div className="space-y-6">
      {/* Overall CEFR Level */}
      {overallCEFR && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Overall CEFR Level</h3>
            <Badge 
              className="text-lg px-4 py-2" 
              style={{ 
                backgroundColor: getCEFRColor(overallCEFR as any),
                color: 'white'
              }}
            >
              {overallCEFR}
            </Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>CEFR Skills Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillsToShow.map(({ key, label }) => {
                const score = skillScores[key];
                const cefrLevel = finalCefrLevels[key];
                
                if (score === undefined) return null;
                
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="font-medium">{label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {Math.round(score * 10)}%
                      </span>
                      <Badge 
                        style={{ 
                          backgroundColor: getCEFRColor(cefrLevel as any),
                          color: 'white'
                        }}
                      >
                        {cefrLevel}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        {showRadarChart && (
          <CEFRRadarChart 
            cefrLevels={finalCefrLevels}
            title="Skills Profile"
            size="medium"
          />
        )}
      </div>
    </div>
  );
};

export default CEFRSkillsBreakdown;
