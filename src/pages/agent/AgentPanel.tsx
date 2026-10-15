import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { invokeEdge } from '@/utils/edge/invokeEdge';
import { useAuth } from '@/contexts/auth';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Upload, RefreshCw, MessageCircle, FileText, Printer, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { PROGRAMS } from '@/data/programLevels';
import PerformanceReport from '@/components/reports/PerformanceReport';
import NotificationBell from '@/components/notifications/NotificationBell';
import ChangePassword from '@/components/account/ChangePassword';
import RoleTour from '@/components/onboarding/RoleTour';
import type { PerformanceReportPayload } from '@/data/report';

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  phone2: string | null;
  nationality: string | null;
  notes: string | null;
  source: string | null;
  status: string;
  token: string | null;
  session_id: string | null;
  student_user_id: string | null;
  raw: any;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-gray-100 text-gray-700' },
  link_sent: { label: 'Link sent', cls: 'bg-blue-100 text-blue-800' },
  account_created: { label: 'Signed up', cls: 'bg-indigo-100 text-indigo-800' },
  test_submitted: { label: 'Completed the test', cls: 'bg-amber-100 text-amber-800' },
  reviewed: { label: 'Reviewed', cls: 'bg-green-100 text-green-800' },
};

const GROUP_PROGRAMS = new Set(['General English', 'Conversation', 'Teens']);

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const blankLead = { name: '', phone: '', phone2: '', nationality: '', notes: '', program: '', track: '' };

const AgentPanel: React.FC = () => {
  const { user, signOut } = useAuth();
  const brand = useBrandingContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assessorByLead, setAssessorByLead] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ ...blankLead });
  const [saving, setSaving] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState<PerformanceReportPayload | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(`Failed to load leads: ${error.message}`);
    setLeads((data as Lead[]) ?? []);
    // Which tester each completed/reviewed lead is assigned to (name only).
    try {
      const { data: assessors } = await (supabase as any).rpc('agent_lead_assessors');
      const map: Record<string, string> = {};
      (assessors as any[] | null)?.forEach((r) => {
        if (r?.lead_id && r?.assessor_name) map[r.lead_id] = r.assessor_name;
      });
      setAssessorByLead(map);
    } catch { /* non-fatal — assignment column just stays blank */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.status] = (c[l.status] || 0) + 1;
    return c;
  }, [leads]);

  const addLead = async () => {
    if (!form.name.trim() && !form.phone.trim()) {
      toast.error('Enter at least a name or phone');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('leads').insert({
        agent_id: user?.id,
        organization_id: user?.organization_id ?? null,
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
        phone2: form.phone2.trim() || null,
        nationality: form.nationality.trim() || null,
        notes: form.notes.trim() || null,
        source: 'manual',
        status: 'new',
        token: crypto.randomUUID(),
        raw: { intended_program: form.program || null, intended_track: form.track || null },
      });
      if (error) throw error;
      toast.success('Lead added');
      setAddOpen(false);
      setForm({ ...blankLead });
      loadLeads();
    } catch (e: any) {
      toast.error(`Could not add lead: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const onImport = async (file: File) => {
    setImporting(true);
    try {
      const base64 = await fileToBase64(file);
      const { data, error } = await invokeEdge('leads-manager', { base64 });
      if (error) throw error;
      toast.success(`Imported ${data?.inserted ?? 0} lead(s)${data?.skipped ? `, skipped ${data.skipped}` : ''}`);
      loadLeads();
    } catch (e: any) {
      toast.error(`Import failed: ${e.message ?? e}`);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const sendWhatsApp = async (lead: Lead) => {
    setBusyId(lead.id);
    try {
      let token = lead.token;
      const patch: Record<string, unknown> = {};
      if (!token) { token = crypto.randomUUID(); patch.token = token; }
      if (lead.status === 'new') patch.status = 'link_sent';
      if (Object.keys(patch).length) {
        patch.updated_at = new Date().toISOString();
        await supabase.from('leads').update(patch).eq('id', lead.id);
      }
      const link = `${window.location.origin}/start/${token}`;
      const msg =
        `Hi ${lead.name ?? ''}! Take your ${brand.displayName} English placement test here: ${link}` +
        `\n\nمرحبًا! يمكنك إجراء اختبار تحديد المستوى في اللغة الإنجليزية من هنا: ${link}`;
      const phone = (lead.phone ?? '').replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      loadLeads();
    } finally {
      setBusyId(null);
    }
  };

  const openReport = async (lead: Lead) => {
    if (!lead.session_id) return;
    setBusyId(lead.id);
    try {
      const { data, error } = await invokeEdge('report-manager', { action: 'get', session_id: lead.session_id });
      if (error) throw error;
      if (!data?.report) { toast.info('No report has been produced for this student yet.'); return; }
      setReport(data.report as PerformanceReportPayload);
      setReportOpen(true);
    } catch (e: any) {
      toast.error(`Could not open report: ${e.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  };

  const trackOptions = form.program && !GROUP_PROGRAMS.has(form.program) ? ['Private'] : ['Private', 'Group'];

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: brand.colorPrimaryDark }}>Sales Agent</h1>
            <p className="text-sm text-muted-foreground">{brand.displayName} leads &amp; test links</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleTour role="agent" />
            <NotificationBell />
            <ChangePassword />
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        {/* Status filters — click a chip to filter the list; click again (or "All") to clear */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge
            onClick={() => setStatusFilter(null)}
            className={`cursor-pointer bg-gray-100 text-gray-700 ${statusFilter === null ? 'ring-2 ring-offset-1 ring-assessment-blue' : ''}`}
          >
            All: {leads.length}
          </Badge>
          {Object.entries(STATUS).map(([k, v]) => (
            <Badge
              key={k}
              onClick={() => setStatusFilter((cur) => (cur === k ? null : k))}
              className={`cursor-pointer ${v.cls} ${statusFilter === k ? 'ring-2 ring-offset-1 ring-assessment-blue' : ''}`}
            >
              {v.label}: {counts[k] || 0}
            </Badge>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add lead</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import sheet (.xlsx / .csv)
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); }}
          />
          <Button variant="ghost" size="sm" onClick={loadLeads} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading leads…
          </div>
        ) : leads.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            No leads yet. Add one or import your sheet to get started.
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.filter((l) => !statusFilter || l.status === statusFilter).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No leads with this status. <button className="underline" onClick={() => setStatusFilter(null)}>Show all</button>
                    </TableCell>
                  </TableRow>
                )}
                {leads.filter((l) => !statusFilter || l.status === statusFilter).map((l) => {
                  const st = STATUS[l.status] ?? { label: l.status, cls: 'bg-gray-100 text-gray-700' };
                  const intent = [l.raw?.intended_program, l.raw?.intended_track].filter(Boolean).join(' · ');
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name || '—'}</TableCell>
                      <TableCell className="text-sm">{l.phone || '—'}</TableCell>
                      <TableCell className="text-sm">{l.nationality || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{intent || '—'}</TableCell>
                      <TableCell>
                        <Badge className={st.cls}>{st.label}</Badge>
                        {assessorByLead[l.id] && (l.status === 'test_submitted' || l.status === 'reviewed') && (
                          <div className="text-[11px] text-muted-foreground mt-1">
                            Tester: {assessorByLead[l.id]}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline" size="sm"
                            onClick={() => sendWhatsApp(l)}
                            disabled={busyId === l.id || !l.phone}
                            title={l.phone ? 'Send test link on WhatsApp' : 'No phone number'}
                          >
                            <MessageCircle className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                          {l.status === 'reviewed' && l.session_id && (
                            <Button variant="default" size="sm" onClick={() => openReport(l)} disabled={busyId === l.id}>
                              <FileText className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Report</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add lead dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Phone (WhatsApp)</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+20…" /></div>
              <div><Label className="text-xs">Alt. phone</Label><Input value={form.phone2} onChange={(e) => setForm((f) => ({ ...f, phone2: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Nationality</Label><Input value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Intended program</Label>
                <Select value={form.program} onValueChange={(v) => setForm((f) => ({ ...f, program: v, track: '' }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Private / Group</Label>
                <Select value={form.track} onValueChange={(v) => setForm((f) => ({ ...f, track: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Track" /></SelectTrigger>
                  <SelectContent>
                    {trackOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.program && !GROUP_PROGRAMS.has(form.program) && (
              <p className="text-[11px] text-muted-foreground">Group is available only for General English, Conversation and Teens.</p>
            )}
            <div><Label className="text-xs">Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={addLead} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add lead'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Performance report</DialogTitle></DialogHeader>
          {report && <PerformanceReport report={report} />}
          <DialogFooter className="no-print">
            <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentPanel;
