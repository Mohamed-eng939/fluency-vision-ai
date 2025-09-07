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
    
    // Read request body only once for POST requests
    let requestBody = null;
    if (method === 'POST') {
      try {
        requestBody = await req.json();
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    switch (method) {
      case 'POST':
        const action = requestBody?.action;
        
        // Add get-pending-sessions action
        if (action === 'get-pending-sessions') {
          return await getPendingSessions(supabase, user.id);
        } else if (action === 'create-session') {
          return await createAssessmentSession(supabase, user.id, requestBody);
        } else if (action === 'save-response') {
          return await saveAssessmentResponse(supabase, user.id, requestBody);
        } else if (action === 'finalize-session') {
          return await finalizeAssessmentSession(supabase, user.id, requestBody);
        } else if (url.pathname.endsWith('/create-session')) {
          return await createAssessmentSession(supabase, user.id, requestBody);
        } else if (url.pathname.endsWith('/save-response')) {
          return await saveAssessmentResponse(supabase, user.id, requestBody);
        } else if (url.pathname.endsWith('/finalize-session')) {
          return await finalizeAssessmentSession(supabase, user.id, requestBody);
        } else {
          // Handle default case for assessment-manager calls without specific action
          return await createAssessmentSession(supabase, user.id, requestBody);
        }
        break;
      
      case 'GET':
        if (url.pathname.endsWith('/sessions')) {
          return await getUserSessions(supabase, user.id);
        } else if (url.pathname.includes('/session/')) {
          const sessionId = url.pathname.split('/session/')[1];
          return await getSessionDetails(supabase, user.id, sessionId);
        } else if (url.pathname.endsWith('/pending-sessions')) {
          return await getPendingSessions(supabase, user.id);
        }
        break;

      case 'PUT':
        if (url.pathname.includes('/session/')) {
          const sessionId = url.pathname.split('/session/')[1];
          const body = await req.json();
          return await updateSessionStatus(supabase, user.id, sessionId, body);
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
async function createAssessmentSession(supabase: any, userId: string, requestBody: any) {
  try {
    const { sessionType, studentInfo, metadata } = requestBody || {};

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
async function saveAssessmentResponse(supabase: any, userId: string, requestBody: any) {
  try {
    const { sessionId, promptId, promptIdentifier, promptOrder, userResponse, transcript, audioUrl, audioDuration, scores, detailedFeedback, mistakesAnalysis, isFinal } = requestBody;

    console.log(`[Assessment Manager] Saving response for session ${sessionId}, prompt order ${promptOrder}`);

    // First try to find existing session
    const { data: existingSession, error: findError } = await supabase
      .from('assessment_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle();

    let session = existingSession;

    // If session doesn't exist, create it now
    if (!existingSession && !findError) {
      console.log(`[Assessment Manager] Session ${sessionId} not found, creating it now`);
      
      const { data: newSession, error: createError } = await supabase
        .from('assessment_sessions')
        .insert({
          id: sessionId, // Use the provided session ID
          user_id: userId,
          session_type: 'full_assessment',
          student_info: studentInfo,
          status: 'in_progress'
        })
        .select('id, user_id')
        .single();

      if (createError) {
        console.error('[Assessment Manager] Failed to create session:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session', details: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      session = newSession;
    } else if (findError) {
      console.error('[Assessment Manager] Session lookup error:', findError);
      return new Response(
        JSON.stringify({ error: 'Session lookup failed', details: findError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: response, error } = await supabase
      .from('assessment_responses')
      .insert({
        session_id: sessionId,
        prompt_id: promptId,
        prompt_identifier: promptIdentifier,
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
async function finalizeAssessmentSession(supabase: any, userId: string, requestBody: any) {
  try {
    const { sessionId, overallScores, cefrLevel, studentInfo } = requestBody;

    console.log(`[Assessment Manager] Finalizing session ${sessionId} for user ${userId}`);

    // First try to find existing session
    const { data: existingSession, error: findError } = await supabase
      .from('assessment_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .maybeSingle();

    let session = existingSession;

    // If session doesn't exist, create it now
    if (!existingSession && !findError) {
      console.log(`[Assessment Manager] Session ${sessionId} not found, creating it now`);
      
      const { data: newSession, error: createError } = await supabase
        .from('assessment_sessions')
        .insert({
          id: sessionId, // Use the provided session ID
          user_id: userId,
          session_type: 'full_assessment',
          student_info: studentInfo,
          status: 'in_progress'
        })
        .select('id, user_id')
        .single();

      if (createError) {
        console.error('[Assessment Manager] Failed to create session:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session', details: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      session = newSession;
    } else if (findError) {
      console.error('[Assessment Manager] Session lookup error:', findError);
      return new Response(
        JSON.stringify({ error: 'Session lookup failed', details: findError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
async function updateSessionStatus(supabase: any, userId: string, sessionId: string, body: any) {
  try {
    const { status } = body;

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

// Get pending assessment sessions for assessors
async function getPendingSessions(supabase: any, userId: string) {
  try {
    console.log(`[Assessment Manager] Getting pending sessions for assessor ${userId}`);

    // Get user profile to check role and organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.role !== 'assessor' && profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied: Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get completed assessment sessions that need review
    let query = supabase
      .from('assessment_sessions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          first_language,
          country_of_residence
        )
      `)
      .eq('status', 'completed')
      .is('assigned_assessor', null)
      .order('created_at', { ascending: false });

    // If user is assessor (not admin), filter by organization
    if (profile.role === 'assessor' && profile.organization_id) {
      query = query.eq('organization_id', profile.organization_id);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('[Assessment Manager] Get pending sessions error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending sessions', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Assessment Manager] Found ${sessions?.length || 0} pending sessions`);
    return new Response(
      JSON.stringify({ success: true, sessions: sessions || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Assessment Manager] Get pending sessions error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}