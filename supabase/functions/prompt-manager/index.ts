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
    // Note: Keeping this optional since prompts might be public

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()
    const method = req.method

    console.log(`Prompt Manager: ${method} ${action}`)

    switch (action) {
      case 'get-prompts':
        const sessionType = url.searchParams.get('session_type') || 'quick'
        const cefrLevel = url.searchParams.get('cefr_level')
        const limit = parseInt(url.searchParams.get('limit') || '10')

        let query = supabaseClient
          .from('prompts')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })

        if (cefrLevel) {
          query = query.eq('cefr_level', cefrLevel)
        }

        if (sessionType === 'quick') {
          query = query.limit(limit)
        }

        const { data: prompts, error } = await query

        if (error) {
          console.error('Error fetching prompts:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ prompts }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'adaptive-selection':
        const { session_id, current_score, responses_count } = await req.json()

        // Adaptive prompt selection logic
        let targetLevel = 'B1' // Default
        if (current_score >= 80) targetLevel = 'C1'
        else if (current_score >= 70) targetLevel = 'B2'
        else if (current_score >= 60) targetLevel = 'B2'
        else if (current_score >= 50) targetLevel = 'B1'
        else if (current_score >= 40) targetLevel = 'A2'
        else targetLevel = 'A1'

        // Get used prompt IDs first, then filter
        const { data: usedPrompts } = await supabaseClient
          .from('prompt_responses')
          .select('prompt_id')
          .eq('session_id', session_id)

        const usedPromptIds = usedPrompts?.map(p => p.prompt_id) || []

        let nextPromptsQuery = supabaseClient
          .from('prompts')
          .select('*')
          .eq('cefr_level', targetLevel)
          .eq('is_active', true)
          .limit(1)

        if (usedPromptIds.length > 0) {
          nextPromptsQuery = nextPromptsQuery.not('id', 'in', `(${usedPromptIds.map(id => `"${id}"`).join(',')})`)
        }

        const { data: nextPrompts, error: adaptiveError } = await nextPromptsQuery

        if (adaptiveError) {
          console.error('Error in adaptive selection:', adaptiveError)
          return new Response(JSON.stringify({ error: adaptiveError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ 
          prompt: nextPrompts?.[0] || null,
          suggested_level: targetLevel
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
    console.error('Prompt Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
