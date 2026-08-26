import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, KeyRound, RefreshCw, Plus, Copy, Ban } from 'lucide-react';

interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  usage_count: number | null;
}

/**
 * Admin-only API-key management for the SaaS path (external orgs calling the
 * assessment engine). Keys are created + hashed server-side (admin-api-keys
 * edge function); the plaintext is shown once and never stored.
 */
const ApiKeyManagement: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api-keys', { body: { action: 'list' } });
      if (error) throw error;
      setKeys(data?.keys ?? []);
    } catch (e: any) {
      toast.error(`Failed to load keys: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!newName.trim()) { toast.error('Enter a name for the key'); return; }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api-keys', {
        body: { action: 'create', name: newName.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSecret(data.secret);
      setNewName('');
      setNewOpen(false);
      load();
    } catch (e: any) {
      toast.error(`Create failed: ${e.message ?? e}`);
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (k: ApiKey) => {
    if (!window.confirm(`Revoke "${k.key_name}"? Any integration using it will stop working.`)) return;
    setRevokingId(k.id);
    try {
      const { error } = await supabase.functions.invoke('admin-api-keys', { body: { action: 'revoke', id: k.id } });
      if (error) throw error;
      setKeys((list) => list.map((x) => (x.id === k.id ? { ...x, is_active: false } : x)));
      toast.success('Key revoked');
    } catch (e: any) {
      toast.error(`Revoke failed: ${e.message ?? e}`);
    } finally {
      setRevokingId(null);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    try { await navigator.clipboard.writeText(secret); toast.success('Copied'); }
    catch { toast.error('Copy failed — select and copy manually'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Keys let external organizations call the assessment engine. Stored hashed — shown once at creation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-2" />New key</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No API keys yet. Create one to onboard an external client.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.key_name}</TableCell>
                  <TableCell className="font-mono text-xs">{k.key_prefix ? `${k.key_prefix}…` : '—'}</TableCell>
                  <TableCell>
                    {k.is_active
                      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      : <Badge variant="secondary">Revoked</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'never'}</TableCell>
                  <TableCell className="text-right">
                    {k.is_active && (
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => revoke(k)} disabled={revokingId === k.id} aria-label="Revoke">
                        {revokingId === k.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New API key</DialogTitle>
            <DialogDescription>Give it a name so you can identify the client later.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="key-name">Key name</Label>
            <Input id="key-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Upedia production" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={creating}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create key'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show-once secret dialog */}
      <Dialog open={!!secret} onOpenChange={(o) => !o && setSecret(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy your API key now</DialogTitle>
            <DialogDescription>This is the only time it will be shown. Store it somewhere safe.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs break-all">{secret}</code>
            <Button size="icon" variant="outline" onClick={copySecret} aria-label="Copy"><Copy className="h-4 w-4" /></Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyManagement;
