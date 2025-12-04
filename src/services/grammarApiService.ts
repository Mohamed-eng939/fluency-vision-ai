/**
 * Grammar Analysis API Service
 * Calls external grammar API for detailed error detection and CEFR scoring
 */

const GRAMMAR_API_URL = 'https://grammer-service-ekbs.vercel.app/grammar';

export interface GrammarApiError {
  id: string;
  offset: number;
  length: number;
  description: { en: string };
  bad: string;
  better: string[];
  type: 'grammar' | 'spelling';
}

export interface GrammarApiResponse {
  accuracy: number;      // 0-10 scale
  range: number;         // Grammar range score
  cefr: string;          // "A1", "A2", "B1", etc.
  errors: number;        // Error count
  comments: string[];    // Feedback comments
  raw: {
    result: boolean;
    errors: GrammarApiError[];
  };
}

/**
 * Analyze grammar using external API
 */
export async function analyzeGrammarWithApi(text: string): Promise<GrammarApiResponse> {
  try {
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
  } catch (error) {
    console.error('Grammar API call failed:', error);
    throw error;
  }
}

/**
 * Check if the grammar API is available
 */
export async function checkGrammarApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(GRAMMAR_API_URL, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
