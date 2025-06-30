import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NudgeRequest {
  projectId: string
  userId: string
  nudgeType: 'reminder' | 'motivation' | 'workload_balance'
  message?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { projectId, userId, nudgeType, message }: NudgeRequest = await req.json()

    if (!projectId || !userId || !nudgeType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user and project data
    const { data: project } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate personalized nudge message
    const nudgeMessage = generateNudgeMessage(nudgeType, message)

    // Send nudge via ElevenLabs (voice message)
    const voiceNudge = await generateVoiceNudge(nudgeMessage)

    // Store nudge in database
    const { data: nudgeRecord, error: dbError } = await supabaseClient
      .from('ai_nudges')
      .insert({
        project_id: projectId,
        user_id: userId,
        nudge_type: nudgeType,
        message: nudgeMessage,
        voice_url: voiceNudge.audioUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: nudgeMessage,
        voiceUrl: voiceNudge.audioUrl,
        nudgeId: nudgeRecord?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI nudge error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateNudgeMessage(nudgeType: string, customMessage?: string): string {
  if (customMessage) {
    return customMessage
  }

  switch (nudgeType) {
    case 'reminder':
      return "Hi there! Just a friendly reminder that you haven't logged any activity in the past few days. Your team is counting on your contributions. Would you like to update your progress or check out what tasks are available?"
    
    case 'motivation':
      return "You're doing great work on this project! Your contributions are valuable to the team. Keep up the excellent collaboration and don't hesitate to reach out if you need any support."
    
    case 'workload_balance':
      return "I noticed there might be an opportunity to better balance the workload in your team. Consider discussing task redistribution with your teammates to ensure everyone can contribute effectively."
    
    default:
      return "Hope your project is going well! Remember that consistent collaboration and communication are key to success. Keep up the great work!"
  }
}

async function generateVoiceNudge(message: string): Promise<{ audioUrl: string }> {
  try {
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    
    if (!elevenlabsApiKey) {
      console.log('ElevenLabs API key not found, skipping voice generation')
      return { audioUrl: '' }
    }

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey
      },
      body: JSON.stringify({
        text: message,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status)
      return { audioUrl: '' }
    }

    const audioBlob = await response.blob()
    
    // In a real implementation, you'd upload this to storage and return the URL
    // For now, we'll return a placeholder
    return { audioUrl: `https://example.com/nudge-audio-${Date.now()}.mp3` }

  } catch (error) {
    console.error('Voice generation error:', error)
    return { audioUrl: '' }
  }
}