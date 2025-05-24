
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Search, Users, TrendingUp, BarChart3, Calendar, Filter } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dummy assessment data
const assessments = [
  {
    id: "A001",
    name: "Sarah Martinez",
    email: "sarah.martinez@email.com",
    testType: "Full",
    date: "2025-05-24",
    cefr: "B2",
    score: 85,
    reportUrl: "/reports/A001"
  },
  {
    id: "A002",
    name: "Michael Chen",
    email: "m.chen@company.com",
    testType: "Quick",
    date: "2025-05-24",
    cefr: "C1",
    score: 92,
    reportUrl: "/reports/A002"
  },
  {
    id: "A003",
    name: "Emma Johnson",
    email: "emma.j@school.edu",
    testType: "Full",
    date: "2025-05-23",
    cefr: "A2",
    score: 68,
    reportUrl: "/reports/A003"
  },
  {
    id: "A004",
    name: "David Rodriguez",
    email: "david.rod@example.com",
    testType: "Quick",
    date: "2025-05-23",
    cefr: "B1",
    score: 75,
    reportUrl: "/reports/A004"
  },
  {
    id: "A005",
    name: "Lisa Wang",
    email: "lisa.wang@tech.com",
    testType: "Full",
    date: "2025-05-22",
    cefr: "C2",
    score: 96,
    reportUrl: "/reports/A005"
  },
  {
    id: "A006",
    name: "James Wilson",
    email: "j.wilson@university.edu",
    testType: "Quick",
    date: "2025-05-22",
    cefr: "B2",
    score: 82,
    reportUrl: "/reports/A006"
  },
  {
    id: "A007",
    name: "Maria Garcia",
    email: "maria.g@instituto.es",
    testType: "Full",
    date: "2025-05-21",
    cefr: "A1",
    score: 45,
    reportUrl: "/reports/A007"
  },
  {
    id: "A008",
    name: "Thomas Anderson",
    email: "t.anderson@corp.com",
    testType: "Quick",
    date: "2025-05-21",
    cefr: "B1",
    score: 71,
    reportUrl: "/reports/A008"
  }
];

const cefrColors = {
  "A1": "#ef4444",
  "A2": "#f97316", 
  "B1": "#eab308",
  "B2": "#22c55e",
  "C1": "#3b82f6",
  "C2": "#8b5cf6"
};

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [cefrFilter, setCefrFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter assessments based on search and filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTestType = testTypeFilter === 'all' || assessment.testType.toLowerCase() === testTypeFilter;
      const matchesCefr = cefrFilter === 'all' || assessment.cefr === cefrFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const assessmentDate = new Date(assessment.date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = daysDiff === 0;
            break;
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesTestType && matchesCefr && matchesDate;
    });
  }, [searchTerm, testTypeFilter, cefrFilter, dateFilter]);

  // Calculate analytics
  const totalAssessments = assessments.length;
  const averageScore = Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments);
  
  // CEFR distribution for charts
  const cefrDistribution = Object.entries(
    assessments.reduce((acc, assessment) => {
      acc[assessment.cefr] = (acc[assessment.cefr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([level, count]) => ({
    level,
    count,
    fill: cefrColors[level as keyof typeof cefrColors]
  }));

  const getCefrBadgeColor = (cefr: string) => {
    const colorMap = {
      "A1": "bg-red-100 text-red-800 border-red-200",
      "A2": "bg-orange-100 text-orange-800 border-orange-200",
      "B1": "bg-yellow-100 text-yellow-800 border-yellow-200", 
      "B2": "bg-green-100 text-green-800 border-green-200",
      "C1": "bg-blue-100 text-blue-800 border-blue-200",
      "C2": "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colorMap[cefr as keyof typeof colorMap] || "bg-gray-100 text-gray-800";
  };

  const chartConfig = {
    count: {
      label: "Assessments",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-assessment-blue">LinguaSpeak Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive assessment insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Welcome, {user?.name || 'Admin'}</span>
              <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Assessments</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{totalAssessments}</div>
              <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Average Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{averageScore}%</div>
              <p className="text-xs text-green-600 mt-1">+3% improvement</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Active Today</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">2</div>
              <p className="text-xs text-purple-600 mt-1">Assessment sessions</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Success Rate</CardTitle>
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">94%</div>
              <p className="text-xs text-orange-600 mt-1">Completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-assessment-blue">CEFR Level Distribution</CardTitle>
              <CardDescription>Distribution of assessment results by CEFR levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cefrDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-assessment-blue">Assessment Types</CardTitle>
              <CardDescription>Breakdown of Quick vs Full assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Quick', value: assessments.filter(a => a.testType === 'Quick').length, fill: '#3b82f6' },
                        { name: 'Full', value: assessments.filter(a => a.testType === 'Full').length, fill: '#8b5cf6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-assessment-blue flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Assessment Data
            </CardTitle>
            <CardDescription>Search and filter assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quick">Quick</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cefrFilter} onValueChange={setCefrFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="CEFR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assessment Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Test Type</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">CEFR Level</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Report</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{assessment.name}</TableCell>
                      <TableCell className="text-gray-600">{assessment.email}</TableCell>
                      <TableCell>
                        <Badge variant={assessment.testType === 'Full' ? 'default' : 'secondary'}>
                          {assessment.testType}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.date}</TableCell>
                      <TableCell>
                        <Badge className={getCefrBadgeColor(assessment.cefr)}>
                          {assessment.cefr}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${assessment.score >= 80 ? 'text-green-600' : assessment.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {assessment.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(assessment.reportUrl)}
                          className="text-assessment-blue hover:bg-blue-50"
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAssessments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assessments found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
