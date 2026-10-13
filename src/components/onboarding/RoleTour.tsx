import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import type { UserRole } from '@/contexts/auth/types';
import { TOURS } from './tours';

interface RoleTourProps {
  /** The dashboard this tour explains. */
  role: UserRole;
  showButton?: boolean;
}

const seenKey = (role: string) => `upedia_tour_${role}_seen`;

/**
 * First-login walkthrough for a dashboard. Auto-opens once for a user whose own
 * role matches this dashboard (remembered per browser), and is always
 * re-openable via the "Guide" button. Skippable at any step.
 */
const RoleTour: React.FC<RoleTourProps> = ({ role, showButton = true }) => {
  const { user } = useAuth();
  const brand = useBrandingContext();
  const tour = TOURS[role];
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  // Auto-open once, only for a user actually in this role.
  useEffect(() => {
    if (!tour || !user || user.role !== role) return;
    let seen = false;
    try { seen = localStorage.getItem(seenKey(role)) === 'seen'; } catch { /* ignore */ }
    if (seen) return;
    const t = setTimeout(() => { setI(0); setOpen(true); }, 700);
    return () => clearTimeout(t);
  }, [tour, user, role]);

  const markSeen = () => { try { localStorage.setItem(seenKey(role), 'seen'); } catch { /* ignore */ } };
  const close = () => { setOpen(false); markSeen(); };

  if (!tour) return null;
  const last = i >= tour.steps.length - 1;
  const step = tour.steps[i];

  return (
    <>
      {showButton && (
        <Button
          variant="outline" size="sm"
          onClick={() => { setI(0); setOpen(true); }}
          aria-label="Open guide" title="How this works"
        >
          <HelpCircle className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Guide</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) close(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: brand.colorPrimary }}>
                {brand.initials}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tour.title}</span>
            </div>
            <DialogTitle style={{ color: brand.colorPrimaryDark }}>{step.title}</DialogTitle>
          </DialogHeader>

          <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            {tour.steps.map((_, idx) => (
              <span
                key={idx}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: idx === i ? 18 : 6,
                  background: idx === i ? brand.colorPrimary : '#cbd5e1',
                }}
              />
            ))}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
            <Button variant="ghost" size="sm" onClick={close}>Skip</Button>
            <div className="flex items-center gap-2">
              {i > 0 && (
                <Button variant="outline" size="sm" onClick={() => setI((n) => Math.max(0, n - 1))}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              {last ? (
                <Button size="sm" onClick={close}>Got it</Button>
              ) : (
                <Button size="sm" onClick={() => setI((n) => Math.min(tour.steps.length - 1, n + 1))}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleTour;
