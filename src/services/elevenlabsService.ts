export interface ElevenLabsVoiceOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

export interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  error?: string;
}

export class ElevenLabsService {
  private static readonly API_BASE = 'https://api.elevenlabs.io/v1';
  private static readonly API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

  // Default voice IDs (you can customize these)
  static readonly VOICES = {
    RACHEL: '21m00Tcm4TlvDq8ikWAM', // Professional female voice
    DREW: '29vD33N1CtxCmqQRPOHJ',   // Professional male voice
    BELLA: 'EXAVITQu4vr4xnSDxMaL',  // Young female voice
    ANTONI: 'ErXwobaYiN019PkySvjV', // Warm male voice
    ELLI: 'MF3mGyEYCl7XYWbV9V6O',   // Energetic female voice
    JOSH: 'TxGEqnHWrfWFTfGW9XjX',   // Deep male voice
    ARNOLD: 'VR6AewLTigWG4xSOukaG', // Strong male voice
    ADAM: 'pNInz6obpgDQGcFmaJgB',   // Middle-aged male voice
    SAM: 'yoZ06aMxZJJ28mfd3POQ'     // Narrator voice
  };

  static async textToSpeech(options: ElevenLabsVoiceOptions): Promise<ElevenLabsResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }

      const voiceId = options.voiceId || this.VOICES.RACHEL;
      const response = await fetch(`${this.API_BASE}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.API_KEY
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
            ...options.voiceSettings
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        success: true,
        audioUrl,
        audioBlob
      };

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getVoices(): Promise<{ success: boolean; voices?: any[]; error?: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(`${this.API_BASE}/voices`, {
        headers: {
          'xi-api-key': this.API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get voices: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        voices: result.voices
      };

    } catch (error) {
      console.error('ElevenLabs get voices error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Failed to play audio'));
      audio.play().catch(reject);
    });
  }

  static stopAudio(audioUrl: string): void {
    // Find and stop any playing audio with this URL
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.src === audioUrl) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }
}