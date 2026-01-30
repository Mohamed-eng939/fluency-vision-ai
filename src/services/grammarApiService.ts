/**
 * Grammar Analysis API Service
 * Calls grammar API via Edge Function proxy to avoid CORS issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface GrammarApiScores {
  accuracy: number;     // 0-1 scale
  complexity: number;   // 0-1 scale
  lexical: number;      // 0-1 scale
  structure: number;    // 0-1 scale
  final: number;        // 0-1 scale (overall)
}

export interface GrammarApiResponse {
  cefr: string;          // "A1", "A2", "B1", etc.
  scores: GrammarApiScores;
  errors: number;        // Error count
  comments: string[];    // Feedback comments
}

/**
 * Analyze grammar using Edge Function proxy
 */
export async function analyzeGrammarWithApi(text: string): Promise<GrammarApiResponse> {
  const { data, error } = await supabase.functions.invoke('grammar-proxy', {
    body: { text },
  });

  if (error) {
    throw new Error(`Grammar API error: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(`Grammar API error: ${data.error}`);
  }

  return data;
}
