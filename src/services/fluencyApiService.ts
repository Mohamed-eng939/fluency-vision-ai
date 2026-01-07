/**
 * Fluency Analysis API Service
 * Calls external fluency API for CEFR scoring based on speech patterns
 */

const FLUENCY_API_URL = 'https://fluency-service-v3xh.vercel.app/evaluate';

export interface FluencyApiRequest {
  transcript: string;
  duration_seconds: number;
}

export interface FluencyApiResponse {
  syllables: number;
  spm: number;  // Syllables per minute
  cefr_level: string;  // "A1", "A2", "B1", etc.
}

/**
 * Analyze fluency using external API
 */
export async function analyzeFluencyWithApi(
  transcript: string,
  durationSeconds: number
): Promise<FluencyApiResponse> {
  const response = await fetch(FLUENCY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      duration_seconds: durationSeconds,
    }),
  });

  if (!response.ok) {
    throw new Error(`Fluency API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
