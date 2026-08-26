import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, ClipboardList, RefreshCw, UserCog, MessageSquare, Database, Download, KeyRound, Building2 } from 'lucide-react';
import AssessmentAssignmentDashboard from '@/components/admin/AssessmentAssignmentDashboard';
import UserManagement from '@/components/admin/UserManagement';
import PromptManagement from '@/components/admin/PromptManagement';
import TrainingDataViewer from '@/components/admin/TrainingDataViewer';
import ApiKeyManagement from '@/components/admin/ApiKeyManagement';
import OrganizationManagement from '@/components/admin/OrganizationManagement';
import { toCsv, downloadCsv } from '@/utils/admin/exportCsv';

interface AdminStats {
  total_sessions: number;
  in_progress: number;
  awaiting_review: number;
  under_review: number;
  reviewed: number;
  total_users: number;
  learners: number;
  assessors: number;
  reviews: number;
  active_prompts: number;
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

  const [exporting, setExporting] = useState(false);
  const exportSessions = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .select('id, status, session_type, overall_score, overall_cefr_level, created_at, student_info, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const flat = (data ?? []).map((s: any) => ({
        id: s.id,
        name: s.profiles?.full_name || s.student_info?.name || 'Anonymous',
        email: s.profiles?.email || s.student_info?.email || '',
        type: s.session_type,
        status: s.status,
        cefr: s.overall_cefr_level || '',
        score: s.overall_score ?? '',
        date: s.created_at,
      }));
      if (!flat.length) { toast.error('No sessions to export'); return; }
      downloadCsv(`assessments-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(flat));
      toast.success(`Exported ${flat.length} assessments`);
    } catch (e: any) {
      toast.error(`Export failed: ${e.message ?? e}`);
    } finally {
      setExporting(false);
    }
  };

  const metrics = stats
    ? [
        { label: 'Total Assessments', value: stats.total_sessions },
        { label: 'In Progress', value: stats.in_progress },
        { label: 'Awaiting Review', value: stats.awaiting_review },
        { label: 'Under Review', value: stats.under_review },
        { label: 'Reviewed', value: stats.reviewed },
        { label: 'Learners', value: stats.learners },
        { label: 'Assessors', value: stats.assessors },
        { label: 'Active Today', value: stats.active_today },
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Organizations
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Assignments
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Prompts
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Training Data
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> API Keys
          </TabsTrigger>
        </TabsList>

        {/* Overview — live data */}
        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live metrics</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportSessions} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export data (CSV)
              </Button>
              <Button variant="ghost" size="sm" onClick={loadStats} disabled={loading} aria-label="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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

        {/* Organizations (white-label tenants) */}
        <TabsContent value="organizations" className="mt-6">
          <OrganizationManagement />
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

        {/* Assessment Prompts */}
        <TabsContent value="prompts" className="mt-6">
          <PromptManagement />
        </TabsContent>

        {/* Training Data */}
        <TabsContent value="training" className="mt-6">
          <TrainingDataViewer />
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="apikeys" className="mt-6">
          <ApiKeyManagement />
        </TabsContent>
      </Tabs>

      <UserManagement open={userMgmtOpen} onOpenChange={setUserMgmtOpen} currentUserId={user?.id} />
    </div>
  );
};

export default AdminPanel;
