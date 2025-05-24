
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { generateReportPdf } from '@/utils/reports/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';

// Extended dummy data matching the assessments from Dashboard
const reportData: Record<string, any> = {
  "A001": {
    id: "A001",
    name: "Sarah Martinez",
    email: "sarah.martinez@email.com",
    date: "2025-05-24",
    testType: "Full Assessment",
    prompt: "Describe your ideal workplace environment and explain why it would help you be more productive. Include details about the physical space, team dynamics, and work culture.",
    transcript: "My ideal workplace would be somewhere that has natural light and plants because I think that makes people feel more relaxed and creative. I would like to work with people who are collaborative and supportive, not competitive in a bad way. The culture should encourage learning and trying new things without being afraid of making mistakes. I believe when people feel comfortable, they can do their best work and be more innovative.",
    cefr: "B2",
    totalScore: 85,
    scores: {
      Fluency: 82,
      Grammar: 78,
      Vocabulary: 88,
      Pronunciation: 90,
      Prosody: 85,
      Coherence: 87,
      Structure: 80
    },
    feedback: "Excellent communication with clear ideas and good vocabulary range. Your pronunciation is very strong, and you maintain good coherence throughout your response. To improve further, focus on using more complex grammatical structures and varying your sentence patterns for enhanced fluency."
  },
  "A002": {
    id: "A002", 
    name: "Michael Chen",
    email: "m.chen@company.com",
    date: "2025-05-24",
    testType: "Quick Assessment",
    prompt: "Tell me about a challenge you overcame recently and what you learned from the experience.",
    transcript: "Recently I had to present to senior management about our quarterly results. I was very nervous because it was my first time presenting to such high-level executives. I prepared extensively, practiced my presentation multiple times, and asked my colleague for feedback. During the presentation, I spoke clearly and answered their questions confidently. I learned that preparation is key to success and that I'm more capable than I initially thought.",
    cefr: "C1",
    totalScore: 92,
    scores: {
      Fluency: 95,
      Grammar: 88,
      Vocabulary: 92,
      Pronunciation: 94,
      Prosody: 90,
      Coherence: 96,
      Structure: 89
    },
    feedback: "Outstanding performance with sophisticated vocabulary and excellent coherence. Your fluency is near-native level, and you demonstrate strong command of complex grammatical structures. Continue to challenge yourself with advanced topics to maintain this high level."
  },
  "A003": {
    id: "A003",
    name: "Emma Johnson", 
    email: "emma.j@school.edu",
    date: "2025-05-23",
    testType: "Full Assessment",
    prompt: "Discuss the impact of technology on education. What are the benefits and drawbacks?",
    transcript: "Technology has changed education a lot. Students can learn online now and use computers for research. This is good because they can study at home and find information quickly. But sometimes students spend too much time on screens and don't talk to other students enough. Teachers also need to learn new technology which can be difficult for some.",
    cefr: "A2", 
    totalScore: 68,
    scores: {
      Fluency: 65,
      Grammar: 60,
      Vocabulary: 70,
      Pronunciation: 75,
      Prosody: 68,
      Coherence: 72,
      Structure: 66
    },
    feedback: "Good basic communication with clear pronunciation. You express your ideas well, but try to use more complex sentence structures and expand your vocabulary. Practice connecting your ideas with transition words to improve coherence."
  }
};

const getCEFRColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': '#ef4444',
    'A2': '#f97316', 
    'B1': '#eab308',
    'B2': '#22c55e',
    'C1': '#3b82f6',
    'C2': '#8b5cf6'
  };
  return colors[level] || '#9ca3af';
};

const ReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const report = reportId ? reportData[reportId] : null;

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Report Not Found</CardTitle>
            <CardDescription>The requested assessment report could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const skillChartData = Object.entries(report.scores).map(([skill, score]) => ({
    skill,
    score
  }));

  const radarChartData = skillChartData.map(item => ({
    ...item,
    fullMark: 100
  }));

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      await generateReportPdf(reportRef.current, {
        fileName: `assessment-report-${report.id}-${report.name.replace(/\s+/g, '-')}.pdf`,
        learnerName: report.name,
        sessionId: report.id,
        dateOfTest: report.date,
      });
      
      toast({
        title: 'Report Downloaded',
        description: 'Assessment report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'There was a problem generating the PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const chartConfig = {
    score: {
      label: "Score",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm print:shadow-none">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="print:hidden"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-assessment-blue">Assessment Report</h1>
                <p className="text-gray-600">Detailed analysis and scoring breakdown</p>
              </div>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              className="bg-assessment-teal hover:bg-assessment-lightBlue print:hidden"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="container mx-auto py-8 px-6 max-w-4xl">
        {/* Header Information */}
        <Card className="mb-6 shadow-lg print:shadow-none">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-assessment-blue mb-2">
                  <FileText className="h-5 w-5 inline mr-2" />
                  {report.name}
                </CardTitle>
                <CardDescription className="text-base">
                  <span className="font-medium">Assessment Date:</span> {new Date(report.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
                <CardDescription className="text-base">
                  <span className="font-medium">Assessment Type:</span> {report.testType}
                </CardDescription>
                <CardDescription className="text-base">
                  <span className="font-medium">Email:</span> {report.email}
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge 
                  className="text-lg px-4 py-2 mb-2"
                  style={{ 
                    backgroundColor: getCEFRColor(report.cefr),
                    color: 'white'
                  }}
                >
                  CEFR Level: {report.cefr}
                </Badge>
                <div className="text-2xl font-bold text-assessment-blue">
                  Total Score: {report.totalScore}%
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Prompt and Response */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle className="text-assessment-blue">Assessment Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 italic bg-blue-50 p-4 rounded-lg print:bg-gray-50">
                "{report.prompt}"
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg print:shadow-none">
            <CardHeader>
              <CardTitle className="text-assessment-blue">Candidate Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                {report.transcript}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skills Overview */}
        <Card className="mb-6 shadow-lg print:shadow-none">
          <CardHeader>
            <CardTitle className="text-assessment-blue">Skills Assessment Breakdown</CardTitle>
            <CardDescription>Detailed scoring across all evaluated competencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {Object.entries(report.scores).map(([skill, score]) => (
                <div key={skill} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg print:bg-gray-50">
                  <div className="text-2xl font-bold text-assessment-blue mb-1">{score}%</div>
                  <div className="text-sm font-medium text-gray-600">{skill}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full print:bg-gray-600" 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
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
                    <ChartTooltip content={<ChartTooltipContent />} />
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
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        <Card className="shadow-lg print:shadow-none">
          <CardHeader>
            <CardTitle className="text-assessment-blue">Assessment Feedback & Recommendations</CardTitle>
            <CardDescription>Personalized insights for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg print:bg-gray-50">
              <p className="text-gray-700 leading-relaxed text-base">
                {report.feedback}
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg print:bg-gray-50">
                <h4 className="font-semibold text-assessment-blue mb-2">Strengths</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Clear pronunciation and articulation</li>
                  <li>• Good vocabulary range for level</li>
                  <li>• Coherent idea development</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg print:bg-gray-50">
                <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Complex sentence structures</li>
                  <li>• Grammatical accuracy</li>
                  <li>• Advanced vocabulary usage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm print:text-black">
          <p>Generated by LinguaSpeak AI Assessment Platform</p>
          <p>Report ID: {report.id} | Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
