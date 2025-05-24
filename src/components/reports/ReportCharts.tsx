
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { mapScoreToCEFR } from '@/utils/reports/reportUtils';

interface ReportChartsProps {
  scores: Record<string, number>;
  isFullAssessment?: boolean;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ scores, isFullAssessment = false }) => {
  const chartConfig = {
    score: {
      label: "Score",
    },
  };

  // Define skill order for consistent display
  const speakingSkills = ['fluency', 'grammar', 'vocabulary', 'pronunciation', 'prosody', 'coherence', 'structure'];
  const fullAssessmentSkills = [...speakingSkills, 'listening', 'reading', 'writing'];
  const skillsToShow = isFullAssessment ? fullAssessmentSkills : speakingSkills;

  // Determine the scoring scale based on the data
  const maxScore = Math.max(...Object.values(scores).filter(score => score > 0));
  const isPercentageScale = maxScore > 10; // If max score > 10, assume it's percentage scale
  const scaleMax = isPercentageScale ? 100 : 10;
  
  // Prepare chart data directly from scores object
  const skillChartData = skillsToShow
    .filter(skill => scores[skill] !== undefined && scores[skill] > 0)
    .map(skill => {
      const rawScore = scores[skill];
      // Convert to percentage if needed for CEFR mapping
      const normalizedScore = isPercentageScale ? rawScore : rawScore * 10;
      const cefrLevel = mapScoreToCEFR(normalizedScore);
      
      return {
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        score: rawScore, // Use original score for display
        cefrLevel,
        normalizedScore
      };
    });

  const radarChartData = skillChartData.map(item => ({
    ...item,
    fullMark: scaleMax
  }));

  const chartTitle = isFullAssessment ? 'All Skills Performance' : 'Speaking Skills Performance';
  const chartDescription = isFullAssessment ? 'Score assessment across all communication skills' : 'Score assessment for speaking skills';

  // Create Y-axis ticks based on scale
  const yAxisTicks = isPercentageScale 
    ? [0, 20, 40, 60, 80, 100]
    : [0, 2, 4, 6, 8, 10];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">{chartTitle}</CardTitle>
          <CardDescription>{chartDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={skillChartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="skill" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  domain={[0, scaleMax]} 
                  ticks={yAxisTicks}
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-assessment-blue font-semibold">
                            Score: {data.score}{isPercentageScale ? '%' : '/10'}
                          </p>
                          <p className="text-sm text-gray-600">
                            CEFR Level: {data.cefrLevel}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Bar 
                  dataKey="score" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  minPointSize={5}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Skills Radar</CardTitle>
          <CardDescription>Comprehensive skill profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                data={radarChartData} 
                margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              >
                <PolarGrid stroke="#e0e7ff" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  domain={[0, scaleMax]} 
                  fontSize={10}
                  tick={{ fontSize: 9 }}
                  angle={90}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">{data.skill}</p>
                          <p className="text-assessment-blue font-semibold">
                            Score: {data.score}{isPercentageScale ? '%' : '/10'}
                          </p>
                          <p className="text-sm text-gray-600">
                            CEFR Level: {data.cefrLevel}
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
