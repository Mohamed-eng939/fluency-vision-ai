import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionData {
  session_type: 'quick' | 'full' | 'custom';
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_country?: string;
  target_cefr_level?: string;
  total_prompts?: number;
  assessment_settings?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Session Manager - Auth header present:', !!authHeader);
    
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
    
    console.log('Session Manager - Authenticated user:', user?.id);
    const url = new URL(req.url)
    const method = req.method
    const sessionId = url.pathname.split('/').pop()

    console.log(`Session Manager: ${method} request`, sessionId ? `for session ${sessionId}` : '')

    switch (method) {
      case 'GET':
        if (sessionId && sessionId !== 'session-manager') {
          // Add session access validation
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

          // Get specific session
          const { data: session, error } = await supabaseClient
            .from('assessment_sessions')
            .select(`
              *,
              prompt_responses (
                id,
                prompt_id,
                transcript,
                cefr_level,
                processing_status,
                created_at
              )
            `)
            .eq('id', sessionId)
            .single()

          if (error) {
            console.error('Error fetching session:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ session }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get user's sessions with organization filtering
          let query = supabaseClient
            .from('assessment_sessions')
            .select('*')
            .order('created_at', { ascending: false })

          if (user) {
            // Get user's profile to check role and organization
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('role, organization_id')
              .eq('id', user.id)
              .single()

            if (profile && ['admin', 'assessor'].includes(profile.role) && profile.organization_id) {
              // Admin/Assessor can see all sessions in their organization
              query = query.eq('organization_id', profile.organization_id)
            } else {
              // Regular users can only see their own sessions
              query = query.eq('user_id', user.id)
            }
          }

          const { data: sessions, error } = await query

          if (error) {
            console.error('Error fetching sessions:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ sessions }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const sessionData: SessionData = await req.json()
        
        // Get user's organization
        let organizationId = null
        if (user) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()
          
          organizationId = profile?.organization_id
        }

        const { data: newSession, error: createError } = await supabaseClient
          .from('assessment_sessions')
          .insert({
            user_id: user?.id,
            organization_id: organizationId,
            session_type: sessionData.session_type,
            student_name: sessionData.student_name,
            student_email: sessionData.student_email,
            student_phone: sessionData.student_phone,
            student_country: sessionData.student_country,
            target_cefr_level: sessionData.target_cefr_level,
            total_prompts: sessionData.total_prompts || 10,
            assessment_settings: sessionData.assessment_settings || {},
            status: 'in_progress'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating session:', createError)
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Session created successfully:', newSession.id)
        return new Response(JSON.stringify({ session: newSession }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!sessionId || sessionId === 'session-manager') {
          return new Response(JSON.stringify({ error: 'Session ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Add session access validation for updates
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

        const updateData = await req.json()
        
        const { data: updatedSession, error: updateError } = await supabaseClient
          .from('assessment_sessions')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating session:', updateError)
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ session: updatedSession }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Session Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})