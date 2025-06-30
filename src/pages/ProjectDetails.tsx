import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Target, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { projects, updateTask } = useProject();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
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

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleTaskStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    updateTask(project.id, taskId, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-600">{project.currentPhase} Phase</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                to={`/collaborate/${project.id}`}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Collaborate
              </Link>
              <Link 
                to={`/reports/${project.id}`}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-3 rounded-lg w-fit mx-auto mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{progressPercentage}%</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg w-fit mx-auto mb-2">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Team Size</h3>
              <p className="text-2xl font-bold text-purple-600">{project.members.length}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg w-fit mx-auto mb-2">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Days Left</h3>
              <p className="text-2xl font-bold text-orange-600">
                {Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg w-fit mx-auto mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Tasks Done</h3>
              <p className="text-2xl font-bold text-green-600">{completedTasks}/{totalTasks}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <Target className="h-4 w-4" /> },
            { id: 'tasks', label: 'Tasks', icon: <CheckCircle className="h-4 w-4" /> },
            { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
            { id: 'ai-insights', label: 'AI Insights', icon: <Zap className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg'
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Description */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Description</h3>
                <p className="text-gray-600 mb-6">{project.description}</p>
                
                {/* Phases */}
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Project Phases</h4>
                <div className="space-y-2">
                  {project.phases.map((phase, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        phase === project.currentPhase
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{phase}</span>
                        {phase === project.currentPhase && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {project.tasks.slice(-5).map(task => (
                    <div key={task.id} className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {project.members.find(m => m.id === task.assignedTo)?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Task Management</h3>
                <button className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* To Do */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    To Do ({project.tasks.filter(t => t.status === 'todo').length})
                  </h4>
                  <div className="space-y-3">
                    {project.tasks.filter(t => t.status === 'todo').map(task => (
                      <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{task.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img 
                              src={project.members.find(m => m.id === task.assignedTo)?.avatar}
                              alt=""
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">
                              {project.members.find(m => m.id === task.assignedTo)?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    In Progress ({project.tasks.filter(t => t.status === 'in-progress').length})
                  </h4>
                  <div className="space-y-3">
                    {project.tasks.filter(t => t.status === 'in-progress').map(task => (
                      <div key={task.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{task.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img 
                              src={project.members.find(m => m.id === task.assignedTo)?.avatar}
                              alt=""
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">
                              {project.members.find(m => m.id === task.assignedTo)?.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleTaskStatusChange(task.id, 'completed')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    Completed ({project.tasks.filter(t => t.status === 'completed').length})
                  </h4>
                  <div className="space-y-3">
                    {project.tasks.filter(t => t.status === 'completed').map(task => (
                      <div key={task.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{task.title}</h5>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img 
                              src={project.members.find(m => m.id === task.assignedTo)?.avatar}
                              alt=""
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">
                              {project.members.find(m => m.id === task.assignedTo)?.name}
                            </span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            {task.hoursLogged}h logged
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.members.map(member => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={member.avatar}
                        alt={member.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-800">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Contribution</span>
                        <span className="font-medium text-gray-800">{member.contributionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${member.contributionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasks Completed</span>
                        <span className="font-medium text-gray-800">{member.tasksCompleted}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hours Logged</span>
                        <span className="font-medium text-gray-800">{member.hoursLogged}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai-insights' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="h-8 w-8" />
                  <h3 className="text-xl font-semibold">AI Insights & Recommendations</h3>
                </div>
                <p className="text-purple-100">
                  Our AI analyzes your team's collaboration patterns and provides actionable insights.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Workload Balance Alert
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>Diana Prince</strong> has significantly lower contribution (12%) compared to other team members. 
                        Consider reassigning some tasks or providing additional support.
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Send AI Nudge →
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Team Strengths
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Alice Johnson</strong> shows excellent consistency in frontend development. 
                        Consider assigning more UI-related tasks to maximize efficiency.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Bob Smith</strong> has strong backend expertise. 
                        Team is well-balanced for full-stack development.
                      </p>
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

export default ProjectDetails;