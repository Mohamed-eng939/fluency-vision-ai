import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, metrics, audioAnalysis, promptText, cefrLevel } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare detailed performance analysis for AI
    const performanceData = {
      transcript: transcript || "No transcript available",
      promptText: promptText || "Speaking prompt",
      scores: {
        fluency: metrics.fluency || 0,
        grammar: metrics.grammar || 0,
        vocabulary: metrics.vocabulary || 0,
        coherence: metrics.coherence || 0,
        pronunciation: metrics.pronunciation || 0,
        prosody: metrics.prosody || 0,
        syntax: metrics.syntax || 0
      },
      audioMetrics: {
        wpm: audioAnalysis?.wpm || 0,
        pauseRatio: audioAnalysis?.pauseRatio || 0,
        pauseCount: audioAnalysis?.pauseCount || 0,
        speechRate: audioAnalysis?.speechRate || 0,
        syllablesPerMinute: audioAnalysis?.syllablesPerMinute || 0
      },
      targetLevel: cefrLevel || "B1"
    };

    const systemPrompt = `You are an expert CEFR-aligned English language assessor. Analyze the learner's spoken response and provide personalized, specific feedback.

IMPORTANT GUIDELINES:
- Analyze the ACTUAL transcript and performance metrics provided
- Give specific, actionable feedback based on real issues detected
- Mention concrete problems you observe (tense errors, vocabulary gaps, fluency issues)
- Be encouraging but honest about areas for improvement
- Avoid generic templates - make feedback unique to this learner
- Reference specific words/phrases from their transcript when relevant
- Keep feedback concise but insightful (2-3 sentences per skill)

PERFORMANCE METRICS TO CONSIDER:
- Speech rate and pause patterns for fluency assessment
- Actual vocabulary range and repetition in transcript
- Grammar patterns and errors visible in speech
- Coherence based on logical flow and discourse markers used
- Pronunciation clarity indicators from audio analysis

Provide feedback in this JSON format:
{
  "fluency": "specific fluency feedback based on pause ratio, speech rate, and hesitations",
  "grammar": "specific grammar feedback based on visible errors in transcript",
  "vocabulary": "specific vocabulary feedback based on word choice and range observed",
  "coherence": "specific coherence feedback based on organization and linking",
  "pronunciation": "specific pronunciation feedback based on audio analysis",
  "prosody": "specific prosody feedback based on rhythm and stress patterns",
  "syntax": "specific syntax feedback based on sentence structure variety",
  "overall": "encouraging overall comment highlighting strengths and key improvement area"
}`;

    const userPrompt = `PROMPT: "${performanceData.promptText}"

LEARNER'S RESPONSE: "${performanceData.transcript}"

PERFORMANCE SCORES (0-10 scale):
- Fluency: ${performanceData.scores.fluency}
- Grammar: ${performanceData.scores.grammar}  
- Vocabulary: ${performanceData.scores.vocabulary}
- Coherence: ${performanceData.scores.coherence}
- Pronunciation: ${performanceData.scores.pronunciation}
- Prosody: ${performanceData.scores.prosody}
- Syntax: ${performanceData.scores.syntax}

AUDIO ANALYSIS:
- Words per minute: ${performanceData.audioMetrics.wpm}
- Pause ratio: ${(performanceData.audioMetrics.pauseRatio * 100).toFixed(1)}%
- Pause count: ${performanceData.audioMetrics.pauseCount}
- Syllables per minute: ${performanceData.audioMetrics.syllablesPerMinute}

TARGET CEFR LEVEL: ${performanceData.targetLevel}

Analyze this specific performance and provide personalized feedback based on what you actually observe.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const feedbackText = data.choices[0].message.content;
    
    // Parse JSON feedback
    let feedback;
    try {
      feedback = JSON.parse(feedbackText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      feedback = {
        fluency: "Generated feedback analysis complete",
        grammar: "Generated feedback analysis complete", 
        vocabulary: "Generated feedback analysis complete",
        coherence: "Generated feedback analysis complete",
        pronunciation: "Generated feedback analysis complete",
        prosody: "Generated feedback analysis complete",
        syntax: "Generated feedback analysis complete",
        overall: feedbackText
      };
    }

    return new Response(JSON.stringify({ 
      feedback,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in personalized-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});