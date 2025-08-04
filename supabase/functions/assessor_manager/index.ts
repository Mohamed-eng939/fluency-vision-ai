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
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check assessor role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'assessor') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    console.log(`Assessor Manager: ${req.method} ${action} for assessor ${user.id}`)

    switch (action) {
      case 'pending-assessments':
        // First get completed sessions
        let sessionsQuery = supabaseClient
          .from('assessment_sessions')
          .select(`
            *,
            profiles!inner (name, email)
          `)
          .eq('status', 'completed')

        if (profile.organization_id) {
          sessionsQuery = sessionsQuery.eq('organization_id', profile.organization_id)
        }

        const { data: sessions, error: sessionsError } = await sessionsQuery

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError)
          return new Response(JSON.stringify({ error: sessionsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: existingReviews } = await supabaseClient
          .from('assessment_reviews')
          .select('session_id')

        const reviewedSessionIds = new Set(existingReviews?.map(r => r.session_id) || [])
        const pendingAssessments = sessions?.filter(s => !reviewedSessionIds.has(s.id)) || []

        return new Response(JSON.stringify({ assessments: pendingAssessments }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'submit-review':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { 
          session_id, 
          response_id, 
          reviewed_score, 
          reviewer_notes, 
          score_justification,
          quality_flags 
        } = await req.json()

        if (!session_id || !reviewed_score) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: originalScoring } = await supabaseClient
          .from('scoring_results')
          .select('*')
          .eq('response_id', response_id)
          .single()

        const originalScore = originalScoring ? 
          Math.round((originalScoring.fluency_score + originalScoring.grammar_score + 
                     originalScoring.pronunciation_score + originalScoring.vocabulary_score) / 4) : 0

        const { data: review, error: reviewError } = await supabaseClient
          .from('assessment_reviews')
          .insert({
            session_id,
            response_id,
            reviewer_id: user.id,
            original_score: originalScore,
            reviewed_score,
            score_adjustment: reviewed_score - originalScore,
            reviewer_notes,
            score_justification,
            quality_flags,
            review_type: 'manual',
            review_status: 'completed'
          })
          .select()
          .single()

        if (reviewError) {
          console.error('Error creating review:', reviewError)
          return new Response(JSON.stringify({ error: reviewError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        await supabaseClient
          .from('assessment_sessions')
          .update({
            overall_score: reviewed_score,
            updated_at: new Date().toISOString()
          })
          .eq('id', session_id)

        return new Response(JSON.stringify({ 
          review,
          message: 'Review submitted successfully' 
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'my-reviews':
        if (req.method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: myReviews, error: reviewsError } = await supabaseClient
          .from('assessment_reviews')
          .select(`
            *,
            assessment_sessions (
              student_name,
              student_email,
              session_type
            )
          `)
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: false })

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError)
          return new Response(JSON.stringify({ error: reviewsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ reviews: myReviews }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Assessor Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})