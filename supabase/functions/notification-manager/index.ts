import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationData {
  type: 'session_completed' | 'access_granted' | 'access_expiring' | 'review_required';
  recipient_id: string;
  title: string;
  message: string;
  data?: any;
  send_email?: boolean;
}

// Mock email service - replace with actual email service like Resend
const sendEmail = async (to: string, subject: string, html: string) => {
  console.log(`Email would be sent to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${html}`)
  // Implementation depends on your email service
  return { success: true }
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
    const method = req.method
    const action = url.pathname.split('/').pop()

    console.log(`Notification Manager: ${method} ${action}`)

    switch (action) {
      case 'send':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const notificationData: NotificationData = await req.json()

        // Validate required fields
        if (!notificationData.recipient_id || !notificationData.title || !notificationData.message) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get recipient info
        const { data: recipient, error: recipientError } = await supabaseClient
          .from('profiles')
          .select('id, name, email, preferred_language')
          .eq('id', notificationData.recipient_id)
          .single()

        if (recipientError || !recipient) {
          return new Response(JSON.stringify({ error: 'Recipient not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Send email if requested and email is available
        let emailSent = false
        if (notificationData.send_email && recipient.email) {
          try {
            const emailResult = await sendEmail(
              recipient.email,
              notificationData.title,
              `
                <h1>${notificationData.title}</h1>
                <p>Dear ${recipient.name || 'User'},</p>
                <p>${notificationData.message}</p>
                <br>
                <p>Best regards,<br>The Assessment Team</p>
              `
            )
            emailSent = emailResult.success
          } catch (emailError) {
            console.error('Error sending email:', emailError)
          }
        }

        console.log(`Notification sent to ${recipient.id}: ${notificationData.title}`)
        return new Response(JSON.stringify({
          message: 'Notification sent successfully',
          email_sent: emailSent,
          recipient: {
            id: recipient.id,
            name: recipient.name,
            email: recipient.email
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'bulk-send':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { recipient_ids, title, message, send_email = false } = await req.json()

        if (!recipient_ids || !Array.isArray(recipient_ids) || !title || !message) {
          return new Response(JSON.stringify({ error: 'Invalid bulk notification data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get all recipients
        const { data: recipients, error: recipientsError } = await supabaseClient
          .from('profiles')
          .select('id, name, email')
          .in('id', recipient_ids)

        if (recipientsError) {
          console.error('Error fetching recipients:', recipientsError)
          return new Response(JSON.stringify({ error: recipientsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Send notifications
        const results = []
        for (const recipient of recipients || []) {
          let emailSent = false
          if (send_email && recipient.email) {
            try {
              const emailResult = await sendEmail(
                recipient.email,
                title,
                `
                  <h1>${title}</h1>
                  <p>Dear ${recipient.name || 'User'},</p>
                  <p>${message}</p>
                  <br>
                  <p>Best regards,<br>The Assessment Team</p>
                `
              )
              emailSent = emailResult.success
            } catch (emailError) {
              console.error(`Error sending email to ${recipient.email}:`, emailError)
            }
          }

          results.push({
            recipient_id: recipient.id,
            email_sent: emailSent
          })
        }

        console.log(`Bulk notification sent to ${results.length} recipients`)
        return new Response(JSON.stringify({
          message: 'Bulk notifications sent',
          results,
          total_sent: results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'session-completed':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
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

        // Get session details
        const { data: session, error: sessionError } = await supabaseClient
          .from('assessment_sessions')
          .select(`
            id,
            user_id,
            student_name,
            overall_score,
            cefr_level,
            session_type,
            profiles!assessment_sessions_user_id_fkey (
              name,
              email
            )
          `)
          .eq('id', session_id)
          .single()

        if (sessionError || !session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Send completion notification
        if (session.user_id && session.profiles?.email) {
          await sendEmail(
            session.profiles.email,
            'Assessment Completed',
            `
              <h1>Assessment Completed!</h1>
              <p>Dear ${session.profiles.name || session.student_name || 'User'},</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Assessment Results</h3>
                <p><strong>Type:</strong> ${session.session_type}</p>
                <p><strong>Overall Score:</strong> ${session.overall_score || 'Pending'}</p>
                <p><strong>CEFR Level:</strong> ${session.cefr_level || 'Being calculated'}</p>
              </div>
              <p>You can view your detailed results and feedback in your dashboard.</p>
              <br>
              <p>Best regards,<br>The Assessment Team</p>
            `
          )
        }

        return new Response(JSON.stringify({
          message: 'Session completion notification sent',
          session_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'access-expiring':
        if (method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Find users whose access is expiring in the next 7 days
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        
        const { data: expiringUsers, error: expiringError } = await supabaseClient
          .from('profiles')
          .select('id, name, email, access_expires_at, assessment_credits')
          .eq('has_assessment_access', true)
          .not('access_expires_at', 'is', null)
          .lte('access_expires_at', sevenDaysFromNow.toISOString())

        if (expiringError) {
          console.error('Error fetching expiring users:', expiringError)
          return new Response(JSON.stringify({ error: expiringError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Send expiration warnings
        const notifiedUsers = []
        for (const user of expiringUsers || []) {
          if (user.email) {
            const daysUntilExpiry = Math.ceil(
              (new Date(user.access_expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
            )

            await sendEmail(
              user.email,
              'Assessment Access Expiring Soon',
              `
                <h1>Access Expiring Soon</h1>
                <p>Dear ${user.name || 'User'},</p>
                <p>Your assessment access will expire in ${daysUntilExpiry} day(s).</p>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Expiration Date:</strong> ${new Date(user.access_expires_at).toLocaleDateString()}</p>
                  <p><strong>Remaining Credits:</strong> ${user.assessment_credits || 0}</p>
                </div>
                <p>Please contact your administrator to renew your access.</p>
                <br>
                <p>Best regards,<br>The Assessment Team</p>
              `
            )
            notifiedUsers.push(user.id)
          }
        }

        return new Response(JSON.stringify({
          message: 'Access expiry notifications sent',
          notified_users: notifiedUsers.length,
          expiring_users: expiringUsers?.length || 0
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
    console.error('Notification Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})