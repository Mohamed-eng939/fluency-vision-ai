
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AssessorPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">Assessor Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name || 'Assessor'}</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-assessment-blue" />
          <span className="ml-2">Loading data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Review and score pending assessments</p>
              <Button className="w-full">View Pending (0)</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completed Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">View history of your completed reviews</p>
              <Button className="w-full">View History</Button>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Track student learning progress and improvement over time</p>
              <Button className="w-full">View Student Progress</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssessorPanel;
