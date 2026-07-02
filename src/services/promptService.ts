import { supabase } from '@/integrations/supabase/client';
import { SpeakingPrompt } from '@/types/assessment';
import { speakingPrompts } from '@/data/speaking/promptData';

type DbPromptType = 'speaking' | 'read_aloud' | 'conversation';
type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

function cefrToDifficulty(level: CefrLevel): 'beginner' | 'intermediate' | 'advanced' {
  if (level === 'A1' || level === 'A2') return 'beginner';
  if (level === 'B1' || level === 'B2') return 'intermediate';
  return 'advanced';
}

function promptTypeToCategory(type: DbPromptType): SpeakingPrompt['category'] {
  if (type === 'read_aloud') return 'read_aloud';
  return 'describe';
}

function mapDbRowToPrompt(row: {
  id: string;
  content: string;
  instructions: string | null;
  cefr_level: string;
  expected_duration: number | null;
  audio_url: string | null;
  type: string;
}): SpeakingPrompt {
  const cefrLevel = row.cefr_level as CefrLevel;
  const type = row.type as DbPromptType;
  return {
    id: row.id,
    text: row.content,
    hint: row.instructions ?? undefined,
    cefrLevel,
    timeLimit: row.expected_duration ?? 60,
    audioUrl: row.audio_url ?? undefined,
    isReadAloud: type === 'read_aloud',
    category: promptTypeToCategory(type),
    difficulty: cefrToDifficulty(cefrLevel),
  };
}

export async function fetchPromptsFromSupabase(): Promise<SpeakingPrompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, content, instructions, cefr_level, expected_duration, audio_url, type')
    .eq('is_active', true)
    // Only load the original assessment prompts (not the placement-ladder ones)
    .not('title', 'like', 'Placement ·%')
    .order('cefr_level')
    .order('title');

  if (error) {
    console.warn('[promptService] Supabase fetch failed, falling back to local prompts:', error.message);
    return speakingPrompts;
  }

  if (!data || data.length === 0) {
    console.warn('[promptService] No prompts returned from Supabase, falling back to local prompts');
    return speakingPrompts;
  }

  return data.map(mapDbRowToPrompt);
}

export async function fetchPlacementPromptsFromSupabase(): Promise<SpeakingPrompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, content, instructions, cefr_level, expected_duration, audio_url, type')
    .eq('is_active', true)
    .like('title', 'Placement ·%')
    .order('cefr_level')
    .order('title');

  if (error || !data || data.length === 0) {
    return [];
  }

  return data.map(mapDbRowToPrompt);
}
