import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set auth for the request
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    switch (method) {
      case 'POST':
        const body = await req.json();
        const action = body.action;
        
        if (action === 'create-session') {
          return await createAssessmentSession(req, supabase, user.id, body);
        } else if (action === 'save-response') {
          return await saveAssessmentResponse(req, supabase, user.id, body);
        } else if (action === 'finalize-session') {
          return await finalizeAssessmentSession(req, supabase, user.id, body);
        } else if (url.pathname.endsWith('/create-session')) {
          return await createAssessmentSession(req, supabase, user.id);
        } else if (url.pathname.endsWith('/save-response')) {
          return await saveAssessmentResponse(req, supabase, user.id);
        } else if (url.pathname.endsWith('/finalize-session')) {
          return await finalizeAssessmentSession(req, supabase, user.id);
        }
        break;
      
      case 'GET':
        if (url.pathname.endsWith('/sessions')) {
          return await getUserSessions(supabase, user.id);
        } else if (url.pathname.includes('/session/')) {
          const sessionId = url.pathname.split('/session/')[1];
          return await getSessionDetails(supabase, user.id, sessionId);
        }
        break;

      case 'PUT':
        if (url.pathname.includes('/session/')) {
          const sessionId = url.pathname.split('/session/')[1];
          return await updateSessionStatus(req, supabase, user.id, sessionId);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Assessment manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Create a new assessment session
async function createAssessmentSession(req: Request, supabase: any, userId: string, requestBody?: any) {
  try {
    // Handle both action-based and URL-based requests
    let sessionType, studentInfo, metadata;
    
    if (requestBody) {
      ({ sessionType, studentInfo, metadata } = requestBody);
    } else {
      ({ sessionType, studentInfo, metadata } = await req.json());
    }

    console.log(`[Assessment Manager] Creating session for user ${userId}, type: ${sessionType}`);

    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType || 'full_assessment',
        student_info: studentInfo,
        metadata: metadata || {},
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) {
      console.error('[Assessment Manager] Session creation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Assessment Manager] Session created successfully: ${session.id}`);
    return new Response(
      JSON.stringify({ success: true, sessionId: session.id, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Assessment Manager] Create session error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Save individual assessment response
async function saveAssessmentResponse(req: Request, supabase: any, userId: string, requestBody?: any) {
  try {
    // Handle both action-based and URL-based requests
    let sessionId, promptId, promptOrder, userResponse, transcript, audioUrl, audioDuration, scores, detailedFeedback, mistakesAnalysis, isFinal;
    
    if (requestBody) {
      ({ sessionId, promptId, promptOrder, userResponse, transcript, audioUrl, audioDuration, scores, detailedFeedback, mistakesAnalysis, isFinal } = requestBody);
    } else {
      ({ sessionId, promptId, promptOrder, userResponse, transcript, audioUrl, audioDuration, scores, detailedFeedback, mistakesAnalysis, isFinal } = await req.json());
    }

    console.log(`[Assessment Manager] Saving response for session ${sessionId}, prompt order ${promptOrder}`);

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: response, error } = await supabase
      .from('assessment_responses')
      .insert({
        session_id: sessionId,
        prompt_id: promptId,
        prompt_order: promptOrder,
        user_response: userResponse,
        transcript: transcript,
        audio_url: audioUrl,
        audio_duration: audioDuration,
        overall_score: scores?.overall,
        fluency_score: scores?.fluency,
        pronunciation_score: scores?.pronunciation,
        grammar_score: scores?.grammar,
        vocabulary_score: scores?.vocabulary,
        coherence_score: scores?.coherence,
        cefr_level: scores?.cefrLevel,
        detailed_feedback: detailedFeedback,
        mistakes_analysis: mistakesAnalysis,
        is_final: isFinal || false
      })
      .select()
      .single();

    if (error) {
      console.error('[Assessment Manager] Response save error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save response', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Assessment Manager] Response saved successfully: ${response.id}`);
    return new Response(
      JSON.stringify({ success: true, responseId: response.id, response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Assessment Manager] Save response error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Finalize assessment session with overall results
async function finalizeAssessmentSession(req: Request, supabase: any, userId: string, requestBody?: any) {
  try {
    // Handle both action-based and URL-based requests
    let sessionId, overallScores, cefrLevel, studentInfo;
    
    if (requestBody) {
      ({ sessionId, overallScores, cefrLevel, studentInfo } = requestBody);
    } else {
      ({ sessionId, overallScores, cefrLevel, studentInfo } = await req.json());
    }

    console.log(`[Assessment Manager] Finalizing session ${sessionId} for user ${userId}`);

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: updatedSession, error } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        overall_score: overallScores?.overall,
        fluency_score: overallScores?.fluency,
        pronunciation_score: overallScores?.pronunciation,
        grammar_score: overallScores?.grammar,
        vocabulary_score: overallScores?.vocabulary,
        coherence_score: overallScores?.coherence,
        overall_cefr_level: cefrLevel,
        student_info: studentInfo
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[Assessment Manager] Session finalization error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to finalize session', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Assessment Manager] Session finalized successfully: ${sessionId}`);
    return new Response(
      JSON.stringify({ success: true, session: updatedSession }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Assessment Manager] Finalize session error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get user's assessment sessions
async function getUserSessions(supabase: any, userId: string) {
  try {
    const { data: sessions, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get sessions error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sessions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, sessions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get user sessions error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get detailed session with responses
async function getSessionDetails(supabase: any, userId: string, sessionId: string) {
  try {
    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        prompts:prompt_id (
          title,
          content,
          type,
          cefr_level
        )
      `)
      .eq('session_id', sessionId)
      .order('prompt_order');

    if (responsesError) {
      console.error('Get responses error:', responsesError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session, 
        responses: responses || [] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get session details error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Update session status
async function updateSessionStatus(req: Request, supabase: any, userId: string, sessionId: string) {
  try {
    const { status } = await req.json();

    const { data: updatedSession, error } = await supabase
      .from('assessment_sessions')
      .update({ status })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update status error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update session status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, session: updatedSession }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update session status error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}