import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json();
    console.log('Audio Processor - Processing request:', requestBody.action);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, audioData, sessionId } = requestBody;

    switch (action) {
      case 'upload': {
        if (!audioData || !sessionId) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing audioData or sessionId' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Convert base64 audio data to blob for storage
        const audioBlob = new Uint8Array(
          atob(audioData).split('').map(char => char.charCodeAt(0))
        );
        
        // Generate file path
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = `audio-recordings/${sessionId}/${timestamp}.wav`;

        // Upload to Supabase storage
        const { data, error } = await supabaseClient.storage
          .from('assessment-audio')
          .upload(filePath, audioBlob, {
            contentType: 'audio/wav',
            upsert: false
          });

        if (error) {
          console.error('Storage upload error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('Audio uploaded successfully:', data.path);
        return new Response(JSON.stringify({ 
          success: true, 
          path: data.path 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Unsupported action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Audio Processor Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})