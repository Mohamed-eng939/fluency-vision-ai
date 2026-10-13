import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChangePasswordProps {
  /** Button look; defaults suit a dashboard header. */
  variant?: 'outline' | 'ghost' | 'default' | 'secondary';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
  /** Show the "Password" text label beside the icon (off → icon only). */
  showLabel?: boolean;
}

/**
 * In-app password change for the signed-in user. Uses supabase.auth.updateUser,
 * so it works without any email setup — letting Testers and Sales Agents move
 * off the shared temporary password immediately. Dropped into each dashboard
 * header; the session stays signed in after a successful change.
 */
const ChangePassword: React.FC<ChangePasswordProps> = ({
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
}) => {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (pw !== confirm) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success('Password updated');
      setOpen(false);
      setPw('');
      setConfirm('');
    } catch (e: any) {
      toast.error(`Could not update password: ${e?.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Change password"
        title="Change password"
      >
        <KeyRound className={`h-4 w-4 ${showLabel && size !== 'icon' ? 'sm:mr-2' : ''}`} />
        {showLabel && size !== 'icon' && <span className="hidden sm:inline">Password</span>}
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setPw(''); setConfirm(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Set a new password for your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cp-new" className="text-xs">New password</Label>
              <Input
                id="cp-new" type="password" autoComplete="new-password"
                value={pw} onChange={(e) => setPw(e.target.value)}
                placeholder="At least 6 characters"
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              />
            </div>
            <div>
              <Label htmlFor="cp-confirm" className="text-xs">Confirm new password</Label>
              <Input
                id="cp-confirm" type="password" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChangePassword;
