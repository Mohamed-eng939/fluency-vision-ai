import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { invokeEdge } from '@/utils/edge/invokeEdge';
import { PENDING_LEAD_KEY } from '@/components/LeadClaimOnAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, AlertCircle } from 'lucide-react';

/**
 * Landing page for a sales-agent lead link (/start/:token). Resolves the lead's
 * token for a friendly greeting, remembers it so the student's account is
 * attached after sign-up (LeadClaimOnAuth), then routes them into the test.
 */
const LeadStart: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const brand = useBrandingContext();
  const [state, setState] = useState<'loading' | 'ok' | 'invalid'>('loading');
  const [name, setName] = useState('');

  // Resolve the token (public) and stash it for post-sign-up claiming.
  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    try { localStorage.setItem(PENDING_LEAD_KEY, token); } catch { /* storage blocked */ }
    (async () => {
      const { data, error } = await supabase.functions.invoke('lead-link', {
        body: { action: 'resolve', token },
      });
      if (error || !data?.ok) { setState('invalid'); return; }
      setName(data.lead?.name ?? '');
      setState('ok');
    })();
  }, [token]);

  // Already signed in → claim now and go straight to the assessment.
  useEffect(() => {
    if (loading || state !== 'ok' || !user || !token) return;
    (async () => {
      try { await invokeEdge('lead-link', { action: 'claim', token }); } catch { /* non-fatal */ }
      try { localStorage.removeItem(PENDING_LEAD_KEY); } catch { /* ignore */ }
      navigate('/assessment', { replace: true });
    })();
  }, [user, loading, state, token, navigate]);

  if (state === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading…
      </div>
    );
  }

  if (state === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md">
          <CardContent className="space-y-3 py-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <p className="font-medium">This link isn’t valid or has expired.</p>
            <p className="text-sm text-muted-foreground">Please ask your {brand.displayName} representative for a new link.</p>
            <Button variant="outline" onClick={() => navigate('/')}>Go to {brand.displayName}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not signed in → welcome + route into registration (token is remembered).
  return (
    <div className="flex min-h-screen items-center justify-center px-4"
      style={{ background: `linear-gradient(135deg, ${brand.colorTint}, #fff)` }}>
      <Card className="max-w-md w-full border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white"
            style={{ background: brand.colorPrimary }}>
            <Mic className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl" style={{ color: brand.colorPrimaryDark }}>
            {name ? `Welcome, ${name}!` : `Welcome to ${brand.displayName}`}
          </CardTitle>
          <CardDescription>
            You’ve been invited to take the {brand.displayName} English placement test. Create your
            account to begin — it takes about 15–20 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => navigate('/login?tab=register')} style={{ background: brand.colorPrimary }}>
            Create account &amp; start
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            I already have an account
          </Button>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          {brand.tagline}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LeadStart;
