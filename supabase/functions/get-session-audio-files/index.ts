import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Create auth client for user validation
    const authHeader = req.headers.get('Authorization');
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} }
    });

    // Create service client for storage operations
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-session-audio-files] Fetching audio files for session: ${sessionId}`);

    // Check if user is authenticated
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (!claimsError && claimsData?.claims?.sub) {
        userId = claimsData.claims.sub as string;
      }
    }

    // Fetch the session to verify ownership
    const { data: session, error: sessionError } = await supabaseService
      .from('assessment_sessions')
      .select('user_id, assigned_assessor, metadata')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('[get-session-audio-files] Session not found:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authorization check
    const isOwner = userId && session.user_id === userId;
    const isAssessor = userId && session.assigned_assessor === userId;
    const isAnonymousSession = session.user_id === null;
    
    // For anonymous sessions, require session token from header
    if (isAnonymousSession) {
      const sessionToken = req.headers.get('x-session-token');
      const storedToken = session.metadata?.access_token;
      
      if (!storedToken || sessionToken !== storedToken) {
        console.error('[get-session-audio-files] Invalid or missing session token for anonymous session');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid session token' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Token valid, proceed
    } else if (!isOwner && !isAssessor) {
      // For authenticated sessions, must be owner or assigned assessor
      console.error('[get-session-audio-files] User not authorized to access this session');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not have access to this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List all files in the session folder
    const { data: files, error: listError } = await supabaseService
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
      const { data: urlData, error: urlError } = await supabaseService
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
