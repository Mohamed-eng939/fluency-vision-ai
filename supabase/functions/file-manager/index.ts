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

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    console.log(`File Manager: ${req.method} ${action}`)

    switch (action) {
      case 'upload-audio':
        if (req.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const formData = await req.formData()
        const audioFile = formData.get('audio') as File
        const responseId = formData.get('response_id') as string
        const sessionId = formData.get('session_id') as string

        if (!audioFile || !responseId) {
          return new Response(JSON.stringify({ error: 'Missing audio file or response ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Validate session access
        let session = null
        if (sessionId) {
          const { data: sessionData } = await supabaseClient
            .from('assessment_sessions')
            .select('user_id, organization_id')
            .eq('id', sessionId)
            .single()
            
          if (sessionData && sessionData.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          session = sessionData
        }

        const fileName = `${sessionId}/${responseId}-${Date.now()}.webm`
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('assessment-audio')
          .upload(fileName, audioFile, {
            contentType: 'audio/webm',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          return new Response(JSON.stringify({ error: uploadError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: audioRecord, error: recordError } = await supabaseClient
          .from('audio_recordings')
          .insert({
            response_id: responseId,
            organization_id: session?.organization_id || null,
            file_path: uploadData.path,
            original_filename: audioFile.name,
            file_size: audioFile.size,
            format: 'webm',
            transcription_status: 'pending'
          })
          .select()
          .single()

        if (recordError) {
          console.error('Error saving audio record:', recordError)
          return new Response(JSON.stringify({ error: recordError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: { publicUrl } } = supabaseClient.storage
          .from('assessment-audio')
          .getPublicUrl(uploadData.path)

        // Update response with audio URL
        await supabaseClient
          .from('prompt_responses')
          .update({ audio_url: publicUrl })
          .eq('id', responseId)

        return new Response(JSON.stringify({
          audio_url: publicUrl,
          file_path: uploadData.path,
          audio_record: audioRecord
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get-audio':
        const filePath = url.searchParams.get('path')
        if (!filePath) {
          return new Response(JSON.stringify({ error: 'File path required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: { publicUrl } } = supabaseClient.storage
          .from('assessment-audio')
          .getPublicUrl(filePath)

        return new Response(JSON.stringify({ audio_url: publicUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('File Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})