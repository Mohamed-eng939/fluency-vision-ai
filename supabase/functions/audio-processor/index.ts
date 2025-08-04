import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AudioUploadData {
  session_id: string;
  response_id?: string;
  audio_blob: string;  
  original_filename?: string;
  format?: string;
  duration?: number;
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

    const method = req.method
    console.log(`Audio Processor: ${method} request for user ${user?.id}`)

    switch (method) {
      case 'POST':
        const uploadData: AudioUploadData = await req.json()

        // Validate required fields
        if (!uploadData.session_id || !uploadData.audio_blob) {
          return new Response(JSON.stringify({ error: 'Session ID and audio blob are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Fetch session first
        const { data: session, error: sessionError } = await supabaseClient
          .from('assessment_sessions')
          .select('id, organization_id, user_id')
          .eq('id', uploadData.session_id)
          .single()

        if (sessionError || !session) {
          return new Response(JSON.stringify({ error: 'Invalid session' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check access permissions
        if (user && session.user_id !== user.id) {
          return new Response(JSON.stringify({ error: 'Access denied' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Fix base64 decoding and create both buffer and blob
        let audioBuffer: Uint8Array;
        let audioBlob: Blob;
        try {
          const binaryString = atob(uploadData.audio_blob);
          audioBuffer = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            audioBuffer[i] = binaryString.charCodeAt(i);
          }
          audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Invalid audio data format' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const fileName = `${uploadData.session_id}/${timestamp}_${uploadData.original_filename || 'recording.webm'}`

        const { data: uploadResult, error: uploadError } = await supabaseClient.storage
          .from('assessment-audio')
          .upload(fileName, audioBlob, {
            contentType: 'audio/webm',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading audio:', uploadError)
          return new Response(JSON.stringify({ error: 'Failed to upload audio' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Save audio record to database
        const { data: audioRecord, error: dbError } = await supabaseClient
          .from('audio_recordings')
          .insert({
            response_id: uploadData.response_id,
            organization_id: session.organization_id,
            file_path: uploadResult.path,
            original_filename: uploadData.original_filename,
            format: uploadData.format || 'webm',
            duration: uploadData.duration,
            file_size: audioBuffer.length,
            transcription_status: 'pending'
          })
          .select()
          .single()

        if (dbError) {
          console.error('Error saving audio record:', dbError)
          return new Response(JSON.stringify({ error: 'Failed to save audio record' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get signed URL for the uploaded file
        const { data: signedUrlData } = await supabaseClient.storage
          .from('assessment-audio')
          .createSignedUrl(uploadResult.path, 3600) // 1 hour expiry

        console.log('Audio uploaded successfully:', audioRecord.id)
        return new Response(JSON.stringify({
          audio_record: audioRecord,
          audio_url: signedUrlData?.signedUrl,
          message: 'Audio uploaded successfully'
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'GET':
        const url = new URL(req.url)
        const recordId = url.searchParams.get('record_id')

        if (!recordId) {
          return new Response(JSON.stringify({ error: 'Record ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get audio record
        const { data: record, error: fetchError } = await supabaseClient
          .from('audio_recordings')
          .select('*')
          .eq('id', recordId)
          .single()

        if (fetchError || !record) {
          return new Response(JSON.stringify({ error: 'Audio record not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Generate signed URL
        const { data: urlData, error: urlError } = await supabaseClient.storage
          .from('assessment-audio')
          .createSignedUrl(record.file_path, 3600)

        if (urlError) {
          console.error('Error creating signed URL:', urlError)
          return new Response(JSON.stringify({ error: 'Failed to generate audio URL' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          audio_record: record,
          audio_url: urlData.signedUrl
        }), {
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