import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Building2, Plus, RefreshCw, Pencil, KeyRound, Copy, Ban, Trash2 } from 'lucide-react';

const PLANS = ['trial', 'starter', 'growth', 'enterprise'] as const;
const STATUSES = ['active', 'trial', 'suspended'] as const;

interface Org {
  id: string;
  name: string;
  branding: any;
  slug: string | null;
  custom_domain: string | null;
  plan: string;
  status: string;
  assessment_quota: number;
  assessments_used: number;
  renews_at: string | null;
  created_at: string;
}

interface OrgKey {
  id: string;
  key_name: string;
  key_prefix: string | null;
  is_active: boolean;
  created_at: string;
}

type Draft = {
  id?: string;
  name: string;
  tagline: string;
  logo_url: string;
  color_primary: string;
  color_accent: string;
  slug: string;
  custom_domain: string;
  plan: string;
  status: string;
  assessment_quota: number;
  assessments_used: number;
  renews_at: string;
};

const emptyDraft: Draft = {
  name: '', tagline: '', logo_url: '', color_primary: '#1a56db', color_accent: '#0694a2',
  slug: '', custom_domain: '', plan: 'trial', status: 'active', assessment_quota: 0, assessments_used: 0, renews_at: '',
};

const statusColor = (s: string) =>
  s === 'active' ? 'bg-green-100 text-green-800' : s === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Super-admin console for onboarding & managing white-label tenants
 * (organizations). One row = one partner. Per org: branding (name/logo/colors),
 * domain (subdomain slug / custom domain), API keys (per-tenant), and
 * subscription (plan / quota / status / renewal). Branding is read at app boot
 * by useBranding, so filling it here re-skins that tenant's assessment.
 */
const OrganizationManagement: React.FC = () => {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  // API keys (for the org being edited)
  const [keys, setKeys] = useState<OrgKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, branding, slug, custom_domain, plan, status, assessment_quota, assessments_used, renews_at, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrgs((data as any) ?? []);
    } catch (e: any) {
      toast.error(`Failed to load organizations: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadKeys = useCallback(async (orgId: string) => {
    setKeysLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api-keys', {
        body: { action: 'list', organization_id: orgId },
      });
      if (error) throw error;
      setKeys(data?.keys ?? []);
    } catch (e: any) {
      toast.error(`Failed to load keys: ${e.message ?? e}`);
    } finally {
      setKeysLoading(false);
    }
  }, []);

  const openNew = () => { setDraft(emptyDraft); setKeys([]); setOpen(true); };

  const openEdit = (o: Org) => {
    const b = o.branding || {};
    setDraft({
      id: o.id,
      name: b.display_name || o.name || '',
      tagline: b.tagline || '',
      logo_url: b.logo_url || '',
      color_primary: b.color_primary || '#1a56db',
      color_accent: b.color_accent || '#0694a2',
      slug: o.slug || '',
      custom_domain: o.custom_domain || '',
      plan: o.plan || 'trial',
      status: o.status || 'active',
      assessment_quota: o.assessment_quota || 0,
      assessments_used: o.assessments_used || 0,
      renews_at: o.renews_at ? o.renews_at.slice(0, 10) : '',
    });
    setOpen(true);
    loadKeys(o.id);
  };

  const uploadLogo = async (file: File) => {
    try {
      const path = `${draft.id || 'new'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('branding').getPublicUrl(path);
      setDraft((d) => ({ ...d, logo_url: data.publicUrl }));
      toast.success('Logo uploaded');
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message ?? e}. You can paste a logo URL instead.`);
    }
  };

  const save = async () => {
    if (!draft.name.trim()) { toast.error('Organization name is required'); return; }
    setSaving(true);
    try {
      const branding = {
        display_name: draft.name.trim(),
        tagline: draft.tagline.trim() || null,
        logo_url: draft.logo_url.trim() || null,
        color_primary: draft.color_primary,
        color_primary_dark: draft.color_primary,
        color_accent: draft.color_accent,
      };
      const row: any = {
        name: draft.name.trim(),
        branding,
        slug: draft.slug.trim() ? slugify(draft.slug) : slugify(draft.name),
        custom_domain: draft.custom_domain.trim() || null,
        plan: draft.plan,
        status: draft.status,
        assessment_quota: Number(draft.assessment_quota) || 0,
        renews_at: draft.renews_at || null,
      };
      if (draft.id) {
        const { error } = await supabase.from('organizations').update(row).eq('id', draft.id);
        if (error) throw error;
        toast.success('Organization updated');
      } else {
        const { error } = await supabase.from('organizations').insert(row);
        if (error) throw error;
        toast.success('Organization created');
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(`Save failed: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const createKey = async () => {
    if (!draft.id) { toast.error('Save the organization first, then create keys'); return; }
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    setCreatingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-api-keys', {
        body: { action: 'create', name: newKeyName.trim(), organization_id: draft.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSecret(data.secret);
      setNewKeyName('');
      loadKeys(draft.id);
    } catch (e: any) {
      toast.error(`Create key failed: ${e.message ?? e}`);
    } finally {
      setCreatingKey(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!window.confirm('Revoke this key? Integrations using it will stop working.')) return;
    try {
      const { error } = await supabase.functions.invoke('admin-api-keys', { body: { action: 'revoke', id } });
      if (error) throw error;
      setKeys((k) => k.map((x) => (x.id === id ? { ...x, is_active: false } : x)));
      toast.success('Key revoked');
    } catch (e: any) {
      toast.error(`Revoke failed: ${e.message ?? e}`);
    }
  };

  const copySecret = async () => {
    if (!secret) return;
    try { await navigator.clipboard.writeText(secret); toast.success('Copied'); }
    catch { toast.error('Copy failed — select manually'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Organizations</h3>
          <p className="text-sm text-muted-foreground">
            White-label tenants. Set branding, domain, API keys and subscription per partner.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New organization</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No organizations yet. Add your first tenant to onboard a partner.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((o) => {
                const b = o.branding || {};
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {b.logo_url
                          ? <img src={b.logo_url} alt="" className="h-6 w-6 rounded object-contain bg-muted" />
                          : <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold">{(o.name || '?').slice(0, 2).toUpperCase()}</div>}
                        <span className="font-medium">{b.display_name || o.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.custom_domain || (o.slug ? `${o.slug}.assess…` : '—')}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{o.plan}</Badge></TableCell>
                    <TableCell><Badge className={`${statusColor(o.status)} capitalize`}>{o.status}</Badge></TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {o.assessments_used}{o.assessment_quota ? ` / ${o.assessment_quota}` : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(o)} aria-label="Manage">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Editor */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Manage organization' : 'New organization'}</DialogTitle>
            <DialogDescription>Branding, domain, API keys and subscription for this tenant.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Branding */}
            <section className="space-y-3">
              <h4 className="text-sm font-semibold">Branding</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="o-name">Display name</Label>
                  <Input id="o-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Upedia" />
                </div>
                <div>
                  <Label htmlFor="o-tag">Tagline (optional)</Label>
                  <Input id="o-tag" value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="English placement" />
                </div>
              </div>
              <div>
                <Label htmlFor="o-logo">Logo</Label>
                <div className="flex items-center gap-2">
                  {draft.logo_url && <img src={draft.logo_url} alt="" className="h-9 w-9 rounded object-contain bg-muted" />}
                  <Input id="o-logo" value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="Paste a logo URL, or upload →" />
                  <label className="shrink-0">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                    <span className="inline-flex items-center h-9 px-3 rounded-md border cursor-pointer text-sm hover:bg-muted">Upload</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="o-primary">Primary color</Label>
                  <Input id="o-primary" type="color" value={draft.color_primary} onChange={(e) => setDraft({ ...draft, color_primary: e.target.value })} className="h-9 w-full p-1" />
                </div>
                <div>
                  <Label htmlFor="o-accent">Accent color</Label>
                  <Input id="o-accent" type="color" value={draft.color_accent} onChange={(e) => setDraft({ ...draft, color_accent: e.target.value })} className="h-9 w-full p-1" />
                </div>
              </div>
            </section>

            {/* Domain */}
            <section className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Domain</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="o-slug">Subdomain slug</Label>
                  <Input id="o-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="upedia" />
                  <p className="text-[11px] text-muted-foreground mt-1">→ {slugify(draft.slug || draft.name) || 'slug'}.assess.yourdomain.com</p>
                </div>
                <div>
                  <Label htmlFor="o-domain">Custom domain (optional)</Label>
                  <Input id="o-domain" value={draft.custom_domain} onChange={(e) => setDraft({ ...draft, custom_domain: e.target.value })} placeholder="assessment.upedia.com" />
                </div>
              </div>
            </section>

            {/* Subscription */}
            <section className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Subscription</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Plan</Label>
                  <Select value={draft.plan} onValueChange={(v) => setDraft({ ...draft, plan: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="o-quota">Assessment quota (0 = unlimited)</Label>
                  <Input id="o-quota" type="number" min={0} value={draft.assessment_quota} onChange={(e) => setDraft({ ...draft, assessment_quota: Number(e.target.value) })} />
                  {draft.id && <p className="text-[11px] text-muted-foreground mt-1">Used: {draft.assessments_used}</p>}
                </div>
                <div>
                  <Label htmlFor="o-renews">Renews on</Label>
                  <Input id="o-renews" type="date" value={draft.renews_at} onChange={(e) => setDraft({ ...draft, renews_at: e.target.value })} />
                </div>
              </div>
            </section>

            {/* API keys (existing org only) */}
            <section className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> API keys</h4>
              {!draft.id ? (
                <p className="text-sm text-muted-foreground">Save the organization first to generate keys.</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key name (e.g. Production)" />
                    <Button onClick={createKey} disabled={creatingKey}>
                      {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                    </Button>
                  </div>
                  {keysLoading ? (
                    <div className="flex items-center py-3 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading keys…</div>
                  ) : keys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No keys yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {keys.map((k) => (
                        <div key={k.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{k.key_name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{k.key_prefix}…</span>
                            {k.is_active
                              ? <Badge className="bg-green-100 text-green-800">Active</Badge>
                              : <Badge variant="secondary">Revoked</Badge>}
                          </div>
                          {k.is_active && (
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => revokeKey(k.id)} aria-label="Revoke">
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save organization'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show-once key secret */}
      <Dialog open={!!secret} onOpenChange={(o) => !o && setSecret(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy this API key now</DialogTitle>
            <DialogDescription>It is shown only once. Give it to the partner to authenticate their requests.</DialogDescription>
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

export default OrganizationManagement;
