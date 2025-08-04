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

    console.log(`Analytics Manager: ${req.method} ${action}`)

    switch (action) {
      case 'dashboard-analytics':
        if (!user) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('role, organization_id')
          .eq('id', user.id)
          .single()

        // Default to last 30 days if no date specified
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        let sessionQuery = supabaseClient
          .from('assessment_sessions')
          .select('*')
          .gte('created_at', startDate)

        if (userProfile?.organization_id) {
          sessionQuery = sessionQuery.eq('organization_id', userProfile.organization_id)
        }

        const { data: sessions, error: sessionsError } = await sessionQuery

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError)
          return new Response(JSON.stringify({ error: sessionsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: scoringResults, error: scoringError } = await supabaseClient
          .from('scoring_results')
          .select('*')
          .gte('created_at', startDate)

        if (scoringError) {
          console.error('Error fetching scoring results:', scoringError)
          return new Response(JSON.stringify({ error: scoringError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Calculate analytics
        const totalSessions = sessions?.length || 0
        const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
        const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

        // Average scores by skill
        const avgSkillScores = scoringResults?.reduce((acc, result) => {
          acc.fluency += result.fluency_score || 0
          acc.grammar += result.grammar_score || 0
          acc.pronunciation += result.pronunciation_score || 0
          acc.vocabulary += result.vocabulary_score || 0
          acc.count += 1
          return acc
        }, { fluency: 0, grammar: 0, pronunciation: 0, vocabulary: 0, count: 0 })

        const skillAverages = avgSkillScores?.count > 0 ? {
          fluency: Math.round((avgSkillScores.fluency / avgSkillScores.count) * 100) / 100,
          grammar: Math.round((avgSkillScores.grammar / avgSkillScores.count) * 100) / 100,
          pronunciation: Math.round((avgSkillScores.pronunciation / avgSkillScores.count) * 100) / 100,
          vocabulary: Math.round((avgSkillScores.vocabulary / avgSkillScores.count) * 100) / 100,
        } : { fluency: 0, grammar: 0, pronunciation: 0, vocabulary: 0 }

        // CEFR level distribution
        const cefrDistribution = sessions?.reduce((acc, session) => {
          if (session.cefr_level) {
            acc[session.cefr_level] = (acc[session.cefr_level] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>) || {}

        return new Response(JSON.stringify({
          analytics: {
            total_sessions: totalSessions,
            completed_sessions: completedSessions,
            completion_rate: Math.round(completionRate * 100) / 100,
            skill_averages: skillAverages,
            cefr_distribution: cefrDistribution,
            period_start: startDate,
            period_end: new Date().toISOString()
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'user-progress':
        if (!user) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: userSessions, error: userSessionsError } = await supabaseClient
          .from('assessment_sessions')
          .select(`
            *,
            prompt_responses (
              *,
              scoring_results (*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (userSessionsError) {
          console.error('Error fetching user sessions:', userSessionsError)
          return new Response(JSON.stringify({ error: userSessionsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Calculate progress over time
        const progressData = userSessions?.map(session => {
          const responses = session.prompt_responses || []
          const allScores = responses.flatMap(r => r.scoring_results || [])
          
          const avgScore = allScores.length > 0 ? 
            allScores.reduce((sum, s) => sum + (
              (s.fluency_score || 0) + (s.grammar_score || 0) + 
              (s.pronunciation_score || 0) + (s.vocabulary_score || 0)
            ) / 4, 0) / allScores.length : 0

          return {
            session_id: session.id,
            date: session.created_at,
            average_score: Math.round(avgScore),
            cefr_level: session.cefr_level,
            session_type: session.session_type
          }
        }) || []

        return new Response(JSON.stringify({
          user_progress: progressData,
          total_sessions: userSessions?.length || 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Analytics Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})