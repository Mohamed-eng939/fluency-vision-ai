import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AudioUploadData {
  response_id: string;
  file_path: string;
  file_size?: number;
  duration?: number;
  format?: string;
  sample_rate?: number;
  bit_rate?: number;
  channels?: number;
  original_filename?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Audio Processor - Auth header present:', !!authHeader);
    
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
    
    console.log('Audio Processor - Authenticated user:', user?.id);

    const url = new URL(req.url)
    const method = req.method
    const audioId = url.pathname.split('/').pop()

    console.log(`Audio Processor: ${method} request for user ${user?.id}`)

    switch (method) {
      case 'GET':
        if (audioId && audioId !== 'audio-processor') {
          // Get specific audio recording
          const { data: audio, error } = await supabaseClient
            .from('audio_recordings')
            .select('*')
            .eq('id', audioId)
            .single()

          if (error) {
            console.error('Error fetching audio:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          // Get signed URL for the audio file
          const { data: signedUrl } = await supabaseClient.storage
            .from('assessment-audio')
            .createSignedUrl(audio.file_path, 3600) // 1 hour expiry

          return new Response(JSON.stringify({ 
            audio: { ...audio, signed_url: signedUrl?.signedUrl }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // Get audio recordings for a response
          const responseId = url.searchParams.get('response_id');
          
          if (!responseId) {
            return new Response(JSON.stringify({ error: 'response_id parameter required' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          const { data: recordings, error } = await supabaseClient
            .from('audio_recordings')
            .select('*')
            .eq('response_id', responseId)

          if (error) {
            console.error('Error fetching recordings:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          // Get signed URLs for all recordings
          const recordingsWithUrls = await Promise.all(
            recordings.map(async (recording) => {
              const { data: signedUrl } = await supabaseClient.storage
                .from('assessment-audio')
                .createSignedUrl(recording.file_path, 3600)
              
              return {
                ...recording,
                signed_url: signedUrl?.signedUrl
              }
            })
          )

          return new Response(JSON.stringify({ recordings: recordingsWithUrls }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

      case 'POST':
        const audioData: AudioUploadData = await req.json()
        
        // Verify response ownership if user is authenticated
        if (user) {
          const { data: response } = await supabaseClient
            .from('prompt_responses')
            .select(`
              session_id,
              assessment_sessions!inner(user_id)
            `)
            .eq('id', audioData.response_id)
            .single()

          if (response && response.assessment_sessions.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: newAudio, error: createError } = await supabaseClient
          .from('audio_recordings')
          .insert({
            response_id: audioData.response_id,
            file_path: audioData.file_path,
            file_size: audioData.file_size,
            duration: audioData.duration,
            format: audioData.format || 'webm',
            sample_rate: audioData.sample_rate,
            bit_rate: audioData.bit_rate,
            channels: audioData.channels || 1,
            original_filename: audioData.original_filename,
            is_processed: false
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating audio record:', createError)
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Audio record created successfully:', newAudio.id)
        return new Response(JSON.stringify({ audio: newAudio }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'PUT':
        if (!audioId || audioId === 'audio-processor') {
          return new Response(JSON.stringify({ error: 'Audio ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData = await req.json()
        
        // Verify ownership if user is authenticated
        if (user) {
          const { data: audioCheck } = await supabaseClient
            .from('audio_recordings')
            .select(`
              response_id,
              prompt_responses!inner(
                session_id,
                assessment_sessions!inner(user_id)
              )
            `)
            .eq('id', audioId)
            .single()

          if (audioCheck && audioCheck.prompt_responses.assessment_sessions.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
        }

        const { data: updatedAudio, error: updateError } = await supabaseClient
          .from('audio_recordings')
          .update(updateData)
          .eq('id', audioId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating audio:', updateError)
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ audio: updatedAudio }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Audio Processor Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})