import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Download, Database } from 'lucide-react';
import { toCsv, downloadCsv } from '@/utils/admin/exportCsv';

interface TrainingRow {
  id: string;
  response_id: string | null;
  prompt_text: string | null;
  transcript: string | null;
  user_response: string | null;
  scores: Record<string, unknown> | null;
  assessor_feedback: string | null;
  quality_rating: number | null;
  created_at: string;
}

const short = (s: string | null, n = 90) =>
  !s ? '' : s.length > n ? `${s.slice(0, n)}…` : s;

/**
 * Admin-only viewer for the `training_data` table — the human-reviewed dataset
 * that will feed the ML flywheel. Reads via the admin RLS policy. Rows are
 * captured automatically when an assessor submits a review (see the assessor
 * review flow). Includes a CSV export for offline analysis / model training.
 */
const TrainingDataViewer: React.FC = () => {
  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_data')
        .select('id, response_id, prompt_text, transcript, user_response, scores, assessor_feedback, quality_rating, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRows((data ?? []) as TrainingRow[]);
    } catch (e: any) {
      toast.error(`Failed to load training data: ${e.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const exportCsv = () => {
    if (!rows.length) { toast.error('Nothing to export yet'); return; }
    const flat = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      prompt_text: r.prompt_text ?? '',
      transcript: r.transcript ?? r.user_response ?? '',
      system_cefr: (r.scores as any)?.system_cefr ?? '',
      human_cefr: (r.scores as any)?.human_cefr ?? '',
      is_overridden: (r.scores as any)?.is_overridden ?? '',
      scores: r.scores ? JSON.stringify(r.scores) : '',
      assessor_feedback: r.assessor_feedback ?? '',
      quality_rating: r.quality_rating ?? '',
    }));
    downloadCsv(`training-data-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(flat));
    toast.success(`Exported ${flat.length} rows`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Training Datasets</h3>
          <p className="text-sm text-muted-foreground">
            Human-vs-system labels captured on each assessor review — the data that will train the model.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No training rows yet.</p>
          <p className="text-xs">One row is written automatically each time an assessor approves or overrides a result.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Transcript</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Human</TableHead>
                <TableHead>Overridden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const s = (r.scores ?? {}) as any;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{short(r.prompt_text)}</TableCell>
                    <TableCell className="text-sm max-w-[240px] truncate">{short(r.transcript ?? r.user_response)}</TableCell>
                    <TableCell>{s.system_cefr ? <Badge variant="outline">{s.system_cefr}</Badge> : '—'}</TableCell>
                    <TableCell>{s.human_cefr ? <Badge variant="secondary">{s.human_cefr}</Badge> : '—'}</TableCell>
                    <TableCell>
                      {s.is_overridden === true ? <Badge className="bg-amber-100 text-amber-800">Yes</Badge> : s.is_overridden === false ? <span className="text-xs text-muted-foreground">No</span> : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TrainingDataViewer;
