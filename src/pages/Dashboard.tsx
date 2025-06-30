import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { 
  Plus, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { projects } = useProject();

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.length,
      icon: <Target className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      title: 'Completed Projects',
      value: completedProjects.length,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100'
    },
    {
      title: 'Total Team Members',
      value: projects.reduce((acc, p) => acc + p.members.length, 0),
      icon: <Users className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100'
    },
    {
      title: 'Hours Logged',
      value: projects.reduce((acc, p) => acc + p.tasks.reduce((taskAcc, t) => taskAcc + t.hoursLogged, 0), 0),
      icon: <Clock className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                CollabKill
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar} 
                  alt={user?.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            {user?.role === 'professor' 
              ? "Monitor your students' project progress and collaboration"
              : "Manage your group projects and track your contributions"
            }
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.bgColor} p-3 rounded-lg`}>
                  <div className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/project/new"
              className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create New Project
            </Link>
            <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              View Analytics
            </button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                Active
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                Completed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {project.title}
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {project.members.length} members
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Due {new Date(project.deadline).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {project.currentPhase} phase
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link 
                    to={`/project/${project.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    View Project
                  </Link>
                  <Link 
                    to={`/reports/${project.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Reports
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {activeProjects.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600 mx-auto mt-2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No active projects</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started with collaborative tracking</p>
              <Link 
                to="/project/new"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Project
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;