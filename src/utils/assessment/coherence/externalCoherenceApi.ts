
/**
 * External Coherence Scoring API Service
 * Integrates with FastAPI backend for SBERT and CrossEncoder coherence scoring
 */

import { callWithRetry } from '../apiRetryUtils';
import { generateLocalCoherenceEstimate } from '../coherenceFallback';

export interface CoherenceApiRequest {
  reference: string;
  response: string;
}

export interface CoherenceApiResponse {
  method: string;
  similarity: number;
}

const API_BASE_URL = 'https://Mohamed-eng939-lingua-coherence-api.hf.space';

/**
 * Call SBERT coherence scoring endpoint with retry logic
 */
export const getSBERTCoherenceScore = async (
  reference: string,
  response: string
): Promise<number> => {
  const makeApiCall = async () => {
    const requestBody: CoherenceApiRequest = {
      reference,
      response
    };

    const apiResponse = await fetch(`${API_BASE_URL}/coherence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(40000) // 40 second timeout
    });

    if (!apiResponse.ok) {
      throw new Error(`SBERT API request failed: ${apiResponse.status}`);
    }

    const result: CoherenceApiResponse = await apiResponse.json();
    return result.similarity;
  };

  const fallbackFn = (reason: string) => {
    const fallbackResult = generateLocalCoherenceEstimate(reference, response, reason);
    return fallbackResult.score;
  };

  const result = await callWithRetry(makeApiCall, fallbackFn);
  return result.data!;
};

/**
 * Call CrossEncoder coherence scoring endpoint with retry logic
 */
export const getCrossEncoderCoherenceScore = async (
  reference: string,
  response: string
): Promise<number> => {
  const makeApiCall = async () => {
    const requestBody: CoherenceApiRequest = {
      reference,
      response
    };

    const apiResponse = await fetch(`${API_BASE_URL}/coherence-cross`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(40000) // 40 second timeout
    });

    if (!apiResponse.ok) {
      throw new Error(`CrossEncoder API request failed: ${apiResponse.status}`);
    }

    const result: CoherenceApiResponse = await apiResponse.json();
    return result.similarity;
  };

  const fallbackFn = (reason: string) => {
    const fallbackResult = generateLocalCoherenceEstimate(reference, response, reason);
    return fallbackResult.score;
  };

  const result = await callWithRetry(makeApiCall, fallbackFn);
  return result.data!;
};

/**
 * Get coherence score using both methods and return the average
 */
export const getCoherenceScore = async (
  reference: string,
  response: string,
  method: 'sbert' | 'cross' | 'both' = 'both'
): Promise<{
  sbertScore?: number;
  crossScore?: number;
  averageScore: number;
  method: string;
  isFallback?: boolean;
  fallbackReason?: string;
}> => {
  try {
    const results: {
      sbertScore?: number;
      crossScore?: number;
      averageScore: number;
      method: string;
      isFallback?: boolean;
      fallbackReason?: string;
    } = {
      averageScore: 0,
      method: method
    };

    if (method === 'sbert' || method === 'both') {
      results.sbertScore = await getSBERTCoherenceScore(reference, response);
    }

    if (method === 'cross' || method === 'both') {
      results.crossScore = await getCrossEncoderCoherenceScore(reference, response);
    }

    // Calculate average score
    if (method === 'both' && results.sbertScore !== undefined && results.crossScore !== undefined) {
      results.averageScore = (results.sbertScore + results.crossScore) / 2;
    } else if (results.sbertScore !== undefined) {
      results.averageScore = results.sbertScore;
    } else if (results.crossScore !== undefined) {
      results.averageScore = results.crossScore;
    }

    return results;
  } catch (error) {
    console.error('Error getting coherence score:', error);
    throw error;
  }
};

/**
 * Test the coherence API with sample data
 */
export const testCoherenceApi = async (): Promise<boolean> => {
  try {
    const testData = {
      reference: "Tell me about your hometown.",
      response: "I come from Cairo. It is a very big city in Egypt."
    };

    console.log('Testing coherence API with:', testData);
    
    const result = await getCoherenceScore(testData.reference, testData.response, 'both');
    
    console.log('Coherence API test result:', result);
    
    return true;
  } catch (error) {
    console.error('Coherence API test failed:', error);
    return false;
  }
};
