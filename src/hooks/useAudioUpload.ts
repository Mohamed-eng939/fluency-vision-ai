
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { audioService } from '@/services/audioService';

export const useAudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Upload audio blob via Edge Function
   */
  const uploadAudio = async (
    audioBlob: Blob, 
    assessmentId: string, 
    promptId?: string
  ): Promise<{ path: string | null; error: Error | null }> => {
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Try Edge Function first
      const response = await audioService.uploadAudio(audioBlob, assessmentId, promptId);
      
       if (response.success) {
         setProgress(100);
         console.info('[UPLOAD_OK]', { path: response.path, url: response.url });
         return { path: response.path || null, error: null };
       } else {
         // Fallback to direct upload
         console.warn('[UPLOAD_FAIL] Edge Function failed, falling back to direct upload:', response.error);
        
         const ext = audioBlob.type?.includes('wav') ? 'wav' : 'webm';
         const tail = promptId ? `read_aloud/${promptId}-${Date.now()}` : uuidv4();
         const filePath = `audio-recordings/${assessmentId}/${tail}.${ext}`;
        
        const { data, error } = await supabase.storage
          .from('assessment-audio')
          .upload(filePath, audioBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: audioBlob.type
          });
          
        if (error) {
          throw error;
        }
        
        // Return storage path; we'll link it to responses separately
        return { path: data?.path || filePath, error: null };
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload audio recording",
        variant: "destructive"
      });
      return { path: null, error };
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };
  
  /**
   * Get a signed URL for an audio recording by its path
   * Uses signed URLs for secure, time-limited access to private storage
   */
  const getAudioUrl = async (path: string): Promise<string | null> => {
    try {
      // Try Edge Function first (preferred for authenticated access)
      const response = await audioService.getAudioUrl(path);
      
      if (response.success && response.url) {
        return response.url;
      } else {
        // Fallback to signed URL (1 hour expiry) - requires authentication
        console.warn('Edge Function failed, falling back to signed URL:', response.error);
        
        const { data, error } = await supabase.storage
          .from('assessment-audio')
          .createSignedUrl(path, 3600); // 1 hour expiry
          
        if (error) {
          console.error('Failed to create signed URL:', error);
          return null;
        }
        
        return data?.signedUrl || null;
      }
    } catch (error) {
      console.error("Error getting audio URL:", error);
      return null;
    }
  };
  
  return {
    uploadAudio,
    getAudioUrl,
    isUploading,
    progress
  };
};
