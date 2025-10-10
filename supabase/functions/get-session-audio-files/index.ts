import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-session-audio-files] Fetching audio files for session: ${sessionId}`);

    // List all files in the session folder
    const { data: files, error: listError } = await supabase
      .storage
      .from('assessment-audio')
      .list(`audio-recordings/${sessionId}`, {
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (listError) {
      console.error('[get-session-audio-files] Error listing files:', listError);
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('[get-session-audio-files] No audio files found for session');
      return new Response(
        JSON.stringify({ responses: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-session-audio-files] Found ${files.length} audio files`);

    // Get signed URLs for each file (since bucket is private)
    const responses = await Promise.all(files.map(async (file, index) => {
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('assessment-audio')
        .createSignedUrl(`audio-recordings/${sessionId}/${file.name}`, 3600); // 1 hour expiry

      if (urlError) {
        console.warn(`[get-session-audio-files] Error creating signed URL for ${file.name}:`, urlError);
      }

      return {
        id: file.name.replace('.wav', ''),
        prompt_order: index + 1,
        audio_url: urlData?.signedUrl || null,
        audio_duration: null,
        transcript: null,
        cefr_level: null,
        created_at: file.created_at,
        metadata: file.metadata,
        reconstructed: true // Flag to indicate this was reconstructed from storage
      };
    }));

    console.log(`[get-session-audio-files] Returning ${responses.length} reconstructed responses`);

    return new Response(
      JSON.stringify({ responses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-session-audio-files] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
