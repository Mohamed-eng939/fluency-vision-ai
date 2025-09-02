import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProfileData {
  id?: string;
  organization_id?: string;
  name?: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  nationality?: string;
  native_language?: string;
  preferred_language?: string;
  timezone?: string;
  role?: string;
  has_assessment_access?: boolean;
  assessment_credits?: number;
  access_granted_by?: string;
  access_granted_at?: string;
  access_expires_at?: string;
  subscription_status?: string;
  payment_status?: string;
  is_active?: boolean;
  last_login_at?: string;
  estimatedLevel?: string;
  firstLanguage?: string;
  country_of_citizenship?: string;
  country_of_residence?: string;
  preferredContact?: string;
  pronunciationPreference?: string;
  testReason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create Supabase client with proper authorization
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: authHeader
          } 
        } 
      }
    )

    // Get authenticated user from the JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    console.log('Auth check:', { user: user?.id, authError });
    
    if (authError) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: `Authentication failed: ${authError.message}` }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    if (!user) {
      console.error('No user found in JWT token');
      return new Response(JSON.stringify({ error: 'No user found in token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const method = req.method
    const profileId = url.pathname.split('/').pop()

    console.log(`Profile Manager: ${method} request for user ${user.id}`)

    // Check if user is trying to access another user's profile
    const targetUserId = (profileId && profileId !== 'profile-manager') ? profileId : user.id

    // Get current user's role for permission checks
    const { data: currentUserProfile } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .maybeSingle()

    // Permission check: users can only access their own profile unless they're admin
    if (targetUserId !== user.id && currentUserProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    switch (method) {
      case 'GET':
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle()

        if (error) {
          console.error('Error fetching profile:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (!profile) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({ profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'POST':
      case 'PUT':
        // Only allow users to update their own profile (unless admin)
        if (targetUserId !== user.id && currentUserProfile?.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Can only update own profile' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const profileData: ProfileData = await req.json()

        // Basic validation
        if (profileData.name !== undefined && profileData.name.trim() === '') {
          return new Response(JSON.stringify({ error: 'Name cannot be empty' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (profileData.email !== undefined && (!profileData.email || !profileData.email.includes('@'))) {
          return new Response(JSON.stringify({ error: 'Valid email is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Prevent non-admins from changing sensitive fields
        if (currentUserProfile?.role !== 'admin') {
          delete profileData.role;
          delete profileData.has_assessment_access;
          delete profileData.assessment_credits;
          delete profileData.access_granted_by;
          delete profileData.access_granted_at;
          delete profileData.access_expires_at;
          delete profileData.organization_id;
        }

        // Remove id from update data to prevent ID changes
        delete profileData.id;

        const { data: updatedProfile, error: upsertError } = await supabaseClient
          .from('profiles')
          .upsert({
            id: targetUserId,
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .select()
          .maybeSingle()

        if (upsertError) {
          console.error('Error upserting profile:', upsertError)
          return new Response(JSON.stringify({ error: upsertError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (!updatedProfile) {
          return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Profile updated successfully for user:', targetUserId)
        return new Response(JSON.stringify({ 
          profile: updatedProfile,
          message: 'Profile updated successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'DELETE':
        // Only allow users to deactivate their own profile (unless admin)
        if (targetUserId !== user.id && currentUserProfile?.role !== 'admin') {
          return new Response(JSON.stringify({ error: 'Can only deactivate own profile' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data: deactivatedProfile, error: deleteError } = await supabaseClient
          .from('profiles')
          .update({ 
            is_active: false, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', targetUserId)
          .select()
          .maybeSingle()

        if (deleteError) {
          console.error('Error deactivating profile:', deleteError)
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (!deactivatedProfile) {
          return new Response(JSON.stringify({ error: 'Profile not found for deactivation' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Profile deactivated successfully for user:', targetUserId)
        return new Response(JSON.stringify({ 
          profile: deactivatedProfile,
          message: 'Profile deactivated successfully' 
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
    console.error('Profile Manager Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})