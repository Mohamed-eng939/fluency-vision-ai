import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is assessor or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['assessor', 'admin'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;

    switch (method) {
      case 'GET':
        if (url.pathname.endsWith('/pending-assessments')) {
          return await getPendingAssessments(supabase, user.id, profile);
        } else if (url.pathname.includes('/assessment/')) {
          const sessionId = url.pathname.split('/assessment/')[1];
          return await getAssessmentForReview(supabase, user.id, sessionId, profile);
        } else if (url.pathname.endsWith('/my-reviews')) {
          return await getMyReviews(supabase, user.id);
        }
        break;

      case 'POST':
        if (url.pathname.endsWith('/assign-assessment')) {
          return await assignAssessment(req, supabase, user.id, profile);
        } else if (url.pathname.endsWith('/submit-review')) {
          return await submitAssessmentReview(req, supabase, user.id);
        }
        break;

      case 'PUT':
        if (url.pathname.includes('/review/')) {
          const reviewId = url.pathname.split('/review/')[1];
          return await updateReview(req, supabase, user.id, reviewId);
        }
        break;
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Assessor manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Get pending assessments for review
async function getPendingAssessments(supabase: any, userId: string, profile: any) {
  try {
    let query = supabase
      .from('assessment_sessions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        ),
        assignedAssessor:assigned_assessor (
          full_name,
          email
        )
      `)
      .in('status', ['completed', 'under_review'])
      .order('created_at', { ascending: false });

    // If user is assessor (not admin), filter by organization
    if (profile.role === 'assessor') {
      query = query.eq('organization_id', profile.organization_id);
    }

    const { data: assessments, error } = await query;

    if (error) {
      console.error('Get pending assessments error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending assessments' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, assessments }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get pending assessments error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get assessment details for review
async function getAssessmentForReview(supabase: any, userId: string, sessionId: string, profile: any) {
  try {
    // Get session with user details
    let sessionQuery = supabase
      .from('assessment_sessions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', sessionId);

    // If user is assessor (not admin), filter by organization
    if (profile.role === 'assessor') {
      sessionQuery = sessionQuery.eq('organization_id', profile.organization_id);
    }

    const { data: session, error: sessionError } = await sessionQuery.single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Assessment not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get responses with prompt details
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        prompts:prompt_id (
          title,
          content,
          type,
          cefr_level,
          instructions
        )
      `)
      .eq('session_id', sessionId)
      .order('prompt_order');

    if (responsesError) {
      console.error('Get responses error:', responsesError);
    }

    // Get existing reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('assessor_reviews')
      .select(`
        *,
        assessor:assessor_id (
          full_name,
          email
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Get reviews error:', reviewsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session, 
        responses: responses || [], 
        reviews: reviews || [] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get assessment for review error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Get assessor's own reviews
async function getMyReviews(supabase: any, userId: string) {
  try {
    const { data: reviews, error } = await supabase
      .from('assessor_reviews')
      .select(`
        *,
        assessment_sessions (
          id,
          overall_score,
          overall_cefr_level,
          status,
          created_at,
          profiles:user_id (
            full_name,
            email
          )
        )
      `)
      .eq('assessor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get my reviews error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch reviews' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, reviews }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get my reviews error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Assign assessment to assessor (admin only)
async function assignAssessment(req: Request, supabase: any, userId: string, profile: any) {
  try {
    if (profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can assign assessments' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sessionId, assessorId } = await req.json();

    const { data: session, error } = await supabase
      .from('assessment_sessions')
      .update({
        assigned_assessor: assessorId,
        status: 'under_review'
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Assign assessment error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to assign assessment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, session }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Assign assessment error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Submit assessment review
async function submitAssessmentReview(req: Request, supabase: any, userId: string) {
  try {
    const { 
      sessionId, 
      overrideScores, 
      assessorFeedback, 
      recommendation, 
      reviewStatus 
    } = await req.json();

    // Verify assessor can review this assessment
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('id, assigned_assessor, organization_id')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Assessment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create review record
    const { data: review, error } = await supabase
      .from('assessor_reviews')
      .insert({
        session_id: sessionId,
        assessor_id: userId,
        organization_id: session.organization_id,
        review_status: reviewStatus || 'pending',
        override_scores: overrideScores,
        assessor_feedback: assessorFeedback,
        recommendation: recommendation
      })
      .select()
      .single();

    if (error) {
      console.error('Submit review error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit review', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update session status if approved/rejected
    if (reviewStatus === 'approved' || reviewStatus === 'rejected') {
      await supabase
        .from('assessment_sessions')
        .update({
          status: reviewStatus,
          reviewed_at: new Date().toISOString(),
          has_score_override: !!overrideScores
        })
        .eq('id', sessionId);
    }

    return new Response(
      JSON.stringify({ success: true, review }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Submit assessment review error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Update existing review
async function updateReview(req: Request, supabase: any, userId: string, reviewId: string) {
  try {
    const updateData = await req.json();

    const { data: review, error } = await supabase
      .from('assessor_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .eq('assessor_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update review error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update review' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, review }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update review error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request data' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}