import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AssessmentResult, CEFRLevel } from '../types/assessment';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface AssessmentReportProps {
  result: AssessmentResult | null;
  isLoading: boolean;
}

const AssessmentReport: React.FC<AssessmentReportProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-16 w-16 rounded-full border-4 border-t-assessment-teal border-r-assessment-teal border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-assessment-blue">Analyzing your speech...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }
  
  if (!result) return null;
  
  const { metrics, totalScore, cefrLevel, feedback } = result;
  
  const radarData = [
    { 
      subject: 'Fluency', 
      score: metrics.fluency, 
      fullMark: 10 
    },
    { 
      subject: 'Grammar', 
      score: metrics.grammar, 
      fullMark: 10 
    },
    { 
      subject: 'Pronunciation', 
      score: metrics.pronunciation, 
      fullMark: 10 
    },
    { 
      subject: 'Prosody', 
      score: metrics.prosody, 
      fullMark: 10 
    },
    { 
      subject: 'Vocabulary', 
      score: metrics.vocabulary, 
      fullMark: 10 
    },
    { 
      subject: 'Syntax', 
      score: metrics.syntax, 
      fullMark: 10 
    },
    { 
      subject: 'Coherence', 
      score: metrics.coherence, 
      fullMark: 10 
    },
  ];
  
  const barData = [
    { name: 'Fluency', value: metrics.fluency },
    { name: 'Grammar', value: metrics.grammar },
    { name: 'Pronunciation', value: metrics.pronunciation },
    { name: 'Prosody', value: metrics.prosody },
    { name: 'Vocabulary', value: metrics.vocabulary },
    { name: 'Syntax', value: metrics.syntax },
    { name: 'Coherence', value: metrics.coherence },
  ];
  
  const getCEFRBadgeClass = (level: CEFRLevel) => {
    return `cefr-badge cefr-${level.toLowerCase()}`;
  };
  
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-assessment-blue mb-2 sm:mb-0">Assessment Results</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Total Score:</span>
            <span className="text-xl font-bold">{totalScore}/100</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">CEFR Level:</span>
            <span className={getCEFRBadgeClass(cefrLevel)}>{cefrLevel}</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Feedback</TabsTrigger>
          <TabsTrigger value="chart">Skills Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-2">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="radar-chart-container md:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar 
                    name="Skills" 
                    dataKey="score" 
                    stroke="#3BCEAC" 
                    fill="#3BCEAC" 
                    fillOpacity={0.6} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
              <p className="text-gray-700 mb-4">{feedback.overall}</p>
              
              <h4 className="text-md font-semibold mb-2">Strongest Areas:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(metrics)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <span key={key} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
              </div>
              
              <h4 className="text-md font-semibold mb-2">Areas for Improvement:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics)
                  .sort((a, b) => a[1] - b[1])
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <span key={key} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(feedback).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2 capitalize">{key}</h3>
                  <p className="text-gray-700">{value}</p>
                  <div className="mt-3 flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Score:</span>
                    <div className="h-2 flex-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-assessment-teal rounded-full" 
                        style={{ width: `${(metrics[key as keyof typeof metrics] / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium ml-2">
                      {metrics[key as keyof typeof metrics].toFixed(1)}/10
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="chart" className="pt-2">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3BCEAC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">CEFR Level Explanation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-a1 text-sm">A1</span>
                <p className="text-xs mt-1">Beginner</p>
              </div>
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-a2 text-sm">A2</span>
                <p className="text-xs mt-1">Elementary</p>
              </div>
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-b1 text-sm">B1</span>
                <p className="text-xs mt-1">Intermediate</p>
              </div>
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-b2 text-sm">B2</span>
                <p className="text-xs mt-1">Upper Intermediate</p>
              </div>
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-c1 text-sm">C1</span>
                <p className="text-xs mt-1">Advanced</p>
              </div>
              <div className="p-2 border rounded">
                <span className="cefr-badge cefr-c2 text-sm">C2</span>
                <p className="text-xs mt-1">Proficient</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentReport;
