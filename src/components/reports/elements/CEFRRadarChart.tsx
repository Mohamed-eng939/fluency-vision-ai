
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cefrToNumber } from '@/utils/scoring/cefrUtils';

interface CEFRRadarChartProps {
  cefrLevels: Record<string, string>;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

const CEFRRadarChart: React.FC<CEFRRadarChartProps> = ({
  cefrLevels,
  title = "CEFR Skills Profile",
  size = 'medium'
}) => {
  // Only the three engine-backed criteria are shown (per scope rules).
  const radarData = [
    {
      skill: 'Grammar',
      level: cefrToNumber(cefrLevels.grammar as any),
      fullMark: 6
    },
    {
      skill: 'Fluency',
      level: cefrToNumber(cefrLevels.fluency as any),
      fullMark: 6
    },
    {
      skill: 'Vocabulary',
      level: cefrToNumber(cefrLevels.vocabulary as any),
      fullMark: 6
    }
  ];

  const heightMap = {
    small: 200,
    medium: 300,
    large: 400
  };

  const height = heightMap[size];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 6]}
              tick={false}
            />
            <Radar
              name="CEFR Level"
              dataKey="level"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-center">
          <div className="flex justify-center space-x-4 text-xs">
            <span>Pre-A1: 0</span>
            <span>A1: 1</span>
            <span>A2: 2</span>
            <span>B1: 3</span>
            <span>B2: 4</span>
            <span>C1: 5</span>
            <span>C2: 6</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CEFRRadarChart;
