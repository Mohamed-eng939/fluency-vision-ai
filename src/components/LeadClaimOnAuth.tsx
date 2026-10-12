import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { invokeEdge } from '@/utils/edge/invokeEdge';

export const PENDING_LEAD_KEY = 'pending_lead_token';

/**
 * When a student opens a sales-agent lead link (/start/:token) and then signs
 * in or registers, this attaches their new account to the lead. The token is
 * stashed in localStorage by LeadStart; once the user is authenticated we claim
 * it via the lead-link function (service-role write) and clear it. Mounted once
 * inside the auth provider, it renders nothing.
 */
const LeadClaimOnAuth = () => {
  const { user } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (!user || handled.current) return;
    let token: string | null = null;
    try { token = localStorage.getItem(PENDING_LEAD_KEY); } catch { /* storage blocked */ }
    if (!token) return;
    handled.current = true;
    (async () => {
      try {
        await invokeEdge('lead-link', { action: 'claim', token });
      } catch { /* non-fatal: the student can still take the test */ }
      try { localStorage.removeItem(PENDING_LEAD_KEY); } catch { /* ignore */ }
    })();
  }, [user]);

  return null;
};

export default LeadClaimOnAuth;
