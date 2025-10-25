import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationHistory, sentiment, questionNumber } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating question ${questionNumber} with sentiment: ${sentiment}`);

    // Build messages for AI
    const messages = [
      {
        role: "system",
        content: `You are an empathetic AI interviewer for FairHire AI. Your goal is to conduct fair, adaptive job interviews.

CURRENT SENTIMENT: ${sentiment}

GUIDELINES:
- If sentiment is ANXIOUS: Be extra encouraging, warm, and supportive. Use gentle language and tell them to take their time.
- If sentiment is CONFUSED: Simplify your question and make it clearer. Break it down into smaller parts.
- If sentiment is CONFIDENT: Acknowledge their confidence and ask more detailed follow-up questions.
- If sentiment is NEUTRAL: Ask standard professional questions.

This is question ${questionNumber + 1} of 5. Generate ONE contextual follow-up question based on the conversation so far. The question should:
1. Build naturally on what the candidate has already shared
2. Match the detected emotional state (${sentiment})
3. Feel like a real, caring interviewer asking follow-ups
4. Be specific to their previous answers, not generic

Return ONLY the question text, nothing else.`
      }
    ];

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    console.log("Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const question = data.choices[0].message.content.trim();
    
    console.log("Generated question:", question);

    return new Response(JSON.stringify({ question }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in generate-interview-question:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
