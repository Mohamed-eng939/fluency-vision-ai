import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, ClipboardList, RefreshCw, UserCog } from 'lucide-react';
import AssessmentAssignmentDashboard from '@/components/admin/AssessmentAssignmentDashboard';
import UserManagement from '@/components/admin/UserManagement';

interface AdminStats {
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  average_score: number;
  total_users: number;
  assessors: number;
  reviews: number;
  active_today: number;
  cefr_distribution: Record<string, number>;
}

const cefrColor = (level: string) => {
  switch (level) {
    case 'C2': return 'bg-purple-500';
    case 'C1': return 'bg-blue-600';
    case 'B2': return 'bg-emerald-500';
    case 'B1': return 'bg-teal-500';
    case 'A2': return 'bg-amber-500';
    default: return 'bg-orange-500';
  }
};

const AdminPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats', { body: {} });
      if (error) throw error;
      setStats(data?.stats ?? null);
    } catch (e: any) {
      toast.error(`Failed to load stats: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const metrics = stats
    ? [
        { label: 'Total Assessments', value: stats.total_sessions },
        { label: 'Completed', value: stats.completed_sessions },
        { label: 'Completion Rate', value: `${stats.completion_rate}%` },
        { label: 'Active Today', value: stats.active_today },
        { label: 'Total Users', value: stats.total_users },
        { label: 'Assessors', value: stats.assessors },
        { label: 'Reviews Done', value: stats.reviews },
        { label: 'Avg Score', value: stats.average_score },
      ]
    : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">Admin Control Panel</h1>
          <p className="text-muted-foreground">Welcome, {user?.full_name || 'Admin'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/assessor')}>Assessor Panel</Button>
          {user && <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>}
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Assessment Assignments
          </TabsTrigger>
        </TabsList>

        {/* Overview — live data */}
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live metrics</h2>
            <Button variant="ghost" size="sm" onClick={loadStats} disabled={loading} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading live data…
            </div>
          ) : !stats ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((m) => (
                  <Card key={m.label}>
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-assessment-blue tabular-nums">{m.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {Object.keys(stats.cefr_distribution).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CEFR Level Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                        <div key={lvl} className="flex items-center gap-2">
                          <Badge className={`${cefrColor(lvl)} text-white`}>{lvl}</Badge>
                          <span className="text-sm font-semibold tabular-nums">
                            {stats.cefr_distribution[lvl] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Invite new users, change roles (learner / assessor / admin), and remove accounts.
              </p>
              <Button onClick={() => setUserMgmtOpen(true)}>
                <UserCog className="h-4 w-4 mr-2" /> Manage Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Assignments */}
        <TabsContent value="assignments" className="mt-6">
          <AssessmentAssignmentDashboard />
        </TabsContent>
      </Tabs>

      <UserManagement open={userMgmtOpen} onOpenChange={setUserMgmtOpen} currentUserId={user?.id} />
    </div>
  );
};

export default AdminPanel;
