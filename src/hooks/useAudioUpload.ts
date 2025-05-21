
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useAudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Upload audio blob to Supabase Storage
   */
  const uploadAudio = async (
    audioBlob: Blob, 
    assessmentId: string, 
    promptId?: string
  ): Promise<{ path: string | null; error: Error | null }> => {
    setIsUploading(true);
    setProgress(0);
    
    try {
      // Generate a unique file name
      const fileName = `${assessmentId}/${uuidv4()}.webm`;
      const filePath = `audio-recordings/${fileName}`;
      
      // Upload to Supabase Storage
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
      
      // Create a record in audio_recordings table
      const { error: dbError } = await supabase
        .from('audio_recordings')
        .insert({
          assessment_id: assessmentId,
          prompt_id: promptId || null,
          storage_path: data?.path || filePath
        });
        
      if (dbError) {
        throw dbError;
      }
      
      return { path: data?.path || null, error: null };
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
   * Get a URL for an audio recording by its path
   */
  const getAudioUrl = async (path: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('assessment-audio')
        .getPublicUrl(path);
        
      return data?.publicUrl || null;
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
