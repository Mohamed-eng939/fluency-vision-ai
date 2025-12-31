/**
 * Grammar Analysis API Service
 * Calls external grammar API for detailed error detection and CEFR scoring
 */

const GRAMMAR_API_URL = 'https://grammer-service-gb41.vercel.app/grammar';

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
 * Analyze grammar using external API
 */
export async function analyzeGrammarWithApi(text: string): Promise<GrammarApiResponse> {
  const response = await fetch(GRAMMAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Grammar API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
