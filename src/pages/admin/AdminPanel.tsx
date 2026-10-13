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
import NotificationBell from '@/components/notifications/NotificationBell';
import ChangePassword from '@/components/account/ChangePassword';
import RoleTour from '@/components/onboarding/RoleTour';
import PromptManagement from '@/components/admin/PromptManagement';
import TrainingDataViewer from '@/components/admin/TrainingDataViewer';
import ApiKeyManagement from '@/components/admin/ApiKeyManagement';
import OrganizationManagement from '@/components/admin/OrganizationManagement';
import { toCsv, downloadCsv } from '@/utils/admin/exportCsv';
import { invokeEdge } from '@/utils/edge/invokeEdge';

interface UsageInfo {
  db_bytes: number;
  storage_bytes: number;
  storage_objects: number;
  sessions: number;
  responses_with_audio: number;
  db_limit_bytes: number;
  storage_limit_bytes: number;
  plan: string;
}

interface AdminStats {
  usage?: UsageInfo | null;
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
  // Platform (super) admins have no organization_id and manage all tenants; an
  // org admin (organization_id set) is scoped to their own org and must not see
  // the cross-tenant Organizations console.
  const isPlatformAdmin = !user?.organization_id;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeEdge('admin-stats', {});
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
        <div className="flex items-center gap-2">
          <RoleTour role="admin" />
          <NotificationBell />
          <ChangePassword />
          <Button variant="outline" onClick={() => navigate('/agent')}>Agent Panel</Button>
          <Button variant="outline" onClick={() => navigate('/assessor')}>Assessor Panel</Button>
          {user && <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>}
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4 ${isPlatformAdmin ? 'lg:grid-cols-7' : 'lg:grid-cols-6'} h-auto`}>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Overview
          </TabsTrigger>
          {isPlatformAdmin && (
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Organizations
            </TabsTrigger>
          )}
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

              {stats.usage && (() => {
                const u = stats.usage;
                const MB = 1048576;
                const mb = (b: number) => Math.round((b / MB) * 10) / 10;
                const gb = (b: number) => Math.round((b / (MB * 1024)) * 100) / 100;
                const dbPct = Math.min(100, (u.db_bytes / u.db_limit_bytes) * 100);
                const stPct = Math.min(100, (u.storage_bytes / u.storage_limit_bytes) * 100);
                const avgFile = u.storage_objects > 0 ? u.storage_bytes / u.storage_objects : 0.7 * MB;
                const filesPerTest = u.sessions > 0 && u.responses_with_audio > 0
                  ? u.responses_with_audio / u.sessions : 6;
                const perTest = Math.max(2 * MB, avgFile * filesPerTest);
                const remaining = Math.max(0, Math.floor((u.storage_limit_bytes - u.storage_bytes) / perTest));
                const orphans = Math.max(0, u.storage_objects - u.responses_with_audio);
                const barColor = (p: number) => (p >= 85 ? 'bg-red-500' : p >= 65 ? 'bg-amber-500' : 'bg-emerald-500');
                return (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Database className="h-4 w-4" /> Storage &amp; capacity
                        <Badge variant="outline" className="ml-1 capitalize">{u.plan} plan</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Audio files</span>
                          <span className="tabular-nums text-muted-foreground">{mb(u.storage_bytes)} MB / {gb(u.storage_limit_bytes)} GB ({Math.round(stPct)}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${barColor(stPct)}`} style={{ width: `${Math.max(2, stPct)}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Each test stores ~{mb(perTest)} MB of recordings — this is the main limit.</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Database</span>
                          <span className="tabular-nums text-muted-foreground">{mb(u.db_bytes)} MB / {mb(u.db_limit_bytes)} MB ({Math.round(dbPct)}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${barColor(dbPct)}`} style={{ width: `${Math.max(2, dbPct)}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">Text, results &amp; reports — grows slowly.</p>
                      </div>
                      <div className="rounded-lg bg-assessment-blue/5 p-3 text-sm">
                        <span className="font-semibold text-assessment-blue">~{remaining.toLocaleString()} more placement tests</span> fit in the remaining audio storage at the current rate.
                      </div>
                      {orphans > 20 && (
                        <p className="text-[11px] text-amber-600">
                          ~{orphans} old audio files from deleted tests are still using space — clearing them would free capacity.
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">Upgrading to Supabase Pro raises these to 8 GB database / 100 GB files.</p>
                    </CardContent>
                  </Card>
                );
              })()}
            </>
          )}
        </TabsContent>

        {/* Organizations (white-label tenants) — platform admins only */}
        {isPlatformAdmin && (
          <TabsContent value="organizations" className="mt-6">
            <OrganizationManagement />
          </TabsContent>
        )}

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
