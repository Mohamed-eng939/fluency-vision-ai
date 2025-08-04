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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    console.log(`Response Processor: ${req.method} ${action}`)

    switch (action) {
      case 'submit-response':
        // Add authentication check
        if (!user) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { 
          session_id, 
          prompt_id, 
          transcript, 
          audio_url, 
          response_duration,
          prompt_order 
        } = await req.json()

        if (!session_id || !prompt_id || !transcript) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Add session access validation
        const { data: session, error: sessionError } = await supabaseClient
          .from('assessment_sessions')
          .select('user_id, organization_id')
          .eq('id', session_id)
          .single()

        if (sessionError || !session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check if user has access to this session
        if (session.user_id && session.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Create response record
        const { data: response, error: responseError } = await supabaseClient
          .from('prompt_responses')
          .insert({
            session_id,
            prompt_id,
            transcript,
            audio_url,
            response_duration,
            prompt_order: prompt_order || 1,
            processing_status: 'pending',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (responseError) {
          console.error('Error creating response:', responseError)
          return new Response(JSON.stringify({ error: responseError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Background task: Trigger scoring process with error handling
        const backgroundScoring = async () => {
          try {
            const scoringResponse = await supabaseClient.functions.invoke('scoring-engine', {
              body: { response_id: response.id }
            })

            if (scoringResponse.error) {
              console.error('Scoring error:', scoringResponse.error)
              // Update response status to indicate scoring failed
              await supabaseClient
                .from('prompt_responses')
                .update({ processing_status: 'scoring_failed' })
                .eq('id', response.id)
            }
          } catch (scoringError) {
            console.error('Failed to trigger scoring:', scoringError)
            // Update response status to indicate scoring failed
            await supabaseClient
              .from('prompt_responses')
              .update({ processing_status: 'scoring_failed' })
              .eq('id', response.id)
          }
        }

        // Run scoring in background without blocking response
        EdgeRuntime.waitUntil(backgroundScoring())

        return new Response(JSON.stringify({ 
          response,
          message: 'Response submitted successfully' 
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get-responses':
        const sessionId = url.searchParams.get('session_id')
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Session ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Add session access validation for GET
        if (user) {
          const { data: sessionCheck } = await supabaseClient
            .from('assessment_sessions')
            .select('user_id, organization_id')
            .eq('id', sessionId)
            .single()

          if (sessionCheck && sessionCheck.user_id && sessionCheck.user_id !== user.id) {
            // Check if user has organization access
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('role, organization_id')
              .eq('id', user.id)
              .single()

            const hasOrgAccess = profile && 
              ['admin', 'assessor'].includes(profile.role) &&
              profile.organization_id === sessionCheck.organization_id

            if (!hasOrgAccess) {
              return new Response(JSON.stringify({ error: 'Access denied' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
            }
          }
        }

        const { data: responses, error: getError } = await supabaseClient
          .from('prompt_responses')
          .select(`
            *,
            scoring_results (*)
          `)
          .eq('session_id', sessionId)
          .order('prompt_order', { ascending: true })

        if (getError) {
          console.error('Error fetching responses:', getError)
          return new Response(JSON.stringify({ error: getError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ responses }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Response Processor Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})