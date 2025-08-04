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

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    // Updated to match existing role system: admin and assessor have admin privileges
    if (!profile || !['admin', 'assessor'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const method = req.method
    const action = url.pathname.split('/').pop()

    console.log(`Admin Manager: ${method} ${action} for user ${user.id} with role ${profile.role}`)

    switch (action) {
      case 'dashboard-stats':
        if (method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed for this action' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let sessionQuery = supabaseClient
          .from('assessment_sessions')
          .select('id, status, created_at, overall_score, cefr_level')

        // Assessors can only see org sessions if they have org_id, admins see all
        if (profile.role === 'assessor' && profile.organization_id) {
          sessionQuery = sessionQuery.eq('organization_id', profile.organization_id)
        }

        const { data: sessions, error: sessionsError } = await sessionQuery

        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError)
          return new Response(JSON.stringify({ error: sessionsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let userQuery = supabaseClient
          .from('profiles')
          .select('id, role, is_active, created_at')

        if (profile.role === 'assessor' && profile.organization_id) {
          userQuery = userQuery.eq('organization_id', profile.organization_id)
        }

        const { data: users, error: usersError } = await userQuery

        if (usersError) {
          console.error('Error fetching users:', usersError)
          return new Response(JSON.stringify({ error: usersError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const totalSessions = sessions?.length || 0
        const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
        const avgScore = sessions?.filter(s => s.overall_score)
          .reduce((acc, s, _, arr) => acc + (s.overall_score || 0) / arr.length, 0) || 0

        const totalUsers = users?.length || 0
        const activeUsers = users?.filter(u => u.is_active).length || 0

        const cefrDistribution = sessions?.reduce((acc, s) => {
          if (s.cefr_level) {
            acc[s.cefr_level] = (acc[s.cefr_level] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>) || {}

        return new Response(JSON.stringify({
          stats: {
            total_sessions: totalSessions,
            completed_sessions: completedSessions,
            completion_rate: totalSessions > 0 ? (completedSessions / totalSessions * 100) : 0,
            average_score: Math.round(avgScore * 100) / 100,
            total_users: totalUsers,
            active_users: activeUsers,
            cefr_distribution: cefrDistribution
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'grant-access':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed for this action' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { user_id, credits, expires_in_days } = await req.json()

        if (!user_id) {
          return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const expiresAt = expires_in_days 
          ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
          : null

        const { data: updatedUser, error: grantError } = await supabaseClient
          .from('profiles')
          .update({
            has_assessment_access: true,
            assessment_credits: credits || 10,
            access_granted_by: user.id,
            access_granted_at: new Date().toISOString(),
            access_expires_at: expiresAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', user_id)
          .select()
          .single()

        if (grantError) {
          console.error('Error granting access:', grantError)
          return new Response(JSON.stringify({ error: grantError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          message: 'Access granted successfully',
          user: updatedUser 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'revoke-access':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed for this action' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { user_id: revokeUserId } = await req.json()

        if (!revokeUserId) {
          return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: revokedUser, error: revokeError } = await supabaseClient
          .from('profiles')
          .update({
            has_assessment_access: false,
            assessment_credits: 0,
            access_expires_at: new Date().toISOString(), // Set to now to expire immediately
            updated_at: new Date().toISOString()
          })
          .eq('id', revokeUserId)
          .select()
          .single()

        if (revokeError) {
          console.error('Error revoking access:', revokeError)
          return new Response(JSON.stringify({ error: revokeError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          message: 'Access revoked successfully',
          user: revokedUser 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'users':
        if (method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed for this action' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let usersQuery = supabaseClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (profile.role === 'assessor' && profile.organization_id) {
          usersQuery = usersQuery.eq('organization_id', profile.organization_id)
        }

        const { data: allUsers, error: allUsersError } = await usersQuery

        if (allUsersError) {
          console.error('Error fetching users:', allUsersError)
          return new Response(JSON.stringify({ error: allUsersError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ users: allUsers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'sessions':
        if (method !== 'GET') {
          return new Response(JSON.stringify({ error: 'Method not allowed for this action' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let sessionsQuery = supabaseClient
          .from('assessment_sessions')
          .select(`
            *,
            profiles!inner (
              name,
              email
            )
          `)
          .order('created_at', { ascending: false })

        if (profile.role === 'assessor' && profile.organization_id) {
          sessionsQuery = sessionsQuery.eq('organization_id', profile.organization_id)
        }

        const { data: allSessions, error: allSessionsError } = await sessionsQuery

        if (allSessionsError) {
          console.error('Error fetching sessions:', allSessionsError)
          return new Response(JSON.stringify({ error: allSessionsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ sessions: allSessions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Admin Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})