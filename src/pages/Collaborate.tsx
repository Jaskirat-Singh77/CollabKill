import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Palette, 
  Send,
  Mic,
  Video,
  Share2,
  Save,
  Trash2,
  Plus,
  Move,
  Edit3
} from 'lucide-react';

const Collaborate = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('whiteboard');
  const [chatMessage, setChatMessage] = useState('');
  const [stickyNotes, setStickyNotes] = useState([
    { id: 1, x: 100, y: 100, content: 'API Design Discussion', color: 'yellow', author: 'Alice' },
    { id: 2, x: 300, y: 150, content: 'Database Schema Review', color: 'blue', author: 'Bob' },
    { id: 3, x: 500, y: 200, content: 'UI Wireframe Feedback', color: 'green', author: 'Charlie' },
  ]);
  
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Project not found</h2>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const chatMessages = [
    { id: 1, user: 'Alice Johnson', message: 'Hey team! I\'ve updated the authentication flow. Please review when you get a chance.', time: '10:30 AM', avatar: project.members[0].avatar },
    { id: 2, user: 'Bob Smith', message: 'Great work! The API endpoints are looking good. I\'ll start on the database integration today.', time: '10:45 AM', avatar: project.members[1].avatar },
    { id: 3, user: 'Charlie Brown', message: 'I\'ve uploaded the new design mockups to the whiteboard. Let me know what you think!', time: '11:15 AM', avatar: project.members[2].avatar },
    { id: 4, user: 'Diana Prince', message: 'I\'ll start working on the test cases for the user authentication features.', time: '11:30 AM', avatar: project.members[3].avatar },
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // Add message logic here
      setChatMessage('');
    }
  };

  const addStickyNote = () => {
    const newNote = {
      id: Date.now(),
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      content: 'New Note',
      color: 'yellow',
      author: user?.name || 'Anonymous'
    };
    setStickyNotes([...stickyNotes, newNote]);
  };

  const deleteStickyNote = (id: number) => {
    setStickyNotes(stickyNotes.filter(note => note.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/project/${project.id}`}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Collaboration Space</h1>
                <p className="text-gray-600">{project.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {project.members.slice(0, 4).map((member, index) => (
                  <img 
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                  />
                ))}
                <div className="bg-green-500 w-3 h-3 rounded-full ml-2" title="4 members online" />
              </div>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video Call
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collaboration Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'whiteboard', label: 'Whiteboard', icon: <Palette className="h-4 w-4" /> },
            { id: 'chat', label: 'Team Chat', icon: <MessageSquare className="h-4 w-4" /> },
            { id: 'realtime', label: 'Real-time Editing', icon: <Edit3 className="h-4 w-4" /> },
            { id: 'voice', label: 'Voice Notes', icon: <Mic className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'whiteboard' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Whiteboard Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Collaborative Whiteboard</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={addStickyNote}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Note
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Whiteboard Canvas */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg" style={{ height: '600px' }}>
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Sticky Notes */}
                {stickyNotes.map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-48 h-32 p-3 rounded-lg shadow-lg cursor-move ${
                      note.color === 'yellow' ? 'bg-yellow-200' :
                      note.color === 'blue' ? 'bg-blue-200' :
                      note.color === 'green' ? 'bg-green-200' : 'bg-pink-200'
                    }`}
                    style={{ left: note.x, top: note.y }}
                    drag
                    dragMomentum={false}
                    whileDrag={{ scale: 1.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">{note.author}</span>
                      <button
                        onClick={() => deleteStickyNote(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-800">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Move className="h-3 w-3 text-gray-400" />
                      <div className="flex space-x-1">
                        {['yellow', 'blue', 'green', 'pink'].map(color => (
                          <button
                            key={color}
                            className={`w-3 h-3 rounded-full ${
                              color === 'yellow' ? 'bg-yellow-400' :
                              color === 'blue' ? 'bg-blue-400' :
                              color === 'green' ? 'bg-green-400' : 'bg-pink-400'
                            }`}
                            onClick={() => {
                              setStickyNotes(stickyNotes.map(n => 
                                n.id === note.id ? { ...n, color } : n
                              ));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Drawing Tools Hint */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <p className="text-sm text-gray-600">
                    🎨 <strong>Pro tip:</strong> Drag sticky notes around to organize ideas. 
                    Click the color dots to change note colors!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Team Members */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </h3>
                <div className="space-y-3">
                  {project.members.map(member => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <img 
                          src={member.avatar}
                          alt={member.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Chat</h3>
                
                {/* Messages */}
                <div className="space-y-4 mb-6" style={{ height: '400px', overflowY: 'auto' }}>
                  {chatMessages.map(message => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <img 
                        src={message.avatar}
                        alt={message.user}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{message.user}</span>
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Real-time Collaborative Editor</h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Edit3 className="h-6 w-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-800">Project Requirements Document</h4>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {project.members.slice(0, 3).map((member, index) => (
                        <div key={member.id} className="flex items-center space-x-1">
                          <img 
                            src={member.avatar}
                            alt={member.name}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{member.name}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-green-600 font-medium">● Live</span>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h5 className="text-lg font-semibold mb-3">Project Overview</h5>
                    <p className="text-gray-700 mb-4">
                      We are developing a comprehensive e-commerce mobile application that will serve as a platform 
                      for online shopping. The application will be built using React Native for cross-platform 
                      compatibility and Node.js for the backend services.
                    </p>
                    
                    <h5 className="text-lg font-semibold mb-3">Key Features</h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>User authentication and authorization system</li>
                      <li>Product catalog with search and filtering capabilities</li>
                      <li>Shopping cart and checkout process</li>
                      <li>Payment integration with multiple providers</li>
                      <li>Order management and tracking</li>
                      <li>Admin dashboard for product and order management</li>
                    </ul>
                    
                    <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Alice Johnson</strong> is currently editing this section...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200">
                    Save Changes
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200">
                    View History
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Last saved: 2 minutes ago
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Voice Notes & AI Nudges</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Voice Notes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Team Voice Notes</h4>
                  <div className="space-y-4">
                    {[
                      { id: 1, user: 'Alice Johnson', duration: '2:30', timestamp: '1 hour ago', content: 'Quick update on the authentication flow progress...' },
                      { id: 2, user: 'Bob Smith', duration: '1:45', timestamp: '3 hours ago', content: 'Database schema discussion and next steps...' },
                      { id: 3, user: 'Charlie Brown', duration: '3:15', timestamp: '5 hours ago', content: 'Design feedback and UI improvements...' }
                    ].map(note => (
                      <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">{note.user}</span>
                          <span className="text-sm text-gray-500">{note.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{note.content}</p>
                        <div className="flex items-center space-x-3">
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200">
                            ▶ Play ({note.duration})
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2">
                    <Mic className="h-5 w-5" />
                    Record Voice Note
                  </button>
                </div>

                {/* AI Nudges */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">AI Nudges & Reminders</h4>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-purple-800">Gentle Reminder</span>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        Hi Diana! You haven't logged any activity in the past 2 days. 
                        Would you like to update your progress on the testing tasks?
                      </p>
                      <button className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700 transition-colors duration-200">
                        🎵 Play Voice Nudge
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-800">Workload Suggestion</span>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Based on current progress, consider redistributing some tasks from Alice 
                        to other team members to balance the workload.
                      </p>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors duration-200">
                        View Suggestions
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-800">Motivation Boost</span>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Great work team! You're 65% complete with 3 weeks remaining. 
                        Keep up the excellent collaboration!
                      </p>
                      <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors duration-200">
                        🎵 Play Motivation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Collaborate;