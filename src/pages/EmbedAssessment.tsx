import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { inviteSession } from '@/data/assessment/inviteSession';
import AssessmentFlow from '@/components/assessment/AssessmentFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

/**
 * Chromeless, login-free assessment surface for partner embedding (iframe).
 *
 * The partner's user is already signed in to the partner's own system, so we
 * must NOT show our login/sign-up. This route resolves the invite token, stores
 * the partner-supplied candidate + the tenant's brand in a storage-independent
 * carrier (works inside partitioned iframes), and runs the test directly — no
 * account, no owner branding. The candidate is still fully identified by the
 * partner's data, so the tester sees who it is. On finish the session links back
 * to the invite, so the partner fetches the result via their external_id.
 */
const EmbedAssessment: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [reason, setReason] = useState('This assessment link is not valid.');

  // A microphone (and secure crypto) only work in a "secure context". An HTTPS
  // iframe inside a NON-secure (http://) parent page is itself not secure, so
  // recording is blocked here. Rather than fail silently, offer to re-open the
  // test as its own top-level HTTPS tab, where it IS a secure context.
  const insecureEmbed = typeof window !== 'undefined' && window.isSecureContext === false;

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('assessment-invite', {
          body: { action: 'resolve', token },
        });
        if (cancelled) return;
        if (error || !data?.valid) {
          setReason(
            data?.reason === 'expired' ? 'This assessment link has expired. Please request a new one.'
            : data?.reason === 'suspended' ? 'This assessment is currently unavailable.'
            : 'This assessment link is not valid.',
          );
          setState('invalid');
          return;
        }
        // Storage-independent handoff (survives inside the iframe). Best-effort
        // sessionStorage too, in case the browser allows it.
        const brandRow = data.organization
          ? { name: data.organization.name, branding: data.organization.branding || {} }
          : null;
        inviteSession.set({ token: token!, candidate: data.candidate || {}, brandRow });
        try {
          sessionStorage.setItem('invite_token', token!);
          if (brandRow) sessionStorage.setItem('invite_brand', JSON.stringify(brandRow));
          sessionStorage.setItem('invite_candidate', JSON.stringify(data.candidate || {}));
        } catch { /* storage blocked in iframe — the carrier covers it */ }
        setState('ready');
      } catch {
        if (!cancelled) { setReason('Could not load the assessment. Please try again.'); setState('invalid'); }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (insecureEmbed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ExternalLink className="mx-auto mb-2 h-10 w-10 text-primary" />
            <CardTitle>Open the test in a new tab</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground space-y-4">
            <p>
              Your microphone can't be used while the test is embedded on a non‑secure
              (http://) page. Open it in its own tab to continue — your details carry over
              automatically.
            </p>
            <Button asChild>
              <a href={window.location.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open the test in a new tab
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" /> Loading your assessment…
        </div>
      </div>
    );
  }

  if (state === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto mb-2 h-10 w-10 text-amber-500" />
            <CardTitle>Link unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">{reason}</CardContent>
        </Card>
      </div>
    );
  }

  // Chromeless — no app header, no sign-in; AssessmentFlow detects the invite
  // (via inviteSession) and skips all auth UI.
  return (
    <div className="min-h-screen bg-background">
      <AssessmentFlow onTakeFullAssessment={() => {}} />
    </div>
  );
};

export default EmbedAssessment;
