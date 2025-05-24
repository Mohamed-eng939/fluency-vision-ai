
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { mapScoreToCEFR } from '@/utils/reports/reportUtils';

interface ReportChartsProps {
  skillChartData: Array<{ skill: string; score: number }>;
  radarChartData: Array<{ skill: string; score: number; fullMark: number }>;
  isFullAssessment?: boolean;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ skillChartData, radarChartData, isFullAssessment = false }) => {
  const chartConfig = {
    score: {
      label: "CEFR Level",
    },
  };

  // Convert scores to CEFR levels for display
  const cefrLevels = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const cefrToNumber = (level: string) => cefrLevels.indexOf(level) + 1;
  const numberToCEFR = (num: number) => cefrLevels[Math.floor(num) - 1] || 'Pre-A1';

  // Transform data to use CEFR levels
  const transformedSkillData = skillChartData.map(item => ({
    ...item,
    cefrLevel: mapScoreToCEFR(item.score),
    cefrNumeric: cefrToNumber(mapScoreToCEFR(item.score))
  }));

  const transformedRadarData = radarChartData.map(item => ({
    ...item,
    cefrLevel: mapScoreToCEFR(item.score),
    cefrNumeric: cefrToNumber(mapScoreToCEFR(item.score)),
    fullMark: 7 // Max CEFR level (C2)
  }));

  const chartTitle = isFullAssessment ? 'All Skills Performance' : 'Speaking Skills Performance';
  const chartDescription = isFullAssessment ? 'CEFR level assessment across all communication skills' : 'CEFR level assessment for speaking skills';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">{chartTitle}</CardTitle>
          <CardDescription>{chartDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={transformedSkillData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="skill" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  domain={[1, 7]} 
                  tickFormatter={numberToCEFR}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  fontSize={11}
                />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-assessment-blue font-semibold">
                            Level: {data.cefrLevel}
                          </p>
                          <p className="text-sm text-gray-600">
                            Score: {data.score}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Bar 
                  dataKey="cefrNumeric" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Skills Radar</CardTitle>
          <CardDescription>Comprehensive CEFR skill profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={transformedRadarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="skill" 
                  fontSize={11}
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  domain={[1, 7]} 
                  tickFormatter={numberToCEFR}
                  fontSize={9}
                  tick={{ fontSize: 9 }}
                />
                <Radar
                  name="CEFR Level"
                  dataKey="cefrNumeric"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">{data.skill}</p>
                          <p className="text-assessment-blue font-semibold">
                            Level: {data.cefrLevel}
                          </p>
                          <p className="text-sm text-gray-600">
                            Score: {data.score}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCharts;
