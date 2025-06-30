export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onResult?: (result: SpeechRecognitionResult) => void;
  private onError?: (error: string) => void;
  private onEnd?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      if (this.onResult) {
        this.onResult({
          transcript: transcript.trim(),
          confidence: confidence || 0,
          isFinal
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) {
        this.onEnd();
      }
    };
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startListening(options: {
    onResult: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    recognitionOptions?: SpeechRecognitionOptions;
  }): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    this.onResult = options.onResult;
    this.onError = options.onError;
    this.onEnd = options.onEnd;

    // Apply options
    if (options.recognitionOptions) {
      const opts = options.recognitionOptions;
      if (opts.continuous !== undefined) this.recognition.continuous = opts.continuous;
      if (opts.interimResults !== undefined) this.recognition.interimResults = opts.interimResults;
      if (opts.language) this.recognition.lang = opts.language;
      if (opts.maxAlternatives) this.recognition.maxAlternatives = opts.maxAlternatives;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}