import { supabase } from './supabase';

export interface TavusVideoOptions {
  script: string;
  replicaId?: string;
  videoName?: string;
  background?: string;
  properties?: Record<string, string>;
}

export interface TavusVideoResponse {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  status?: string;
  error?: string;
}

export interface TavusConversationOptions {
  conversationId?: string;
  replicaId?: string;
  properties?: Record<string, string>;
}

export interface TavusConversationResponse {
  success: boolean;
  conversationId?: string;
  conversationUrl?: string;
  error?: string;
}

export class TavusService {
  private static readonly API_BASE = 'https://tavusapi.com/v2';
  private static readonly API_KEY = import.meta.env.VITE_TAVUS_API_KEY;

  static async createVideo(options: TavusVideoOptions): Promise<TavusVideoResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('Tavus API key not configured');
      }

      const response = await fetch(`${this.API_BASE}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: options.script,
          replica_id: options.replicaId || 'r783537ef5',
          video_name: options.videoName || 'CollabKill AI Video',
          background: options.background || 'office',
          properties: options.properties || {}
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      return {
        success: true,
        videoId: result.video_id,
        status: result.status
      };

    } catch (error) {
      console.error('Tavus video creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getVideoStatus(videoId: string): Promise<TavusVideoResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('Tavus API key not configured');
      }

      const response = await fetch(`${this.API_BASE}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get video status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        videoId: result.video_id,
        videoUrl: result.download_url,
        status: result.status
      };

    } catch (error) {
      console.error('Tavus video status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createConversation(options: TavusConversationOptions = {}): Promise<TavusConversationResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('Tavus API key not configured');
      }

      const response = await fetch(`${this.API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replica_id: options.replicaId || 'r783537ef5',
          conversation_name: 'CollabKill AI Assistant',
          callback_url: null,
          properties: {
            context: 'You are an AI assistant for CollabKill, a platform that helps university students collaborate fairly on group projects. You can help with project management, team coordination, and provide insights about collaboration.',
            ...options.properties
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      return {
        success: true,
        conversationId: result.conversation_id,
        conversationUrl: result.conversation_url
      };

    } catch (error) {
      console.error('Tavus conversation creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async endConversation(conversationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Tavus API key not configured');
      }

      const response = await fetch(`${this.API_BASE}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to end conversation: ${response.status}`);
      }

      return { success: true };

    } catch (error) {
      console.error('Tavus end conversation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}