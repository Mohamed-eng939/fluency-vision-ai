import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import ChangePassword from '@/components/account/ChangePassword';
import RoleTour from '@/components/onboarding/RoleTour';

const statusMeta = (status: string, reviewed: boolean) => {
  if (reviewed) return { label: 'Reviewed', cls: 'bg-green-100 text-green-800', Icon: CheckCircle };
  if (status === 'completed' || status === 'under_review')
    return { label: 'Under review', cls: 'bg-yellow-100 text-yellow-800', Icon: Clock };
  return { label: status || 'In progress', cls: 'bg-gray-100 text-gray-700', Icon: Clock };
};

/**
 * The signed-in student's own assessments. RLS scopes the query to their rows
 * (user_id = auth.uid()), so a student only ever sees their own results and can
 * open the performance report their tester produced.
 */
const MyResults: React.FC = () => {
  const { user, loading } = useAuth();
  const brand = useBrandingContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      setBusy(true);
      const { data } = await supabase
        .from('assessment_sessions')
        .select('id, created_at, status, overall_cefr_level, program, program_subtrack, upedia_level, reviewed_at')
        .order('created_at', { ascending: false });
      setRows(data || []);
      setBusy(false);
    })();
  }, [user, loading, navigate]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: brand.colorPrimaryDark }}>
              My Results
            </h1>
            <p className="text-sm text-muted-foreground">Your {brand.displayName} assessments and reports</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleTour role="learner" />
            <ChangePassword />
            <Link to="/assessment">
              <Button variant="outline">Take a new test</Button>
            </Link>
          </div>
        </div>

        {busy ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">You haven't taken an assessment yet.</p>
              <Link to="/assessment">
                <Button>Start your assessment</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((s) => {
              const reviewed = !!s.reviewed_at || s.status === 'approved' || s.status === 'rejected';
              const meta = statusMeta(s.status, reviewed);
              const placement = [s.program, s.program_subtrack].filter(Boolean).join(' · ');
              return (
                <Card key={s.id}>
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={meta.cls}>
                          <meta.Icon className="mr-1 h-3 w-3" />
                          {meta.label}
                        </Badge>
                        {reviewed && s.overall_cefr_level && (
                          <Badge variant="outline">CEFR {s.overall_cefr_level}</Badge>
                        )}
                        {reviewed && s.upedia_level && (
                          <Badge variant="outline">Level {s.upedia_level}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fmt(s.created_at)}
                        {placement ? ` — ${placement}` : ''}
                      </p>
                    </div>
                    <Button
                      variant={reviewed ? 'default' : 'outline'}
                      onClick={() => navigate(`/results?sessionId=${s.id}`)}
                    >
                      {reviewed ? 'View report' : 'View status'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResults;
