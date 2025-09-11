
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, ClipboardList } from 'lucide-react';
import AssessmentAssignmentDashboard from '@/components/admin/AssessmentAssignmentDashboard';

const AdminPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced loading time for testing
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">Admin Control Panel</h1>
          <p className="text-muted-foreground">Welcome, {user?.full_name || 'Admin'} (Testing Mode)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/'}>Home</Button>
          {user && <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-assessment-blue" />
          <span className="ml-2">Loading data...</span>
        </div>
      ) : (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assessment Assignments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Manage user accounts, roles, and permissions</p>
                  <Button className="w-full">Manage Users</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Assessment Prompts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Create and edit speaking assessment prompts</p>
                  <Button className="w-full">Manage Prompts</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Generate and manage API keys for external integrations</p>
                  <Button className="w-full">Manage API Keys</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Assessment Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">View and export assessment data and statistics</p>
                  <Button className="w-full">View Data</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Training Datasets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Manage datasets used for AI training</p>
                  <Button className="w-full">Manage Datasets</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Configure system settings and parameters</p>
                  <Button className="w-full">Configure Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-6">
            <AssessmentAssignmentDashboard />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminPanel;
