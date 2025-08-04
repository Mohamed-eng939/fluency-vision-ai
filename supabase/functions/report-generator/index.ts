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
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { session_id } = await req.json()

    if (!session_id) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Report Generator: Generating report for session ${session_id}`)

    // Add session access validation
    const { data: sessionCheck, error: sessionCheckError } = await supabaseClient
      .from('assessment_sessions')
      .select('user_id, organization_id')
      .eq('id', session_id)
      .single()

    if (sessionCheckError || !sessionCheck) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has access to this session
    if (sessionCheck.user_id && sessionCheck.user_id !== user.id) {
      // Check if user is admin/assessor with organization access
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

    // Get session data with all related information
    const { data: session, error: sessionError } = await supabaseClient
      .from('assessment_sessions')
      .select(`
        *,
        prompt_responses (
          *,
          scoring_results (*),
          audio_recordings (*)
        ),
        assessment_reviews (*)
      `)
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError)
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate overall statistics
    const responses = session.prompt_responses || []
    const scoringResults = responses.flatMap(r => r.scoring_results || [])

    if (scoringResults.length === 0) {
      return new Response(JSON.stringify({ error: 'No scoring results found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate averages
    const avgScores = {
      fluency: scoringResults.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / scoringResults.length,
      grammar: scoringResults.reduce((sum, s) => sum + (s.grammar_score || 0), 0) / scoringResults.length,
      pronunciation: scoringResults.reduce((sum, s) => sum + (s.pronunciation_score || 0), 0) / scoringResults.length,
      vocabulary: scoringResults.reduce((sum, s) => sum + (s.vocabulary_score || 0), 0) / scoringResults.length,
      prosody: scoringResults.reduce((sum, s) => sum + (s.prosody_score || 0), 0) / scoringResults.length,
      syntax: scoringResults.reduce((sum, s) => sum + (s.syntax_score || 0), 0) / scoringResults.length,
      coherence: scoringResults.reduce((sum, s) => sum + (s.coherence_score || 0), 0) / scoringResults.length,
    }

    const overallScore = Object.values(avgScores).reduce((sum, score) => sum + score, 0) / Object.keys(avgScores).length

    // CEFR distribution
    const cefrCounts = responses.reduce((acc, r) => {
      const level = r.cefr_level || 'Unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Generate detailed feedback
    const detailedFeedback = {
      strengths: [],
      improvements: [],
      recommendations: []
    }

    if (avgScores.fluency >= 75) detailedFeedback.strengths.push('Strong fluency and natural speech flow')
    if (avgScores.grammar >= 75) detailedFeedback.strengths.push('Good grammatical accuracy')
    if (avgScores.pronunciation >= 75) detailedFeedback.strengths.push('Clear pronunciation')

    if (avgScores.fluency < 60) detailedFeedback.improvements.push('Work on speech fluency and pace')
    if (avgScores.grammar < 60) detailedFeedback.improvements.push('Focus on grammatical structures')
    if (avgScores.vocabulary < 60) detailedFeedback.improvements.push('Expand vocabulary range')

    // Generate report object
    const report = {
      session_info: {
        id: session.id,
        student_name: session.student_name,
        student_email: session.student_email,
        session_type: session.session_type,
        target_cefr_level: session.target_cefr_level,
        completed_at: session.completed_at,
        total_responses: responses.length
      },
      overall_scores: {
        ...avgScores,
        overall: Math.round(overallScore)
      },
      cefr_distribution: cefrCounts,
      detailed_responses: responses.map(response => ({
        prompt_id: response.prompt_id,
        transcript: response.transcript,
        cefr_level: response.cefr_level,
        scores: response.scoring_results?.[0] || null,
        audio_url: response.audio_url
      })),
      feedback: detailedFeedback,
      recommendations: [
        'Continue practicing speaking regularly',
        'Focus on areas with lower scores',
        'Record yourself speaking to monitor progress'
      ],
      generated_at: new Date().toISOString()
    }

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Report Generator Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})