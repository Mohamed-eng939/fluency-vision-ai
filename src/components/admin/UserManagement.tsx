import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, RefreshCw } from 'lucide-react';

interface ManagedUser {
  id: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  organization_id: string | null;
}

const ROLES = ['learner', 'assessor', 'admin'] as const;

interface UserManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

const roleBadgeClass = (role: string) =>
  role === 'admin'
    ? 'bg-purple-100 text-purple-800'
    : role === 'assessor'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-800';

/**
 * Admin-only user management: list users, change roles (learner/assessor/admin),
 * and invite assessors. Backed by the admin-manager edge function, which enforces
 * the admin check and performs the privileged writes with the service role.
 */
const UserManagement: React.FC<UserManagementProps> = ({ open, onOpenChange, currentUserId }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('assessor');
  const [inviting, setInviting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manager/list-users', { body: {} });
      if (error) throw error;
      setUsers(data?.users ?? []);
    } catch (e: any) {
      toast.error(`Failed to load users: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadUsers();
  }, [open, loadUsers]);

  const changeRole = async (userId: string, role: string) => {
    setSavingId(userId);
    const previous = users;
    setUsers((u) => u.map((x) => (x.id === userId ? { ...x, role } : x)));
    try {
      const { error } = await supabase.functions.invoke('admin-manager/set-role', {
        body: { user_id: userId, role },
      });
      if (error) throw error;
      toast.success(`Role updated to ${role}`);
    } catch (e: any) {
      setUsers(previous); // rollback optimistic update
      toast.error(`Failed to update role: ${e.message ?? e}`);
    } finally {
      setSavingId(null);
    }
  };

  const invite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Enter an email address');
      return;
    }
    setInviting(true);
    try {
      const { error } = await supabase.functions.invoke('admin-manager/invite-user', {
        body: { email: inviteEmail.trim(), role: inviteRole },
      });
      if (error) throw error;
      toast.success(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      loadUsers();
    } catch (e: any) {
      toast.error(`Invite failed: ${e.message ?? e}`);
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Management</DialogTitle>
          <DialogDescription>Create assessors and change user roles.</DialogDescription>
        </DialogHeader>

        {/* Invite a new user */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserPlus className="h-4 w-4" /> Invite a user
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="sr-only">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={invite} disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sends an email invite (requires email sending configured in Supabase Auth). Or simply
            change an existing user's role in the table below — no email needed.
          </p>
        </div>

        {/* Existing users */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Users {users.length ? `(${users.length})` : ''}</span>
          <Button variant="ghost" size="sm" onClick={loadUsers} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Change role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-sm">
                      {u.email ?? <span className="text-muted-foreground">{u.id.slice(0, 8)}…</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={roleBadgeClass(u.role)}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.id === currentUserId ? (
                        <span className="text-xs text-muted-foreground">You</span>
                      ) : (
                        <Select
                          value={u.role}
                          onValueChange={(v) => changeRole(u.id, v)}
                          disabled={savingId === u.id}
                        >
                          <SelectTrigger className="w-36 h-9">
                            {savingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserManagement;
