import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResponseData {
  session_id: string;
  prompt_id?: string;
  transcript?: string;
  audio_url?: string;
  cefr_level?: string;
  metrics?: any;
  audio_analysis?: any;
  coherence_analysis?: any;
  prompt_order?: number;
  is_final?: boolean;
  response_duration?: number;
  confidence_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Response Handler - Auth header present:', !!authHeader);
    
    // Create Supabase client with proper authorization
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: authHeader ? { Authorization: authHeader } : undefined
        } 
      }
    )

    // For authenticated requests, get the user
    let user = null;
    if (authHeader) {
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        return new Response(JSON.stringify({ error: `Authentication failed: ${authError.message}` }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      user = authUser;
    }
    
    console.log('Response Handler - Authenticated user:', user?.id);

    const url = new URL(req.url)
    const method = req.method
    const responseId = url.pathname.split('/').pop()

    console.log(`Response Handler: ${method} request for user ${user?.id}`)

    switch (method) {
      case 'GET':
        if (responseId && responseId !== 'response-handler') {
          // Get specific response
          const { data: response, error } = await supabaseClient
            .from('prompt_responses')
            .select(`
              *,
              audio_recordings (*)
            `)
            .eq('id', responseId)
            .single()

          if (error) {
            console.error('Error fetching response:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ response }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get all responses for session or user
          const sessionId = url.searchParams.get('session_id');
          
          let query = supabaseClient
            .from('prompt_responses')
            .select(`
              *,
              audio_recordings (*)
            `)
            .order('created_at', { ascending: false })

          if (sessionId) {
            query = query.eq('session_id', sessionId)
          } else if (user) {
            // Get responses for user's sessions
            const { data: userSessions } = await supabaseClient
              .from('assessment_sessions')
              .select('id')
              .eq('user_id', user.id)

            if (userSessions && userSessions.length > 0) {
              const sessionIds = userSessions.map(s => s.id)
              query = query.in('session_id', sessionIds)
            }
          }

          const { data: responses, error } = await query

          if (error) {
            console.error('Error fetching responses:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ responses }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const responseData: ResponseData = await req.json()
        
        // Verify session ownership if user is authenticated
        if (user) {
          const { data: session } = await supabaseClient
            .from('assessment_sessions')
            .select('user_id')
            .eq('id', responseData.session_id)
            .single()

          if (session && session.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: newResponse, error: createError } = await supabaseClient
          .from('prompt_responses')
          .insert({
            session_id: responseData.session_id,
            prompt_id: responseData.prompt_id,
            transcript: responseData.transcript,
            audio_url: responseData.audio_url,
            cefr_level: responseData.cefr_level,
            metrics: responseData.metrics || {},
            audio_analysis: responseData.audio_analysis || {},
            coherence_analysis: responseData.coherence_analysis || {},
            prompt_order: responseData.prompt_order,
            response_duration: responseData.response_duration,
            confidence_score: responseData.confidence_score,
            processing_status: 'completed'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating response:', createError)
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Response created successfully:', newResponse.id)
        return new Response(JSON.stringify({ response: newResponse }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!responseId || responseId === 'response-handler') {
          return new Response(JSON.stringify({ error: 'Response ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData = await req.json()
        
        // Verify ownership if user is authenticated
        if (user) {
          const { data: responseCheck } = await supabaseClient
            .from('prompt_responses')
            .select(`
              session_id,
              assessment_sessions!inner(user_id)
            `)
            .eq('id', responseId)
            .single()

          if (responseCheck && responseCheck.assessment_sessions.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: updatedResponse, error: updateError } = await supabaseClient
          .from('prompt_responses')
          .update(updateData)
          .eq('id', responseId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating response:', updateError)
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ response: updatedResponse }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Response Handler Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})