import React, { useState, useEffect, useCallback } from 'react';
import { invokeEdge } from '@/utils/edge/invokeEdge';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, RefreshCw, Trash2 } from 'lucide-react';
import { ROLE_OPTIONS, roleLabel, roleBadgeClass } from '@/data/roles';
import type { UserRole } from '@/contexts/auth/types';

interface ManagedUser {
  id: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  organization_id: string | null;
}

interface Org {
  id: string;
  name: string;
}

const GLOBAL_ORG = '__global__'; // sentinel for "no org (global/owner)"

interface UserManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

/**
 * Admin-only user management: list users, change roles, assign the tenant
 * organization, and invite users. Roles use the Upedia labels (Global Admin /
 * Tester / Student / Sales Agent); the stored role names are unchanged. Backed
 * by the admin-manager edge function, which enforces the admin check and
 * performs the privileged writes with the service role.
 */
const UserManagement: React.FC<UserManagementProps> = ({ open, onOpenChange, currentUserId }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('assessor');
  const [inviteOrg, setInviteOrg] = useState<string>('');
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const orgName = (id: string | null) => (id ? orgs.find((o) => o.id === id)?.name ?? '—' : 'Global');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, orgsRes] = await Promise.all([
        invokeEdge('admin-manager/list-users', {}),
        invokeEdge('admin-manager/list-organizations', {}),
      ]);
      if (usersRes.error) throw usersRes.error;
      setUsers(usersRes.data?.users ?? []);
      const orgList: Org[] = orgsRes.data?.organizations ?? [];
      setOrgs(orgList);
      // Default the invite org to the (single) tenant org when present.
      setInviteOrg((prev) => prev || (orgList[0]?.id ?? ''));
    } catch (e: any) {
      toast.error(`Failed to load users: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadUsers();
  }, [open, loadUsers]);

  // Patch a user's role and/or org via set-role (role is always required).
  const patchUser = async (u: ManagedUser, next: { role?: string; organization_id?: string | null }) => {
    setSavingId(u.id);
    const previous = users;
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, ...next } : x)));
    try {
      const { error } = await invokeEdge('admin-manager/set-role', {
        user_id: u.id,
        role: next.role ?? u.role,
        ...(next.organization_id !== undefined ? { organization_id: next.organization_id } : {}),
      });
      if (error) throw error;
      toast.success('User updated');
    } catch (e: any) {
      setUsers(previous);
      toast.error(`Update failed: ${e.message ?? e}`);
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
      const { error } = await invokeEdge('admin-manager/invite-user', {
        email: inviteEmail.trim(),
        role: inviteRole,
        ...(inviteOrg ? { organization_id: inviteOrg } : {}),
      });
      if (error) throw error;
      toast.success(`Invitation sent to ${inviteEmail} as ${roleLabel(inviteRole)}`);
      setInviteEmail('');
      loadUsers();
    } catch (e: any) {
      toast.error(`Invite failed: ${e.message ?? e}`);
    } finally {
      setInviting(false);
    }
  };

  const deleteUser = async (userId: string, email: string | null) => {
    if (!window.confirm(`Delete ${email || 'this user'}? This permanently removes their account. Their assessment data is kept but anonymised.`)) {
      return;
    }
    setDeletingId(userId);
    try {
      const { error } = await invokeEdge('admin-delete-user', { user_id: userId });
      if (error) throw error;
      toast.success('User deleted');
      setUsers((u) => u.filter((x) => x.id !== userId));
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message ?? e}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Management</DialogTitle>
          <DialogDescription>
            Invite users, set their role (Global Admin / Tester / Student / Sales Agent) and tenant
            organization, and remove accounts.
          </DialogDescription>
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
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {orgs.length > 0 && (
              <Select value={inviteOrg} onValueChange={setInviteOrg}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Organization" /></SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={invite} disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sends an email invite (requires email sending configured in Supabase Auth). Or simply
            change an existing user's role / organization in the table below — no email needed.
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
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm">
                        {u.email ?? <span className="text-muted-foreground">{u.id.slice(0, 8)}…</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadgeClass(u.role)}>{roleLabel(u.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">You</span>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(v) => patchUser(u, { role: v })}
                            disabled={savingId === u.id}
                          >
                            <SelectTrigger className="w-36 h-9">
                              {savingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">{orgName(u.organization_id)}</span>
                        ) : (
                          <Select
                            value={u.organization_id ?? GLOBAL_ORG}
                            onValueChange={(v) => patchUser(u, { organization_id: v === GLOBAL_ORG ? null : v })}
                            disabled={savingId === u.id}
                          >
                            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {orgs.map((o) => (
                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                              ))}
                              <SelectItem value={GLOBAL_ORG}>None (global)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteUser(u.id, u.email)}
                            disabled={deletingId === u.id}
                            aria-label="Delete user"
                          >
                            {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserManagement;
