import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  Brain, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Shield,
  Clock,
  Target,
  MessageSquare,
  FileText
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                CollabKill
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            End Unfair Group Projects
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            AI-powered platform that ensures fair collaboration, tracks real contributions, 
            and eliminates free-riders in university group projects.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to="/auth" 
              className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Start Your Project <ArrowRight className="h-5 w-5" />
            </Link>
            <a 
              href="#features" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to ensure fair collaboration and track real contributions
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Smart Team Management",
                description: "AI-powered role assignment and workload distribution based on skills and availability."
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Real-time Analytics",
                description: "Visual dashboards showing contribution percentages, activity heatmaps, and progress tracking."
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "AI Nudges System",
                description: "Intelligent notifications and reminders to keep inactive members engaged and motivated."
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Activity Tracking",
                description: "Automatic integration with GitHub, Google Docs, and Figma to track real contributions."
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "Live Collaboration",
                description: "Built-in whiteboard, chat, and real-time editing for seamless team communication."
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Comprehensive Reports",
                description: "Detailed reports with anonymous feedback and AI-generated video summaries."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-3 rounded-lg w-fit mb-4">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Why Choose CollabKill?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Fair Grading",
                    description: "Professors get detailed insights into each student's actual contribution"
                  },
                  {
                    icon: <Zap className="h-6 w-6" />,
                    title: "Boost Productivity",
                    description: "AI-powered suggestions and nudges keep everyone on track"
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Save Time",
                    description: "Automated tracking and reporting reduces administrative overhead"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-100 to-emerald-100 p-2 rounded-lg">
                      <div className="text-blue-600">{benefit.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-blue-600 to-emerald-600 p-8 rounded-2xl text-white"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Ready to Transform Your Projects?</h3>
              <p className="text-lg mb-6 text-blue-100">
                Join thousands of students and professors who've already improved their collaboration experience.
              </p>
              <Link 
                to="/auth" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold">CollabKill</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering fair collaboration in academic projects
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 CollabKill. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;