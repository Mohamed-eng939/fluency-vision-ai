import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessionManagement } from '@/hooks/assessment/useSessionManagement';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const TestDatabaseIntegration: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { initializeSession, sessionId } = useSessionManagement();
  const { user } = useAuth();
  const { toast } = useToast();

  const addResult = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const result = `${timestamp}: ${isError ? '❌' : '✅'} ${message}`;
    setTestResults(prev => [result, ...prev]);
    
    if (isError) {
      toast({
        title: "Test Failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  const testSessionCreation = async () => {
    setIsLoading(true);
    try {
      addResult("Starting session creation test...");
      
      if (!user) {
        addResult("User not authenticated", true);
        return;
      }
      
      addResult(`Authenticated as: ${user.email}`);
      
      const newSessionId = await initializeSession(false);
      
      if (newSessionId) {
        addResult(`Session created successfully: ${newSessionId}`);
        addResult("✨ Database integration working!");
      } else {
        addResult("Failed to create session", true);
      }
    } catch (error: any) {
      addResult(`Error: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Database Integration Test</CardTitle>
        <CardDescription>
          Test the connection between the UI and the database via Edge Functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <div>Authentication: {user ? '✅ Connected' : '❌ Not logged in'}</div>
            <div>Current Session: {sessionId || 'None'}</div>
            <div>User: {user?.email || 'Not authenticated'}</div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={testSessionCreation} 
            disabled={isLoading || !user}
          >
            {isLoading ? 'Testing...' : 'Test Session Creation'}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            <div className="max-h-64 overflow-y-auto space-y-1 p-3 bg-muted rounded-lg font-mono text-sm">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={result.includes('❌') ? 'text-destructive' : 'text-foreground'}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};