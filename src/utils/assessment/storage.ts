import { AssessmentResult } from '@/types/assessment';

// Interface for export-ready assessment data
export interface AssessmentExportData {
  sessionId: string;
  studentInfo: {
    name?: string;
    email?: string;
    phone?: string;
    citizenshipCountry?: string;
    residenceCountry?: string;
    dateOfBirth?: Date | string;
    firstLanguage?: string;
    testReason?: string;
    otherReason?: string;
    estimatedLevel?: string;
    preferredContact?: string;
    pronunciationPreference?: string;
    promoCode?: string;
    dataConsent?: boolean;
  } | null;
  date: string;
  type: 'quick' | 'full';
  promptResponses: {
    promptId: string;
    promptText: string;
    cefrLevel: string;
    audioUrl?: string;
    transcript?: string;
    scores?: {
      fluency: number;
      grammar: number;
      pronunciation: number;
      vocabulary: number;
      total: number;
    };
  }[];
  finalResult: {
    cefrLevel: string;
    totalScore: number;
  };
}

/**
 * Store assessment audio and data
 * 
 * This is a placeholder implementation that prepares the data for export.
 * In a real implementation, you would store this data in a database or cloud storage.
 */
export const storeAssessmentData = async (
  audioBlob: Blob,
  result: AssessmentResult,
  sessionId: string,
  studentInfo: { 
    name?: string; 
    email?: string;
    phone?: string;
    citizenshipCountry?: string;
    residenceCountry?: string;
    dateOfBirth?: Date;
    firstLanguage?: string;
    testReason?: string;
    otherReason?: string;
    estimatedLevel?: string;
    preferredContact?: string;
    pronunciationPreference?: string;
    promoCode?: string;
    dataConsent?: boolean;
  } | null
): Promise<boolean> => {
  try {
    // Convert audio blob to base64 for storage/export
    const audioBase64 = await blobToBase64(audioBlob);
    
    // Create export-ready data
    const exportData: AssessmentExportData = {
      sessionId,
      studentInfo,
      date: new Date().toISOString(),
      type: 'quick',
      promptResponses: [
        {
          // Use a unique ID or generate one if not available
          promptId: 'prompt-' + Date.now(),
          // Use transcript as prompt text if available, otherwise empty string
          promptText: result.transcript || '',
          cefrLevel: result.cefrLevel || 'A1',
          audioUrl: audioBase64,
          transcript: result.transcript,
          scores: {
            fluency: result.metrics.fluency,
            grammar: result.metrics.grammar,
            pronunciation: result.metrics.pronunciation,
            vocabulary: result.metrics.vocabulary,
            total: result.totalScore
          }
        }
      ],
      finalResult: {
        cefrLevel: result.cefrLevel,
        totalScore: result.totalScore
      }
    };
    
    // In a real implementation, you would store this data in a database or cloud storage
    console.log('Assessment data ready for export:', exportData);
    
    // For now, we'll store locally for demo purposes
    try {
      // Store in localStorage (limited by size)
      const existingData = localStorage.getItem('assessment_data');
      const assessments = existingData ? JSON.parse(existingData) : [];
      assessments.push({
        sessionId,
        date: new Date().toISOString(),
        result: {
          cefrLevel: result.cefrLevel,
          totalScore: result.totalScore
        }
      });
      
      localStorage.setItem('assessment_data', JSON.stringify(assessments));
    } catch (e) {
      console.warn('Could not store in localStorage (likely size limitations):', e);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing assessment data:', error);
    return false;
  }
};

/**
 * Convert a Blob to a base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get all stored assessment data
 * This is a placeholder implementation for demo purposes
 */
export const getStoredAssessmentData = (): any[] => {
  try {
    const data = localStorage.getItem('assessment_data');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving stored assessment data:', error);
    return [];
  }
};

/**
 * Clear all stored assessment data
 * This is a placeholder implementation for demo purposes
 */
export const clearStoredAssessmentData = (): boolean => {
  try {
    localStorage.removeItem('assessment_data');
    return true;
  } catch (error) {
    console.error('Error clearing stored assessment data:', error);
    return false;
  }
};
