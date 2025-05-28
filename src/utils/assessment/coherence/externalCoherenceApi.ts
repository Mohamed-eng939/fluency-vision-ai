
/**
 * External Coherence Scoring API Service
 * Integrates with FastAPI backend for SBERT and CrossEncoder coherence scoring
 */

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
 * Call SBERT coherence scoring endpoint
 */
export const getSBERTCoherenceScore = async (
  reference: string,
  response: string
): Promise<number> => {
  try {
    const requestBody: CoherenceApiRequest = {
      reference,
      response
    };

    const response = await fetch(`${API_BASE_URL}/coherence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`SBERT API request failed: ${response.status}`);
    }

    const result: CoherenceApiResponse = await response.json();
    
    // Return similarity score (0-1 range)
    return result.similarity;
  } catch (error) {
    console.error('Error calling SBERT coherence API:', error);
    throw error;
  }
};

/**
 * Call CrossEncoder coherence scoring endpoint
 */
export const getCrossEncoderCoherenceScore = async (
  reference: string,
  response: string
): Promise<number> => {
  try {
    const requestBody: CoherenceApiRequest = {
      reference,
      response
    };

    const response = await fetch(`${API_BASE_URL}/coherence-cross`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`CrossEncoder API request failed: ${response.status}`);
    }

    const result: CoherenceApiResponse = await response.json();
    
    // Return similarity score (0-1 range)
    return result.similarity;
  } catch (error) {
    console.error('Error calling CrossEncoder coherence API:', error);
    throw error;
  }
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
}> => {
  try {
    const results: {
      sbertScore?: number;
      crossScore?: number;
      averageScore: number;
      method: string;
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
