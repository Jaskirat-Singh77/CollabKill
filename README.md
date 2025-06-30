# CollabKill - AI-Powered Group Project Tracker

CollabKill is a comprehensive platform designed to ensure fair collaboration in university group projects. It uses AI-powered features to track real contributions, eliminate free-riders, and provide intelligent insights for better team coordination.

## 🚀 Features

### Core Features
- **Real-time Project Tracking**: Monitor project progress, tasks, and team contributions
- **AI-Powered Analytics**: Get insights into team performance and collaboration patterns
- **Fair Contribution Tracking**: Automatic integration with development tools to track real work
- **Anonymous Feedback System**: Collect honest feedback from team members
- **Comprehensive Reporting**: Generate detailed reports with AI-powered video summaries

### AI & Voice Features
- **Tavus AI Video Agents**: Real-time conversational AI video assistants for project guidance
- **ElevenLabs Voice AI**: Natural voice interactions and AI-generated audio responses
- **Smart Nudging System**: AI-powered reminders and motivation messages
- **Voice-Activated Commands**: Control the platform using voice commands

### Collaboration Tools
- **Live Whiteboard**: Collaborative drawing and brainstorming space
- **Real-time Chat**: Team communication with voice message support
- **Video Conferencing**: Integrated video calls for team meetings
- **Document Collaboration**: Real-time document editing and sharing

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation

### Backend & Database
- **Supabase** for backend services, authentication, and database
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### AI & Voice Services
- **Tavus API** for AI video generation and conversational agents
- **ElevenLabs API** for text-to-speech and voice synthesis
- **Web Speech API** for speech recognition

### Deployment
- **Netlify** for frontend deployment
- **Supabase Edge Functions** for serverless backend logic

## 🏗 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AIVideoAgent.tsx     # Tavus AI video assistant
│   ├── VoiceAssistant.tsx   # ElevenLabs voice assistant
│   ├── AIAssistantButton.tsx # AI assistant launcher
│   └── ProtectedRoute.tsx   # Route protection
├── contexts/            # React contexts for state management
│   ├── AuthContext.tsx      # Authentication state
│   └── ProjectContext.tsx   # Project data management
├── pages/               # Main application pages
│   ├── LandingPage.tsx      # Marketing landing page
│   ├── AuthPage.tsx         # Login/signup
│   ├── Dashboard.tsx        # Main dashboard
│   ├── ProjectDetails.tsx   # Project management
│   ├── Reports.tsx          # Analytics and reporting
│   └── Collaborate.tsx      # Collaboration tools
├── services/            # External service integrations
│   ├── supabase.ts          # Supabase client
│   ├── tavusService.ts      # Tavus AI integration
│   ├── elevenlabsService.ts # ElevenLabs voice AI
│   ├── speechRecognitionService.ts # Speech recognition
│   └── videoService.ts      # Video generation
└── supabase/
    ├── functions/           # Edge functions
    │   ├── generate-video/     # AI video generation
    │   └── ai-nudge/          # Smart nudging system
    └── migrations/          # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Tavus API account (for AI video features)
- ElevenLabs API account (for voice features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd collabkill-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TAVUS_API_KEY=your_tavus_api_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Configure authentication settings
   - Deploy the edge functions

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Deployment

#### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy using the `netlify.toml` configuration

3. **Configure Supabase Edge Functions**
   - Deploy functions to Supabase
   - Update function URLs in your environment variables

## 🔧 Configuration

### Supabase Setup

1. **Database Schema**: Run all migrations in order
2. **Authentication**: Enable email/password authentication
3. **Row Level Security**: Policies are automatically created via migrations
4. **Edge Functions**: Deploy functions for AI features

### API Keys Setup

1. **Tavus API**: 
   - Sign up at [Tavus](https://tavus.io)
   - Get your API key from the dashboard
   - Configure replica IDs for your AI avatars

2. **ElevenLabs API**:
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Get your API key
   - Choose voice IDs for your AI assistants

## 🎯 Key Features Explained

### AI Video Agents (Tavus Integration)
- Real-time conversational AI avatars
- Project-specific context and guidance
- Video generation for project summaries
- Interactive voice and video communication

### Voice AI (ElevenLabs Integration)
- Natural text-to-speech conversion
- Multiple voice options and settings
- Voice-activated commands
- AI-generated audio responses

### Smart Collaboration
- Real-time whiteboard with sticky notes
- Live chat with voice messages
- Document collaboration
- Video conferencing integration

### Analytics & Reporting
- Contribution tracking and visualization
- AI-powered insights and recommendations
- Anonymous feedback collection
- PDF and video report generation

## 🔒 Security & Privacy

- **Row Level Security**: Database-level access control
- **Authentication**: Secure user authentication via Supabase
- **Data Privacy**: Anonymous feedback system
- **CORS Protection**: Proper cross-origin resource sharing setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@collabkill.com or join our Discord community.

## 🙏 Acknowledgments

- **Tavus** for AI video technology
- **ElevenLabs** for voice AI capabilities
- **Supabase** for backend infrastructure
- **Netlify** for deployment platform

---

Built with ❤️ for fair collaboration in education.