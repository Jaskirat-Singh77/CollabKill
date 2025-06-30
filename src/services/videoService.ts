import { supabase } from './supabase';

export interface VideoGenerationOptions {
  includeTimeline?: boolean;
  includeFeedback?: boolean;
  includeContributions?: boolean;
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  videoId?: string;
  script?: string;
  duration?: number;
  error?: string;
}

export class VideoService {
  private static readonly FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`;

  static async generateVideo(
    projectId: string, 
    options: VideoGenerationOptions = {}
  ): Promise<VideoGenerationResponse> {
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userId: session.user.id,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Video generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getGeneratedVideos(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, videos: data };
    } catch (error) {
      console.error('Error fetching generated videos:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch videos' 
      };
    }
  }

  static async deleteVideo(videoId: string) {
    try {
      const { error } = await supabase
        .from('generated_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete video' 
      };
    }
  }
}