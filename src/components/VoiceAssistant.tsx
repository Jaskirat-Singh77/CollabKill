import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElevenLabsService } from '../services/elevenlabsService';
import { SpeechRecognitionService } from '../services/speechRecognitionService';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  X,
  Loader,
  Settings,
  Headphones
} from 'lucide-react';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  projectData?: any;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  isOpen, 
  onClose, 
  context = 'general',
  projectData 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date, audioUrl?: string}>>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(ElevenLabsService.VOICES.RACHEL);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.2,
    useSpeakerBoost: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  
  const speechRecognition = useRef(new SpeechRecognitionService());

  useEffect(() => {
    if (isOpen) {
      // Add welcome message
      setMessages([{
        id: Date.now().toString(),
        type: 'ai',
        content: 'Hello! I\'m your voice assistant for CollabKill. I can help you with project management, team coordination, and collaboration insights. Just speak to me and I\'ll respond with voice!',
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const startListening = () => {
    if (!speechRecognition.current.isSupported()) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    const success = speechRecognition.current.startListening({
      onResult: (result) => {
        setTranscript(result.transcript);
        if (result.isFinal && result.transcript.trim()) {
          handleUserMessage(result.transcript.trim());
          setTranscript('');
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setError(`Speech recognition error: ${error}`);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (success) {
      setIsListening(true);
      setError(null);
    }
  };

  const stopListening = () => {
    speechRecognition.current.stopListening();
    setIsListening(false);
  };

  const handleUserMessage = async (message: string) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    try {
      setIsSpeaking(true);
      
      const aiResponse = generateAIResponse(message);
      
      // Convert to speech
      const ttsResult = await ElevenLabsService.textToSpeech({
        text: aiResponse,
        voiceId: selectedVoice,
        voiceSettings
      });

      if (ttsResult.success && ttsResult.audioUrl) {
        // Add AI message to chat
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: aiResponse,
          timestamp: new Date(),
          audioUrl: ttsResult.audioUrl
        };
        setMessages(prev => [...prev, aiMessage]);

        // Play the audio
        setCurrentAudio(ttsResult.audioUrl);
        await ElevenLabsService.playAudio(ttsResult.audioUrl);
        setCurrentAudio(null);
      } else {
        throw new Error(ttsResult.error || 'Failed to generate speech');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setError('Failed to generate AI response');
    } finally {
      setIsSpeaking(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('progress') || message.includes('status')) {
      if (projectData) {
        const completedTasks = projectData.tasks?.filter((t: any) => t.status === 'completed').length || 0;
        const totalTasks = projectData.tasks?.length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        return `Your project "${projectData.title}" is currently ${progress}% complete. You've finished ${completedTasks} out of ${totalTasks} tasks. The team is in the ${projectData.currentPhase} phase. ${progress >= 70 ? 'Great progress! Keep up the excellent work.' : progress >= 40 ? 'You\'re making steady progress. Consider reviewing task assignments to accelerate completion.' : 'The project needs attention. I recommend reviewing team workload distribution and setting clearer milestones.'}`;
      }
      return 'I can help you track project progress. Please share your project details or navigate to a specific project for detailed insights.';
    }
    
    if (message.includes('team') || message.includes('member') || message.includes('collaboration')) {
      if (projectData && projectData.members) {
        const teamSize = projectData.members.length;
        const avgContribution = Math.round(projectData.members.reduce((acc: number, m: any) => acc + m.contributionPercentage, 0) / teamSize);
        
        return `Your team has ${teamSize} members with an average contribution of ${avgContribution}%. ${avgContribution >= 70 ? 'The team shows strong engagement across all members.' : avgContribution >= 50 ? 'Most team members are actively contributing. Consider reaching out to less active members.' : 'There are significant contribution imbalances. I recommend redistributing tasks and providing additional support to underperforming members.'}`;
      }
      return 'I can help analyze team dynamics and collaboration patterns. Share your project details for specific insights about team performance.';
    }
    
    if (message.includes('task') || message.includes('assignment')) {
      return 'I can help you manage tasks effectively. Consider breaking down large tasks into smaller, manageable pieces, setting clear deadlines, and ensuring balanced workload distribution among team members.';
    }
    
    if (message.includes('help') || message.includes('how')) {
      return 'I\'m here to help with project management, team coordination, and collaboration insights. You can ask me about project progress, team performance, task management, or any specific challenges you\'re facing with your group project.';
    }
    
    if (message.includes('voice') || message.includes('sound')) {
      return 'I can adjust my voice settings! You can change my voice type, speaking speed, and tone using the settings panel. I have several different voices available to choose from.';
    }
    
    return 'I understand you\'re asking about your project. I can help with project management, team coordination, progress tracking, and collaboration insights. Could you be more specific about what you\'d like to know?';
  };

  const playMessage = async (audioUrl: string) => {
    try {
      setCurrentAudio(audioUrl);
      await ElevenLabsService.playAudio(audioUrl);
      setCurrentAudio(null);
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentAudio(null);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      ElevenLabsService.stopAudio(currentAudio);
      setCurrentAudio(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Voice Assistant</h2>
                <p className="text-sm text-gray-600">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 p-4 bg-gray-50"
              >
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Voice Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value={ElevenLabsService.VOICES.RACHEL}>Rachel (Professional)</option>
                      <option value={ElevenLabsService.VOICES.BELLA}>Bella (Young)</option>
                      <option value={ElevenLabsService.VOICES.ELLI}>Elli (Energetic)</option>
                      <option value={ElevenLabsService.VOICES.DREW}>Drew (Male Professional)</option>
                      <option value={ElevenLabsService.VOICES.ANTONI}>Antoni (Warm Male)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stability</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={voiceSettings.stability}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.type === 'ai' && message.audioUrl && (
                        <button
                          onClick={() => playMessage(message.audioUrl!)}
                          disabled={currentAudio === message.audioUrl}
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
                        >
                          {currentAudio === message.audioUrl ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                          <span>Play</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-3 rounded-lg bg-blue-100 text-blue-800 border-2 border-blue-300">
                    <p className="text-sm">{transcript}</p>
                    <p className="text-xs opacity-70 mt-1">Speaking...</p>
                  </div>
                </div>
              )}
              
              {isSpeaking && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-green-100 text-green-800">
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <p className="text-sm">AI is speaking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="p-6 border-t border-gray-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              
              {currentAudio && (
                <button
                  onClick={stopAudio}
                  className="p-3 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-all duration-200"
                >
                  <VolumeX className="h-6 w-6" />
                </button>
              )}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {isListening ? 'Listening... Speak now!' : isSpeaking ? 'AI is responding...' : 'Click the microphone to start speaking'}
              </p>
              {!speechRecognition.current.isSupported() && (
                <p className="text-xs text-red-600 mt-2">
                  Speech recognition not supported in your browser
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceAssistant;