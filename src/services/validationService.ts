import { supabase } from '@/integrations/supabase/client';
import {
  computeAgreement,
  AgreementRecord,
  AgreementStats,
} from '@/lib/validation/agreement';

/**
 * Validation service — fetches the captured human-vs-system labels and computes
 * agreement stats. The math lives in `@/lib/validation/agreement` (pure); this
 * is only the data-access seam.
 *
 * ⚠️ Security note: `training_data` is ML/PII-adjacent. The security runbook
 * (Step 1a) revokes direct `anon`/`authenticated` access to it. Once that
 * migration is applied this client-side read will (correctly) stop working, and
 * this fetch should move behind an admin-only edge function that uses the
 * service role. The pure `computeAgreement` logic is unaffected by that move.
 */

interface TrainingScores {
  system_cefr?: string | null;
  human_cefr?: string | null;
  is_overridden?: boolean;
}

export async function fetchAgreementStats(organizationId?: string): Promise<AgreementStats> {
  let query = supabase.from('training_data').select('scores, organization_id');
  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[validationService] Could not read training_data:', error.message);
    return computeAgreement([]);
  }

  const records: AgreementRecord[] = (data ?? []).map((row) => {
    const scores = (row.scores ?? {}) as TrainingScores;
    return {
      systemCefr: scores.system_cefr ?? null,
      humanCefr: scores.human_cefr ?? null,
      isOverridden: !!scores.is_overridden,
    };
  });

  return computeAgreement(records);
}

export type { AgreementStats } from '@/lib/validation/agreement';
