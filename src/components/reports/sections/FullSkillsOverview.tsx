
import React from 'react';
import { AssessmentMetrics } from '@/types/assessment';
import SkillScoreProgress from '../elements/SkillScoreProgress';
import { mapScoreToCEFR } from '@/utils/reports/reportUtils';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend } from 'recharts';

interface FullSkillsOverviewProps {
  metrics: AssessmentMetrics;
  justifications: Record<string, string>;
  assessmentSections: any[];
}

const FullSkillsOverview: React.FC<FullSkillsOverviewProps> = ({
  metrics,
  justifications,
  assessmentSections
}) => {
  // Combine speaking skills
  const speakingScore = (
    metrics.fluency + 
    metrics.pronunciation + 
    metrics.grammar + 
    metrics.vocabulary + 
    metrics.syntax + 
    metrics.coherence
  ) / 6;
  
  // Define main communication skills
  const communicationSkills = [
    {
      name: 'Speaking',
      score: speakingScore * 10,
      cefrLevel: mapScoreToCEFR(speakingScore * 10),
      color: '#0ea5e9'
    }
  ];

  // Add optional skills if they exist
  if (metrics.listening !== undefined) {
    communicationSkills.push({
      name: 'Listening',
      score: metrics.listening * 10,
      cefrLevel: mapScoreToCEFR(metrics.listening * 10),
      color: '#8b5cf6'
    });
  }

  if (metrics.reading !== undefined) {
    communicationSkills.push({
      name: 'Reading',
      score: metrics.reading * 10,
      cefrLevel: mapScoreToCEFR(metrics.reading * 10),
      color: '#10b981'
    });
  }

  if (metrics.writing !== undefined) {
    communicationSkills.push({
      name: 'Writing',
      score: metrics.writing * 10,
      cefrLevel: mapScoreToCEFR(metrics.writing * 10),
      color: '#f97316'
    });
  }

  // Calculate combined score
  const combinedScore = communicationSkills.reduce((sum, skill) => sum + skill.score, 0) / communicationSkills.length;

  // Prepare chart data
  const chartData = communicationSkills.map(skill => ({
    name: skill.name,
    value: skill.score
  }));

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Overall Communication Score</h3>
        <div className="flex items-center">
          <div className="w-full mr-4">
            <SkillScoreProgress value={combinedScore} height="h-6" />
          </div>
          <div className="whitespace-nowrap">
            <span className="font-bold text-lg">{Math.round(combinedScore)}%</span>
          </div>
        </div>
        <p className="text-sm mt-1 text-gray-600">
          Your overall communication proficiency is at {mapScoreToCEFR(combinedScore)} level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Skill Distribution</h3>
          <Card className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={communicationSkills[index].color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Communication Skills</h3>
          <div className="space-y-4">
            {communicationSkills.map((skill) => (
              <div key={skill.name} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <h4 className="font-medium mr-2">{skill.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100">{skill.cefrLevel}</span>
                  </div>
                  <span className="font-bold">{Math.round(skill.score)}%</span>
                </div>
                <SkillScoreProgress value={skill.score} color={skill.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Assessment Summary</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm">{justifications.overall || 'Your assessment shows strengths and areas for improvement across multiple language skills. Focus on the specific recommendations for each skill area to improve your overall proficiency.'}</p>
        </div>
      </div>
    </div>
  );
};

export default FullSkillsOverview;
