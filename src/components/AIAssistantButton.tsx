import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AIVideoAgent from './AIVideoAgent';
import VoiceAssistant from './VoiceAssistant';
import { Video, Headphones, MessageSquare, ChevronUp } from 'lucide-react';

interface AIAssistantButtonProps {
  projectData?: any;
  context?: string;
}

const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({ 
  projectData, 
  context = 'general' 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showVideoAgent, setShowVideoAgent] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const assistantOptions = [
    {
      id: 'video',
      label: 'Video Assistant',
      description: 'AI video agent with real-time conversation',
      icon: <Video className="h-5 w-5" />,
      color: 'from-purple-600 to-pink-600',
      onClick: () => {
        setShowVideoAgent(true);
        setShowMenu(false);
      }
    },
    {
      id: 'voice',
      label: 'Voice Assistant',
      description: 'Voice-only AI assistant with natural speech',
      icon: <Headphones className="h-5 w-5" />,
      color: 'from-green-600 to-blue-600',
      onClick: () => {
        setShowVoiceAssistant(true);
        setShowMenu(false);
      }
    }
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {/* Menu Options */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 space-y-3"
          >
            {assistantOptions.map((option) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={option.onClick}
                className={`flex items-center space-x-3 bg-gradient-to-r ${option.color} text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group`}
              >
                <div className="bg-white/20 p-2 rounded-lg">
                  {option.icon}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs opacity-90">{option.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Main Button */}
        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            showMenu ? 'rotate-180' : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showMenu ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </motion.button>

        {/* Pulse Animation */}
        {!showMenu && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-ping opacity-20" />
        )}
      </div>

      {/* AI Assistants */}
      <AIVideoAgent
        isOpen={showVideoAgent}
        onClose={() => setShowVideoAgent(false)}
        context={context}
        projectData={projectData}
      />

      <VoiceAssistant
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        context={context}
        projectData={projectData}
      />
    </>
  );
};

export default AIAssistantButton;