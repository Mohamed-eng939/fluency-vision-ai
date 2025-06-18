
/**
 * Robust API call utility with retry logic and fallback support
 */

interface ApiRetryOptions {
  timeout: number;
  retryDelay: number;
  maxRetries: number;
}

interface ApiCallResult<T> {
  data?: T;
  isFallback: boolean;
  fallbackReason?: string;
}

/**
 * Generic retry wrapper for API calls with fallback support
 */
export const callWithRetry = async <T>(
  apiCall: () => Promise<T>,
  fallbackFn: (reason: string) => T,
  options: ApiRetryOptions = {
    timeout: 40000, // 40 seconds
    retryDelay: 5000, // 5 seconds
    maxRetries: 1 // retry once
  }
): Promise<ApiCallResult<T>> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      // Add delay before retry (but not on first attempt)
      if (attempt > 0) {
        console.log(`Retrying API call (attempt ${attempt + 1}/${options.maxRetries + 1}) after ${options.retryDelay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, options.retryDelay));
      }
      
      const data = await apiCall();
      return {
        data,
        isFallback: false
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`API call attempt ${attempt + 1} failed:`, error);
      
      // Don't retry if it's not a timeout/network error
      if (attempt < options.maxRetries && isRetryableError(error)) {
        continue;
      }
      
      // Final attempt failed or non-retryable error
      break;
    }
  }
  
  // All attempts failed, use fallback
  const fallbackReason = getFallbackReason(lastError);
  console.log(`All API attempts failed, using fallback. Reason: ${fallbackReason}`);
  
  const fallbackData = fallbackFn(fallbackReason);
  return {
    data: fallbackData,
    isFallback: true,
    fallbackReason
  };
};

/**
 * Determine if an error is worth retrying
 */
const isRetryableError = (error: any): boolean => {
  // Retry on timeout, network errors, or server errors (5xx)
  if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return true;
  }
  
  if (error.response?.status >= 500) {
    return true;
  }
  
  // Don't retry on client errors (4xx) except for rate limiting (429)
  if (error.response?.status === 429) {
    return true;
  }
  
  return false;
};

/**
 * Get a user-friendly fallback reason based on the error
 */
const getFallbackReason = (error: Error | null): string => {
  if (!error) return 'Unknown error';
  
  const errorMessage = error.message || '';
  
  if (errorMessage.includes('timeout') || error.name === 'TimeoutError') {
    return 'API timeout - server took too long to respond';
  }
  
  if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
    return 'Network connectivity issues';
  }
  
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return 'API rate limit exceeded';
  }
  
  if (errorMessage.includes('5')) {
    return 'External API server error';
  }
  
  return 'External API unavailable';
};
