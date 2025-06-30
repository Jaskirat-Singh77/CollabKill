import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import { VideoService, VideoGenerationOptions } from '../services/videoService';
import html2pdf from 'html2pdf.js';
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  PieChart, 
  Clock, 
  Users,
  Calendar,
  TrendingUp,
  Star,
  MessageCircle,
  Video,
  FileText,
  Play,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const Reports = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const [activeReport, setActiveReport] = useState('team');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);
  
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

  // Utility function to check if a string is a valid UUID
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Check if this is a mock project (not saved in database)
  const isMockProject = !isValidUUID(project.id);

  // Prepare chart data
  const contributionData = project.members.map(member => ({
    name: member.name,
    contribution: member.contributionPercentage,
    tasks: member.tasksCompleted,
    hours: member.hoursLogged
  }));

  const RAMP_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Activity timeline data (mock)
  const timelineData = [
    { week: 'Week 1', Alice: 12, Bob: 8, Charlie: 10, Diana: 3 },
    { week: 'Week 2', Alice: 15, Bob: 12, Charlie: 8, Diana: 4 },
    { week: 'Week 3', Alice: 18, Bob: 15, Charlie: 12, Diana: 6 },
    { week: 'Week 4', Alice: 20, Bob: 18, Charlie: 15, Diana: 8 },
  ];

  const feedbackData = [
    {
      id: 1,
      member: 'Anonymous',
      rating: 5,
      comment: 'Alice has been exceptional in leading the UI development. Always available to help and very responsive.',
      category: 'Leadership'
    },
    {
      id: 2,
      member: 'Anonymous',
      rating: 4,
      comment: 'Bob\'s backend work is solid and well-documented. Could improve on communication during standups.',
      category: 'Technical Skills'
    },
    {
      id: 3,
      member: 'Anonymous',
      rating: 4,
      comment: 'Charlie\'s designs are creative and user-friendly. Great attention to detail in the mockups.',
      category: 'Creativity'
    },
    {
      id: 4,
      member: 'Anonymous',
      rating: 2,
      comment: 'Diana needs to be more proactive in taking on tasks. Often waits for assignments rather than volunteering.',
      category: 'Initiative'
    }
  ];

  const handleExportPdf = async () => {
    if (!reportContentRef.current) return;

    setIsExportingPdf(true);
    
    try {
      const element = reportContentRef.current;
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${project.title}-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleGenerateVideo = async () => {
    // Check if this is a mock project
    if (isMockProject) {
      setVideoGenerationError(
        'Video generation is only available for projects saved to the database. This appears to be a demo project.'
      );
      return;
    }

    setIsGeneratingVideo(true);
    setVideoGenerationError(null);
    setVideoGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setVideoGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const options: VideoGenerationOptions = {
        includeTimeline: true,
        includeFeedback: true,
        includeContributions: true
      };

      const result = await VideoService.generateVideo(project.id, options);

      clearInterval(progressInterval);
      setVideoGenerationProgress(100);

      if (result.success && result.videoUrl) {
        setGeneratedVideoUrl(result.videoUrl);
      } else {
        throw new Error(result.error || 'Failed to generate video');
      }

    } catch (error) {
      console.error('Video generation failed:', error);
      setVideoGenerationError(
        error instanceof Error ? error.message : 'Failed to generate video. Please try again.'
      );
    } finally {
      setIsGeneratingVideo(false);
      setTimeout(() => setVideoGenerationProgress(0), 2000);
    }
  };

  const handleDownloadVideo = () => {
    if (generatedVideoUrl) {
      // Create a temporary link to download the video
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `${project.title}-summary.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
                to={`/project/${project.id}`}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Project Reports</h1>
                <p className="text-gray-600">{project.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPdf ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export PDF
                  </>
                )}
              </button>
              <button 
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo || isMockProject}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isMockProject 
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={isMockProject ? 'Video generation is only available for saved projects' : ''}
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Generate Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Video Generation Status */}
      {(isGeneratingVideo || generatedVideoUrl || videoGenerationError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            {isGeneratingVideo && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Loader className="h-6 w-6 text-purple-600 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-800">Generating AI Video Summary</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Our AI is analyzing your project data and creating a comprehensive video summary...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${videoGenerationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{Math.round(videoGenerationProgress)}% complete</p>
              </div>
            )}

            {generatedVideoUrl && !isGeneratingVideo && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Video Generated Successfully!</h3>
                  </div>
                  <button
                    onClick={handleDownloadVideo}
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={generatedVideoUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="AI Generated Project Summary"
                  />
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Video Summary Includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Project timeline and milestone achievements</li>
                    <li>• Individual contribution breakdowns</li>
                    <li>• Team collaboration highlights</li>
                    <li>• Anonymous feedback insights</li>
                    <li>• AI-powered performance analysis</li>
                  </ul>
                </div>
              </div>
            )}

            {videoGenerationError && (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Video Generation Failed</h3>
                </div>
                <p className="text-red-600 mb-4">{videoGenerationError}</p>
                {!isMockProject && (
                  <button
                    onClick={handleGenerateVideo}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Navigation */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'team', label: 'Team Report', icon: <Users className="h-4 w-4" /> },
            { id: 'personal', label: 'Personal Report', icon: <FileText className="h-4 w-4" /> },
            { id: 'feedback', label: 'Anonymous Feedback', icon: <MessageCircle className="h-4 w-4" /> },
            { id: 'timeline', label: 'Project Timeline', icon: <Calendar className="h-4 w-4" /> },
            { id: 'video', label: 'Video Summary', icon: <Video className="h-4 w-4" /> }
          ].map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeReport === report.id
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {report.icon}
              {report.label}
            </button>
          ))}
        </div>

        {/* Report Content - This div will be captured for PDF */}
        <div ref={reportContentRef} className="pdf-content">
          {/* PDF Header - Only visible in PDF */}
          <div className="hidden print:block mb-8 text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h1>
            <h2 className="text-xl text-gray-600 mb-2">Project Report</h2>
            <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <motion.div
            key={activeReport}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeReport === 'team' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Total Hours',
                      value: project.members.reduce((acc, m) => acc + m.hoursLogged, 0),
                      icon: <Clock className="h-6 w-6" />,
                      color: 'from-blue-500 to-blue-600'
                    },
                    {
                      title: 'Tasks Completed',
                      value: project.tasks.filter(t => t.status === 'completed').length,
                      icon: <BarChart3 className="h-6 w-6" />,
                      color: 'from-green-500 to-green-600'
                    },
                    {
                      title: 'Team Members',
                      value: project.members.length,
                      icon: <Users className="h-6 w-6" />,
                      color: 'from-purple-500 to-purple-600'
                    },
                    {
                      title: 'Avg. Contribution',
                      value: `${Math.round(project.members.reduce((acc, m) => acc + m.contributionPercentage, 0) / project.members.length)}%`,
                      icon: <TrendingUp className="h-6 w-6" />,
                      color: 'from-orange-500 to-orange-600'
                    }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                          <div className="text-white">{stat.icon}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contribution Bar Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contribution Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={contributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="contribution" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hours Distribution Pie Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Hours Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          dataKey="hours"
                          data={contributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {contributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={RAMP_COLORS[index % RAMP_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Member Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Performance Analysis</h3>
                  <div className="space-y-4">
                    {project.members.map((member, index) => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4 mb-3">
                          <img 
                            src={member.avatar}
                            alt={member.name}
                            className="h-12 w-12 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{member.contributionPercentage}%</p>
                            <p className="text-sm text-gray-600">contribution</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-gray-800">{member.tasksCompleted}</p>
                            <p className="text-gray-600">Tasks</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-800">{member.hoursLogged}h</p>
                            <p className="text-gray-600">Hours</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-gray-800">
                              {member.hoursLogged > 0 ? (member.tasksCompleted / member.hoursLogged * 10).toFixed(1) : 0}
                            </p>
                            <p className="text-gray-600">Efficiency</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'personal' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Your Personal Report</h3>
                  <p className="text-blue-100">Detailed analysis of your contributions and performance</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Activity Timeline</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="Alice" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h4>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">35%</p>
                        <p className="text-sm text-gray-600">Total Contribution</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">8</p>
                        <p className="text-sm text-gray-600">Tasks Completed</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">42h</p>
                        <p className="text-sm text-gray-600">Hours Logged</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">AI-Generated Performance Summary</h4>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Excellent Performance:</strong> You've demonstrated exceptional leadership in frontend development, 
                      contributing 35% to the project's success. Your consistency in completing tasks and logging hours shows 
                      strong commitment. Areas of strength include UI/UX implementation and team collaboration. 
                      <br /><br />
                      <strong>Recommendations:</strong> Continue your excellent work in leading the frontend development. 
                      Consider mentoring team members who may need additional support, particularly in React best practices.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'feedback' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Anonymous Team Feedback</h3>
                  <p className="text-purple-100">Honest feedback from your team members about collaboration experience</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {feedbackData.map(feedback => (
                    <div key={feedback.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">{feedback.category}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Submitted by {feedback.member}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Feedback Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Strengths Identified</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Excellent technical leadership</li>
                        <li>• Strong communication skills</li>
                        <li>• Creative problem-solving</li>
                        <li>• Reliable and consistent</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Areas for Improvement</h5>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Better task distribution</li>
                        <li>• More proactive communication</li>
                        <li>• Initiative in taking on tasks</li>
                        <li>• Time management skills</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'timeline' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Project Timeline & Milestones</h3>
                  <p className="text-indigo-100">Visual representation of your project's development journey</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Activity Trends</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="Alice" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Bob" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Charlie" stroke="#F59E0B" strokeWidth={2} />
                      <Line type="monotone" dataKey="Diana" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Milestones</h4>
                  <div className="space-y-4">
                    {[
                      { phase: 'Planning', date: '2024-11-01', status: 'completed', description: 'Initial project setup and requirement gathering' },
                      { phase: 'Design', date: '2024-11-15', status: 'completed', description: 'UI/UX design and system architecture' },
                      { phase: 'Development', date: '2024-12-01', status: 'in-progress', description: 'Core functionality implementation' },
                      { phase: 'Testing', date: '2024-12-15', status: 'upcoming', description: 'Quality assurance and bug fixes' },
                      { phase: 'Deployment', date: '2025-01-01', status: 'upcoming', description: 'Production deployment and monitoring' }
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' : 
                          milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-800">{milestone.phase}</h5>
                            <span className="text-sm text-gray-600">{milestone.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'video' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">AI Video Summary</h3>
                  <p className="text-purple-100">Comprehensive video report of your project's journey and team performance</p>
                </div>
                
                {!generatedVideoUrl && !isGeneratingVideo && (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                      <Video className="h-8 w-8 text-purple-600 mx-auto mt-2" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Generate Your Video Summary</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                      Create an AI-powered video summary that includes project timeline, team contributions, 
                      feedback insights, and performance analysis. Perfect for presentations and submissions.
                    </p>
                    {isMockProject && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Video generation is only available for projects saved to the database. This appears to be a demo project.
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleGenerateVideo}
                      disabled={isMockProject}
                      className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2 ${
                        isMockProject 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      <Video className="h-5 w-5" />
                      Generate Video Summary
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Performance Analytics</h4>
                    <p className="text-sm text-gray-600">Visual charts and graphs showing individual and team performance metrics</p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Timeline Overview</h4>
                    <p className="text-sm text-gray-600">Chronological view of project milestones and key achievements</p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                      <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Feedback Highlights</h4>
                    <p className="text-sm text-gray-600">Key insights from anonymous team feedback and collaboration reviews</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* PDF-specific styles */}
      <style jsx>{`
        @media print {
          .pdf-content {
            background: white !important;
          }
          
          .bg-gradient-to-r,
          .bg-gradient-to-br {
            background: white !important;
            color: black !important;
          }
          
          .shadow-lg,
          .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          
          .text-white {
            color: black !important;
          }
          
          .rounded-xl {
            border-radius: 8px !important;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;