import { supabase } from '@/integrations/supabase/client';

/** Read a Blob as a base64 string (without the data: prefix). */
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

/**
 * Transcribe audio with Whisper large-v3 via the `whisper-proxy` edge function.
 * Returns the transcript, or `null` if the service is unavailable/slow — callers
 * should fall back to the browser speech-recognition transcript so the
 * assessment never blocks on transcription.
 */
export async function transcribeWithWhisper(audioBlob: Blob): Promise<string | null> {
  try {
    if (!audioBlob || audioBlob.size === 0) return null;
    const audio = await blobToBase64(audioBlob);
    const { data, error } = await supabase.functions.invoke('whisper-proxy', {
      body: { audio, mime: audioBlob.type || 'audio/webm' },
    });
    if (error) throw error;
    if (!data || data.transcription_failed || typeof data.transcript !== 'string') return null;
    const transcript = data.transcript.trim();
    return transcript.length > 0 ? transcript : null;
  } catch (e) {
    console.warn('[whisper] transcription unavailable, falling back to browser ASR:', e);
    return null;
  }
}
