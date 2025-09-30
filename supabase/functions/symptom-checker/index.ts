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
    const { symptoms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!symptoms || symptoms.trim().length === 0) {
      throw new Error('Symptoms are required');
    }

    console.log('Processing symptom assessment for:', symptoms);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant for symptom assessment. Analyze symptoms and provide a structured response with:
            1. Triage level (LOW, MEDIUM, HIGH)
            2. Recommended action (self-care, elder advice, doctor visit, emergency)
            3. Suggested medical specialties (if applicable)
            4. Basic home remedies (for low-severity cases only)
            5. Clear disclaimer

            Guidelines:
            - LOW: Minor symptoms that can be managed at home
            - MEDIUM: Symptoms that warrant medical consultation
            - HIGH: Urgent symptoms requiring immediate medical attention
            
            Always include a disclaimer that this is not a substitute for professional medical advice.`
          },
          {
            role: 'user',
            content: `Please assess these symptoms: ${symptoms}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'symptom_assessment',
              description: 'Provide structured symptom assessment',
              parameters: {
                type: 'object',
                properties: {
                  triage_level: {
                    type: 'string',
                    enum: ['LOW', 'MEDIUM', 'HIGH']
                  },
                  recommended_action: {
                    type: 'string',
                    description: 'Recommended next steps for the patient'
                  },
                  suggested_specialties: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    description: 'Medical specialties that could help with these symptoms'
                  },
                  home_remedies: {
                    type: 'string',
                    description: 'Home remedies for low-severity symptoms only'
                  },
                  explanation: {
                    type: 'string',
                    description: 'Brief explanation of the assessment'
                  }
                },
                required: ['triage_level', 'recommended_action', 'explanation']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'symptom_assessment' } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', data);

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const assessment = JSON.parse(toolCall.function.arguments);
    console.log('Parsed assessment:', assessment);

    return new Response(JSON.stringify({
      success: true,
      assessment: {
        triage_level: assessment.triage_level,
        recommended_action: assessment.recommended_action,
        suggested_specialties: assessment.suggested_specialties || [],
        home_remedies: assessment.home_remedies || null,
        explanation: assessment.explanation,
        disclaimer: "This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in symptom-checker function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});