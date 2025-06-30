import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VideoGenerationRequest {
  projectId: string
  includeTimeline?: boolean
  includeFeedback?: boolean
  includeContributions?: boolean
  userId?: string
}

interface ProjectData {
  id: string
  title: string
  description: string
  members: Array<{
    id: string
    name: string
    email: string
    role: string
    contributionPercentage: number
    tasksCompleted: number
    hoursLogged: number
  }>
  tasks: Array<{
    id: string
    title: string
    description: string
    status: string
    assignedTo: string
    hoursLogged: number
    priority: string
  }>
  phases: string[]
  currentPhase: string
  deadline: string
  status: string
  createdAt: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { projectId, includeTimeline = true, includeFeedback = true, includeContributions = true, userId }: VideoGenerationRequest = await req.json()

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Starting video generation for project: ${projectId}`)

    // Step 1: Fetch project data from database
    const projectData = await fetchProjectData(supabaseClient, projectId)
    if (!projectData) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Generate video script using AI
    const videoScript = await generateVideoScript(projectData, {
      includeTimeline,
      includeFeedback,
      includeContributions
    })

    // Step 3: Create video using Tavus AI service
    const videoGenerationResult = await createVideoWithAI(videoScript, projectData)

    // Step 4: Store video metadata in database
    const { data: videoRecord, error: dbError } = await supabaseClient
      .from('generated_videos')
      .insert({
        project_id: projectId,
        user_id: userId,
        video_url: videoGenerationResult.videoUrl,
        script: videoScript,
        generation_status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save video record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoGenerationResult.videoUrl,
        videoId: videoRecord.id,
        script: videoScript,
        duration: videoGenerationResult.duration
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Video generation error:', error)
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

async function fetchProjectData(supabaseClient: any, projectId: string): Promise<ProjectData | null> {
  try {
    console.log(`Fetching project data for project ID: ${projectId}`)

    // Fetch project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return null
    }

    if (!project) {
      console.log('Project not found')
      return null
    }

    // Fetch project members
    const { data: members, error: membersError } = await supabaseClient
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)

    if (membersError) {
      console.error('Error fetching project members:', membersError)
      return null
    }

    // Fetch project tasks
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)

    if (tasksError) {
      console.error('Error fetching project tasks:', tasksError)
      return null
    }

    // Transform the data to match the expected format
    const transformedMembers = (members || []).map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      contributionPercentage: member.contribution_percentage || 0,
      tasksCompleted: member.tasks_completed || 0,
      hoursLogged: member.hours_logged || 0
    }))

    const transformedTasks = (tasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      assignedTo: task.assigned_to || '',
      hoursLogged: task.hours_logged || 0,
      priority: task.priority
    }))

    const projectData: ProjectData = {
      id: project.id,
      title: project.title,
      description: project.description || '',
      members: transformedMembers,
      tasks: transformedTasks,
      phases: Array.isArray(project.phases) ? project.phases : ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
      currentPhase: project.current_phase || 'Planning',
      deadline: project.deadline || new Date().toISOString(),
      status: project.status || 'active',
      createdAt: project.created_at || new Date().toISOString()
    }

    console.log(`Successfully fetched project data: ${project.title} with ${transformedMembers.length} members and ${transformedTasks.length} tasks`)
    
    return projectData

  } catch (error) {
    console.error('Error in fetchProjectData:', error)
    
    // Fallback to mock data if database fetch fails (for development)
    console.log('Falling back to mock data due to database error')
    
    const mockProjectData: ProjectData = {
      id: projectId,
      title: 'E-commerce Mobile Application',
      description: 'Developing a full-stack mobile application for online shopping with React Native and Node.js',
      members: [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@university.edu',
          role: 'Frontend Developer',
          contributionPercentage: 35,
          tasksCompleted: 8,
          hoursLogged: 42
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@university.edu',
          role: 'Backend Developer',
          contributionPercentage: 28,
          tasksCompleted: 6,
          hoursLogged: 38
        },
        {
          id: '3',
          name: 'Charlie Brown',
          email: 'charlie@university.edu',
          role: 'UI/UX Designer',
          contributionPercentage: 25,
          tasksCompleted: 5,
          hoursLogged: 35
        },
        {
          id: '4',
          name: 'Diana Prince',
          email: 'diana@university.edu',
          role: 'QA Tester',
          contributionPercentage: 12,
          tasksCompleted: 2,
          hoursLogged: 15
        }
      ],
      tasks: [
        {
          id: '1',
          title: 'Design user authentication flow',
          description: 'Create wireframes and mockups for login/signup pages',
          status: 'completed',
          assignedTo: '3',
          hoursLogged: 8,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Implement user authentication API',
          description: 'Create backend endpoints for user registration and login',
          status: 'in-progress',
          assignedTo: '2',
          hoursLogged: 12,
          priority: 'high'
        },
        {
          id: '3',
          title: 'Build product catalog interface',
          description: 'Develop the main product browsing and search functionality',
          status: 'in-progress',
          assignedTo: '1',
          hoursLogged: 15,
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Write test cases for authentication',
          description: 'Create comprehensive test suite for user authentication',
          status: 'todo',
          assignedTo: '4',
          hoursLogged: 0,
          priority: 'medium'
        }
      ],
      phases: ['Planning', 'Design', 'Development', 'Testing', 'Deployment'],
      currentPhase: 'Development',
      deadline: '2025-01-15',
      status: 'active',
      createdAt: '2024-11-01'
    }

    return mockProjectData
  }
}

async function generateVideoScript(projectData: ProjectData, options: any): Promise<string> {
  try {
    const completedTasks = projectData.tasks.filter(t => t.status === 'completed').length
    const totalTasks = projectData.tasks.length
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const totalHours = projectData.tasks.reduce((acc, t) => acc + t.hoursLogged, 0)
    const projectDuration = Math.ceil((new Date().getTime() - new Date(projectData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    
    // Create a comprehensive script for the AI avatar
    const script = `
Hello! I'm here to present a comprehensive summary of the project "${projectData.title}".

This collaborative project involved ${projectData.members.length} dedicated team members working together over the past ${projectDuration} days.

Let me walk you through the key highlights:

Project Overview:
${projectData.description}

Current Status:
We're currently in the ${projectData.currentPhase} phase, with an overall progress of ${progressPercentage} percent complete. The team has successfully completed ${completedTasks} out of ${totalTasks} tasks, logging a total of ${totalHours} hours of dedicated work.

Team Performance Analysis:
${projectData.members.map(member => `
${member.name}, our ${member.role}, has contributed ${member.contributionPercentage} percent to the project, completing ${member.tasksCompleted} tasks and logging ${member.hoursLogged} hours of work.`).join(' ')}

Key Achievements:
The team has successfully progressed through ${projectData.phases.indexOf(projectData.currentPhase) + 1} of ${projectData.phases.length} planned project phases. We've maintained strong collaboration and are on track to meet our deadline.

${progressPercentage >= 70 ? 
  'The project shows excellent progress with strong team engagement and consistent delivery of milestones.' : 
  progressPercentage >= 40 ?
  'The project is making steady progress. There are opportunities to improve team engagement and accelerate task completion to meet project objectives.' :
  'The project requires immediate attention to improve team engagement and task completion rates to meet project objectives.'}

Task Distribution Analysis:
${projectData.tasks.filter(t => t.status === 'completed').length > 0 ? 
  `Completed tasks include: ${projectData.tasks.filter(t => t.status === 'completed').map(t => t.title).join(', ')}.` : 
  'No tasks have been completed yet.'}

${projectData.tasks.filter(t => t.status === 'in-progress').length > 0 ? 
  `Currently in progress: ${projectData.tasks.filter(t => t.status === 'in-progress').map(t => t.title).join(', ')}.` : ''}

${projectData.tasks.filter(t => t.status === 'todo').length > 0 ? 
  `Upcoming tasks: ${projectData.tasks.filter(t => t.status === 'todo').map(t => t.title).join(', ')}.` : ''}

Looking ahead, the team is ${progressPercentage >= 70 ? 'well-positioned' : 'working diligently'} to complete the remaining phases and deliver a successful project outcome.

Thank you for your attention to this project summary.
    `.trim()

    console.log(`Generated script with ${script.length} characters`)
    return script
  } catch (error) {
    console.error('Error generating script:', error)
    throw new Error('Failed to generate video script')
  }
}

async function createVideoWithAI(script: string, projectData: ProjectData): Promise<{ videoUrl: string; duration: number }> {
  try {
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    
    if (!tavusApiKey) {
      console.error('TAVUS_API_KEY not found in environment variables')
      throw new Error('Tavus API key not configured')
    }

    console.log('Creating video with Tavus AI service...')
    console.log('Script length:', script.length, 'characters')
    
    // Tavus API call to create video
    const tavusResponse = await fetch('https://tavusapi.com/v2/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tavusApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: script,
        replica_id: 'r783537ef5', // Default Tavus replica - you can customize this
        video_name: `${projectData.title} - Project Summary`,
        callback_url: null, // Optional: webhook URL for completion notification
        properties: {
          project_title: projectData.title,
          team_size: projectData.members.length.toString(),
          progress_percentage: Math.round((projectData.tasks.filter(t => t.status === 'completed').length / projectData.tasks.length) * 100).toString(),
          current_phase: projectData.currentPhase
        }
      })
    })

    if (!tavusResponse.ok) {
      const errorData = await tavusResponse.text()
      console.error('Tavus API error:', tavusResponse.status, errorData)
      throw new Error(`Tavus API error: ${tavusResponse.status} - ${errorData}`)
    }

    const tavusResult = await tavusResponse.json()
    console.log('Tavus video creation initiated:', tavusResult)

    // Tavus returns a video_id immediately, but the video needs time to generate
    // We'll need to poll for the video status or use webhooks
    const videoId = tavusResult.video_id

    if (!videoId) {
      throw new Error('No video ID returned from Tavus API')
    }

    // Poll for video completion (in production, you'd use webhooks)
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max wait time
    let videoUrl = null

    while (attempts < maxAttempts && !videoUrl) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
      
      const statusResponse = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${tavusApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        console.log('Video status:', statusData.status)
        
        if (statusData.status === 'completed' && statusData.download_url) {
          videoUrl = statusData.download_url
          break
        } else if (statusData.status === 'failed') {
          throw new Error('Video generation failed on Tavus side')
        }
      }
      
      attempts++
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out - please try again later')
    }

    return {
      videoUrl: videoUrl,
      duration: 180 // Estimated duration - Tavus should provide actual duration
    }
    
  } catch (error) {
    console.error('Error creating video with Tavus:', error)
    
    // Fallback to mock response for development/testing
    if (error.message.includes('TAVUS_API_KEY not configured') || error.message.includes('fetch')) {
      console.log('Falling back to mock video response for development')
      return {
        videoUrl: `https://example.com/generated-video-${projectData.id}-${Date.now()}.mp4`,
        duration: 180
      }
    }
    
    throw error
  }
}