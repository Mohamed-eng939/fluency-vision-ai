import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, AlertCircle } from 'lucide-react';

interface Resolved {
  valid: boolean;
  reason?: string;
  already_completed?: boolean;
  organization?: { id: string; name: string; branding: any };
  candidate?: { name: string | null; email: string | null };
  test_type?: string;
}

/**
 * Candidate landing for a partner handoff link: /t/:token. Resolves the invite
 * (branding + candidate), stashes the tenant brand + candidate + token in
 * sessionStorage (picked up by useBranding + AssessmentFlow), then launches the
 * assessment. The finished session is linked back to the invite in ResultsStep.
 */
const InviteEntry: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Resolved | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data: res, error } = await supabase.functions.invoke('assessment-invite', {
          body: { action: 'resolve', token },
        });
        if (error) throw error;
        setData(res as Resolved);
        if (res?.valid && res.organization) {
          sessionStorage.setItem('invite_token', token);
          sessionStorage.setItem('invite_brand', JSON.stringify({ name: res.organization.name, branding: res.organization.branding || {} }));
          sessionStorage.setItem('invite_candidate', JSON.stringify(res.candidate || {}));
        }
      } catch {
        setData({ valid: false, reason: 'error' });
      } finally {
        setLoading(false);
      }
    };
    resolve();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading your assessment…
        </div>
      </div>
    );
  }

  if (!data?.valid) {
    const msg = data?.reason === 'expired'
      ? 'This assessment link has expired. Please ask your organization for a new one.'
      : data?.reason === 'suspended'
      ? 'This assessment is currently unavailable. Please contact your organization.'
      : 'This assessment link is not valid.';
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <CardTitle>Link unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">{msg}</CardContent>
        </Card>
      </div>
    );
  }

  const b = data.organization?.branding || {};
  const orgName = b.display_name || data.organization?.name || 'English Placement';
  const primary = b.color_primary || '#1a56db';
  const firstName = (data.candidate?.name || '').trim().split(' ')[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pt-10">
          {b.logo_url
            ? <img src={b.logo_url} alt={orgName} className="h-12 mx-auto mb-4 object-contain" />
            : <div className="h-12 w-12 mx-auto mb-4 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: primary }}>{orgName.slice(0, 2).toUpperCase()}</div>}
          <CardTitle className="text-2xl">{orgName}</CardTitle>
          {b.tagline && <p className="text-sm text-muted-foreground mt-1">{b.tagline}</p>}
        </CardHeader>
        <CardContent className="text-center space-y-4 pb-10">
          <p className="text-lg">{firstName ? `Hi ${firstName},` : 'Welcome,'}</p>
          <p className="text-muted-foreground">
            You've been invited to complete a short spoken-English placement assessment.
            You'll answer a few speaking prompts using your microphone. Your results will be
            reviewed and shared with you.
          </p>
          <Button
            size="lg"
            className="text-white"
            style={{ background: primary }}
            onClick={() => navigate('/assessment')}
          >
            <Mic className="h-4 w-4 mr-2" /> Start assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteEntry;
