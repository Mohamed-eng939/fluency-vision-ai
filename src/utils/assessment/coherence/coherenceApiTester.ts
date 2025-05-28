
/**
 * Test utility for the external coherence API
 */

import { testCoherenceApi, getCoherenceScore } from './externalCoherenceApi';

/**
 * Run comprehensive tests for the coherence API
 */
export const runCoherenceApiTests = async (): Promise<{
  success: boolean;
  results: any[];
  errors: string[];
}> => {
  const results: any[] = [];
  const errors: string[] = [];
  let success = true;

  // Test cases
  const testCases = [
    {
      name: "Basic hometown test",
      reference: "Tell me about your hometown.",
      response: "I come from Cairo. It is a very big city in Egypt."
    },
    {
      name: "High coherence test",
      reference: "Describe your daily routine.",
      response: "I wake up at 7 AM every morning. First, I have breakfast with my family. Then I go to work by bus. After work, I return home and have dinner. Finally, I watch TV before going to bed."
    },
    {
      name: "Low coherence test",
      reference: "What do you like about your job?",
      response: "Pizza is good. My cat sleeps a lot. Yesterday was sunny. I need to buy groceries."
    },
    {
      name: "Medium coherence test",
      reference: "Talk about your hobbies.",
      response: "I enjoy reading books in my free time. Sometimes I also like to cook. Sports are interesting too."
    }
  ];

  console.log('Starting coherence API tests...');

  // Run basic API test first
  try {
    const basicTest = await testCoherenceApi();
    if (!basicTest) {
      errors.push('Basic API test failed');
      success = false;
    } else {
      results.push({ test: 'Basic API connectivity', status: 'PASSED' });
    }
  } catch (error) {
    errors.push(`Basic API test error: ${error}`);
    success = false;
  }

  // Run detailed test cases
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const result = await getCoherenceScore(
        testCase.reference,
        testCase.response,
        'both'
      );
      
      results.push({
        test: testCase.name,
        reference: testCase.reference,
        response: testCase.response,
        sbertScore: result.sbertScore,
        crossScore: result.crossScore,
        averageScore: result.averageScore,
        status: 'PASSED'
      });
      
      console.log(`${testCase.name} result:`, result);
      
    } catch (error) {
      console.error(`Test ${testCase.name} failed:`, error);
      errors.push(`${testCase.name}: ${error}`);
      success = false;
      
      results.push({
        test: testCase.name,
        status: 'FAILED',
        error: error.toString()
      });
    }
  }

  console.log('Coherence API tests completed');
  console.log('Results:', results);
  
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }

  return {
    success,
    results,
    errors
  };
};

/**
 * Quick test function for development
 */
export const quickCoherenceTest = async () => {
  try {
    const result = await getCoherenceScore(
      "Tell me about your hometown.",
      "I come from Cairo. It is a very big city in Egypt.",
      'both'
    );
    
    console.log('Quick coherence test result:', result);
    return result;
  } catch (error) {
    console.error('Quick coherence test failed:', error);
    throw error;
  }
};
