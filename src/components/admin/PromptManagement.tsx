import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';

const TYPES = ['speaking', 'read_aloud', 'conversation'] as const;
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface Prompt {
  id: string;
  title: string;
  content: string;
  instructions: string | null;
  type: string;
  cefr_level: string;
  expected_duration: number | null;
  is_active: boolean;
  created_at: string;
}

type Draft = {
  id?: string;
  title: string;
  content: string;
  instructions: string;
  type: string;
  cefr_level: string;
  expected_duration: number;
  is_active: boolean;
};

const emptyDraft: Draft = {
  title: '',
  content: '',
  instructions: '',
  type: 'speaking',
  cefr_level: 'B1',
  expected_duration: 60,
  is_active: true,
};

/**
 * Admin-only management of the `prompts` table (the questions learners are
 * tested on). Writes go directly through the admin RLS policy
 * ("Admins can manage all prompts"). When this table is empty the app falls
 * back to bundled prompts, so adding rows here takes over the live test.
 */
const PromptManagement: React.FC = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('id, title, content, instructions, type, cefr_level, expected_duration, is_active, created_at')
        .order('cefr_level')
        .order('title');
      if (error) throw error;
      setPrompts(data ?? []);
    } catch (e: any) {
      toast.error(`Failed to load prompts: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setDraft(emptyDraft); setDialogOpen(true); };
  const openEdit = (p: Prompt) => {
    setDraft({
      id: p.id,
      title: p.title,
      content: p.content,
      instructions: p.instructions ?? '',
      type: p.type,
      cefr_level: p.cefr_level,
      expected_duration: p.expected_duration ?? 60,
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        content: draft.content.trim(),
        instructions: draft.instructions.trim() || null,
        type: draft.type,
        cefr_level: draft.cefr_level,
        expected_duration: Number(draft.expected_duration) || 60,
        is_active: draft.is_active,
      };
      if (draft.id) {
        const { error } = await supabase.from('prompts').update(payload).eq('id', draft.id);
        if (error) throw error;
        toast.success('Prompt updated');
      } else {
        const { error } = await supabase.from('prompts').insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
        toast.success('Prompt created');
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(`Save failed: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Prompt) => {
    setBusyId(p.id);
    setPrompts((list) => list.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)));
    try {
      const { error } = await supabase.from('prompts').update({ is_active: !p.is_active }).eq('id', p.id);
      if (error) throw error;
    } catch (e: any) {
      setPrompts((list) => list.map((x) => (x.id === p.id ? { ...x, is_active: p.is_active } : x)));
      toast.error(`Failed: ${e.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: Prompt) => {
    if (!window.confirm(`Delete prompt "${p.title}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      const { error } = await supabase.from('prompts').delete().eq('id', p.id);
      if (error) throw error;
      setPrompts((list) => list.filter((x) => x.id !== p.id));
      toast.success('Prompt deleted');
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assessment Prompts</h3>
          <p className="text-sm text-muted-foreground">
            The questions shown during a test. If none are active here, the app uses its built-in prompts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add prompt</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading prompts…
        </div>
      ) : prompts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No prompts yet. The live test is running on the built-in fallback set — add prompts here to take control.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>CEFR</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[280px]">
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.content}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{p.cefr_level}</Badge></TableCell>
                  <TableCell className="text-sm">{p.expected_duration ?? 60}s</TableCell>
                  <TableCell>
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} disabled={busyId === p.id} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => remove(p)} disabled={busyId === p.id} aria-label="Delete">
                      {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit prompt' : 'New prompt'}</DialogTitle>
            <DialogDescription>Prompts marked active are used in live tests.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="p-title">Title</Label>
              <Input id="p-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Describe your hometown" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>CEFR</Label>
                <Select value={draft.cefr_level} onValueChange={(v) => setDraft({ ...draft, cefr_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-dur">Seconds</Label>
                <Input id="p-dur" type="number" min={10} value={draft.expected_duration} onChange={(e) => setDraft({ ...draft, expected_duration: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label htmlFor="p-content">Prompt content (shown to the learner)</Label>
              <Textarea id="p-content" rows={3} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="p-instr">Instructions / hint (optional)</Label>
              <Textarea id="p-instr" rows={2} value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="p-active" checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
              <Label htmlFor="p-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptManagement;
