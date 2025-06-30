import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TavusService } from '../services/tavusService';
import { ElevenLabsService } from '../services/elevenlabsService';
import { SpeechRecognitionService } from '../services/speechRecognitionService';
import { 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  X,
  Loader,
  Play,
  Pause,
  Settings
} from 'lucide-react';

interface AIVideoAgentProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  projectData?: any;
}

const AIVideoAgent: React.FC<AIVideoAgentProps> = ({ 
  isOpen, 
  onClose, 
  context = 'general',
  projectData 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [error, setError] = useState<string | null>(null);
  
  const speechRecognition = useRef(new SpeechRecognitionService());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (conversationId) {
        TavusService.endConversation(conversationId);
      }
    };
  }, [conversationId]);

  const initializeConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const contextPrompt = getContextPrompt();
      const result = await TavusService.createConversation({
        properties: {
          context: contextPrompt,
          projectData: projectData ? JSON.stringify(projectData) : undefined
        }
      });

      if (result.success && result.conversationId && result.conversationUrl) {
        setConversationId(result.conversationId);
        setConversationUrl(result.conversationUrl);
        
        // Add welcome message
        setMessages([{
          id: Date.now().toString(),
          type: 'ai',
          content: 'Hello! I\'m your AI assistant for CollabKill. I can help you with project management, team coordination, and collaboration insights. How can I assist you today?',
          timestamp: new Date()
        }]);
      } else {
        throw new Error(result.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize AI agent');
    } finally {
      setIsLoading(false);
    }
  };

  const getContextPrompt = () => {
    const baseContext = `You are an AI assistant for CollabKill, a platform that helps university students collaborate fairly on group projects. You can help with:
    - Project management and task organization
    - Team coordination and communication
    - Analyzing contribution patterns and workload distribution
    - Providing collaboration insights and recommendations
    - Answering questions about project progress and team performance`;

    if (context === 'project' && projectData) {
      return `${baseContext}

Current project context:
- Project: ${projectData.title}
- Description: ${projectData.description}
- Current Phase: ${projectData.currentPhase}
- Team Size: ${projectData.members?.length || 0} members
- Progress: ${projectData.tasks ? Math.round((projectData.tasks.filter((t: any) => t.status === 'completed').length / projectData.tasks.length) * 100) : 0}% complete

Please provide specific, actionable advice based on this project data.`;
    }

    return baseContext;
  };

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

    // Generate AI response using ElevenLabs
    try {
      setIsSpeaking(true);
      
      // Generate a contextual response (in a real app, this would be more sophisticated)
      const aiResponse = generateAIResponse(message);
      
      // Convert to speech
      const ttsResult = await ElevenLabsService.textToSpeech({
        text: aiResponse,
        voiceId: ElevenLabsService.VOICES.RACHEL,
        voiceSettings: {
          stability: 0.7,
          similarityBoost: 0.8,
          style: 0.2,
          useSpeakerBoost: true
        }
      });

      if (ttsResult.success && ttsResult.audioUrl) {
        // Add AI message to chat
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai' as const,
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);

        // Play the audio
        await ElevenLabsService.playAudio(ttsResult.audioUrl);
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
    
    // Simple response generation (in production, use a proper AI service)
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
    
    // Default response
    return 'I understand you\'re asking about your project. I can help with project management, team coordination, progress tracking, and collaboration insights. Could you be more specific about what you\'d like to know?';
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">AI Video Assistant</h2>
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Initializing...' : 'Ready to help with your project'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video Area */}
            <div className="flex-1 p-6">
              {isLoading ? (
                <div className="h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Initializing AI Video Agent...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full bg-red-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                      <X className="h-10 w-10 text-red-600 mx-auto mt-1" />
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={initializeConversation}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : conversationUrl ? (
                <iframe
                  ref={iframeRef}
                  src={conversationUrl}
                  className="w-full h-full rounded-xl border-0"
                  allow="camera; microphone; autoplay"
                  title="AI Video Conversation"
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-purple-200 p-4 rounded-full w-20 h-20 mx-auto mb-4">
                      <Video className="h-12 w-12 text-purple-600 mx-auto mt-2" />
                    </div>
                    <p className="text-gray-600">AI Video Agent Ready</p>
                    <p className="text-sm text-gray-500 mt-2">Start speaking to begin the conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Sidebar */}
            <div className="w-80 border-l border-gray-200 flex flex-col">
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
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
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
                      <div className="max-w-[80%] p-3 rounded-lg bg-purple-100 text-purple-800">
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
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading || isSpeaking}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isListening
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Click to speak'}
                    </p>
                  </div>
                </div>
                
                {!speechRecognition.current.isSupported() && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Speech recognition not supported in your browser
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIVideoAgent;