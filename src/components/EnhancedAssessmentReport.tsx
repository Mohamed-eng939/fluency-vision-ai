import React from 'react';
import AssessmentReport from './AssessmentReport';
import DetailedFeedback from './DetailedFeedback';
import { AssessmentResult } from '../types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book, Lightbulb, LineChart } from 'lucide-react';
import { generateRecommendations } from '../utils/scoringUtils';

interface EnhancedAssessmentReportProps {
  result: AssessmentResult;
  isLoading?: boolean;
  detailedFeedback?: Record<string, string> | null;
}

const EnhancedAssessmentReport: React.FC<EnhancedAssessmentReportProps> = ({
  result,
  isLoading,
  detailedFeedback
}) => {
  // Convert metrics to chart data
  const metricsData = [
    { name: 'Fluency', value: result.metrics.fluency * 10 },
    { name: 'Grammar', value: result.metrics.grammar * 10 },
    { name: 'Pronunciation', value: result.metrics.pronunciation * 10 },
    { name: 'Prosody', value: result.metrics.prosody * 10 },
    { name: 'Vocabulary', value: result.metrics.vocabulary * 10 },
    { name: 'Syntax', value: result.metrics.syntax * 10 },
    { name: 'Coherence', value: result.metrics.coherence * 10 },
  ];

  // Generate learning recommendations based on lowest scores
  const learningRecommendations = generateRecommendations(result.metrics);

  return (
    <div className="space-y-6">
      <AssessmentReport result={result} isLoading={isLoading} />
      
      <Tabs defaultValue="detailed" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detailed" className="space-y-4">
          {detailedFeedback && (
            <Card>
              <CardContent className="p-6">
                <DetailedFeedback result={result} detailedFeedback={detailedFeedback} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-assessment-teal" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={metricsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-assessment-teal" />
                Learning Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningRecommendations.map((rec, idx) => (
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
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <Book className="h-5 w-5 text-assessment-teal" />
                    CEFR Level Study Materials
                  </h4>
                  <p>Based on your current level <span className="font-semibold">{result.cefrLevel}</span>, 
                    we recommend the following resources:</p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2 mt-0.5">✓</span>
                      {result.cefrLevel} practice exercises and speaking tasks
                    </li>
                    <li className="flex items-start">
                      <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2 mt-0.5">✓</span>
                      Listening materials at {result.cefrLevel} level
                    </li>
                    <li className="flex items-start">
                      <span className="bg-assessment-teal/10 text-assessment-teal p-1 rounded-full mr-2 mt-0.5">✓</span>
                      Reading texts appropriate for {result.cefrLevel} learners
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAssessmentReport;
