
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface ReportChartsProps {
  skillChartData: Array<{ skill: string; score: number }>;
  radarChartData: Array<{ skill: string; score: number; fullMark: number }>;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ skillChartData, radarChartData }) => {
  const chartConfig = {
    score: {
      label: "Score",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Skills Performance</CardTitle>
          <CardDescription>Bar chart showing individual skill scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="skill" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{`${label}: ${payload[0].value}%`}</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg print:shadow-none">
        <CardHeader>
          <CardTitle className="text-assessment-blue">Skills Radar</CardTitle>
          <CardDescription>Comprehensive skill profile visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{`${payload[0].payload.skill}: ${payload[0].value}%`}</p>
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
