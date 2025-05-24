
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SkillsBreakdownProps {
  scores: Record<string, number>;
}

const SkillsBreakdown: React.FC<SkillsBreakdownProps> = ({ scores }) => {
  return (
    <Card className="mb-6 shadow-lg print:shadow-none">
      <CardHeader>
        <CardTitle className="text-assessment-blue">Skills Assessment Breakdown</CardTitle>
        <CardDescription>Detailed scoring across all evaluated competencies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(scores).map(([skill, score]) => (
            <div key={skill} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg print:bg-gray-50">
              <div className="text-2xl font-bold text-assessment-blue mb-1">{Number(score)}%</div>
              <div className="text-sm font-medium text-gray-600">{skill}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full print:bg-gray-600" 
                  style={{ width: `${Number(score)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsBreakdown;
