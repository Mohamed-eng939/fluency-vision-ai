import { supabase } from '@/integrations/supabase/client';

export interface AudioUploadResponse {
  success: boolean;
  path?: string;
  url?: string;
  audioId?: string;
  error?: string;
}

export interface AudioProcessingResponse {
  success: boolean;
  transcription?: string;
  analysis?: any;
  audioId?: string;
  error?: string;
}

/**
 * Audio Service - Handle all audio-related operations via Edge Functions
 */
export const audioService = {
  /**
   * Upload and process audio file
   */
  uploadAudio: async (
    audioBlob: Blob,
    assessmentId: string,
    promptId?: string
  ): Promise<AudioUploadResponse> => {
    try {
      // Convert blob to base64 for transmission
      const base64Audio = await blobToBase64(audioBlob);
      
      const { data, error } = await supabase.functions.invoke('audio-processor', {
        body: {
          action: 'upload',
          audioData: base64Audio,
          assessmentId,
          promptId,
          contentType: audioBlob.type
        }
      });

      if (error) throw error;

      return {
        success: true,
        path: data.path,
        url: data.url,
        audioId: data.audioId
      };
    } catch (error: any) {
      console.error('Failed to upload audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload audio'
      };
    }
  },

  /**
   * Process audio for transcription and analysis
   */
  processAudio: async (
    audioBlob: Blob,
    analysisType: 'transcription' | 'analysis' | 'both' = 'both'
  ): Promise<AudioProcessingResponse> => {
    try {
      const base64Audio = await blobToBase64(audioBlob);
      
      const { data, error } = await supabase.functions.invoke('audio-processor', {
        body: {
          action: 'process',
          audioData: base64Audio,
          analysisType,
          contentType: audioBlob.type
        }
      });

      if (error) throw error;

      return {
        success: true,
        transcription: data.transcription,
        analysis: data.analysis,
        audioId: data.audioId
      };
    } catch (error: any) {
      console.error('Failed to process audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to process audio'
      };
    }
  },

  /**
   * Get audio URL by path
   */
  getAudioUrl: async (path: string): Promise<AudioUploadResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('audio-processor', {
        body: {
          action: 'get_url',
          path
        }
      });

      if (error) throw error;

      return {
        success: true,
        url: data.url
      };
    } catch (error: any) {
      console.error('Failed to get audio URL:', error);
      return {
        success: false,
        error: error.message || 'Failed to get audio URL'
      };
    }
  },

  /**
   * Delete audio file
   */
  deleteAudio: async (path: string): Promise<AudioUploadResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('audio-processor', {
        body: {
          action: 'delete',
          path
        }
      });

      if (error) throw error;

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to delete audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete audio'
      };
    }
  }
};

/**
 * Convert blob to base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:audio/webm;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};