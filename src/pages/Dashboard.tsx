
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">LinguaSpeak Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name || 'Learner'}</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Assessment</CardTitle>
            <CardDescription>Take a quick speaking assessment to evaluate your level</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The quick assessment takes about 10 minutes and provides an immediate CEFR level evaluation.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/assessment')} className="w-full">Start Quick Assessment</Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Results</CardTitle>
            <CardDescription>View your assessment history and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your progress over time and review detailed feedback from previous assessments.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Results</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
