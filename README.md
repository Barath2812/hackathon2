# 🎓 Personalized AI Learning Planner and Progress Tracker

A comprehensive MERN stack application that provides personalized learning plans, adaptive progress tracking, and AI-powered recommendations for both school and college students.

## 🚀 Features

### Core Features
- **Student Type Classification**: Distinguishes between school and college students
- **Comprehensive Profile Collection**: 
  - Age, learning style, preferred subjects
  - School: Class, board (CBSE/ICSE/IB), medium, exam preparation (NEET/JEE)
  - College: Degree, branch, year, technology interests
- **AI-Powered Learning Plans**: Personalized curriculum generation based on syllabus and interests
- **Adaptive Progress Tracking**: Real-time progress monitoring with performance analytics
- **Smart Scheduling**: Intelligent study schedule generation with auto-adjustment
- **Gamification**: Points, streaks, badges, and milestones for motivation

### Advanced Features
- **Syllabus-Based Learning**: Complete CBSE, ICSE, IB curriculum support
- **Technology Roadmaps**: MERN Stack, AI/ML, Data Science learning paths
- **Exam Preparation**: NEET, JEE, and other competitive exam support
- **AI Micro-Quizzes**: Personalized practice questions based on mistakes
- **Learning Insights**: AI-generated performance analysis and recommendations
- **Adaptive Difficulty**: Dynamic difficulty adjustment based on performance

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Google Gemini AI** for intelligent content generation
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Vite** for build tooling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini AI API key

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hackathon2
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-tutor
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-tutor

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Google Gemini AI
QWEN_API_KEY=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

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

### 5. Run the Application
```bash
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only (in client directory)
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Syllabus Datasets

The application includes comprehensive syllabus datasets:

### School Education
- **CBSE**: Complete curriculum for classes 9-12
- **ICSE/IB**: International curriculum support
- **State Boards**: Regional board variations
- **NEET/JEE**: Medical and engineering entrance preparation

### Technology Learning
- **MERN Stack**: Full-stack web development roadmap
- **AI/ML**: Machine learning and artificial intelligence
- **Data Science**: Analytics and visualization
- **Programming Languages**: Python, Java, and more

## 🎯 Usage Guide

### 1. Registration & Onboarding
1. Visit the registration page
2. Complete the 3-step onboarding process:
   - Basic information (name, email, age, student type)
   - Educational details (class/degree, board/branch, subjects/technologies)
   - Learning preferences (style, difficulty, interests)

### 2. Creating Learning Plans
1. Navigate to "Learning Plans" from the dashboard
2. Click "Create New Plan"
3. Select plan type:
   - **Syllabus-Based**: For school students following curriculum
   - **Technology Roadmap**: For college students learning technologies
   - **Exam Preparation**: For competitive exam preparation
4. Set duration and study preferences
5. AI generates personalized curriculum and schedule

### 3. Progress Tracking
- Complete lessons and topics to update progress
- View real-time progress analytics
- Earn points and badges for achievements
- Maintain study streaks for motivation

### 4. AI Features
- **Personalized Explanations**: Get custom explanations for questions
- **Micro-Quizzes**: Practice with AI-generated questions
- **Learning Insights**: Receive performance analysis and recommendations
- **Adaptive Difficulty**: Automatic difficulty adjustment

## 🏆 Hackathon Demo Script

### Demo Flow (5-7 minutes)

#### 1. Introduction (30 seconds)
"Welcome to our Personalized AI Learning Planner! This application revolutionizes education by providing AI-powered personalized learning experiences for both school and college students."

#### 2. Registration Demo (1 minute)
- Show the 3-step registration process
- Highlight student type classification
- Demonstrate syllabus/technology selection
- Emphasize learning style assessment

#### 3. Learning Plan Creation (2 minutes)
- Create a new learning plan
- Show AI-generated curriculum
- Display personalized schedule
- Highlight gamification features

#### 4. Progress Tracking (1 minute)
- Complete a lesson/topic
- Show real-time progress updates
- Demonstrate milestone achievements
- Display performance analytics

#### 5. AI Features (1 minute)
- Generate AI micro-quiz
- Show personalized explanations
- Display learning insights
- Demonstrate adaptive difficulty

#### 6. Innovation Highlights (30 seconds)
- Auto-adjusting schedules
- Gamified learning experience
- Comprehensive syllabus datasets
- Technology roadmap integration

### Key Talking Points
- **Personalization**: Every student gets a unique learning experience
- **AI Integration**: Google Gemini powers intelligent content generation
- **Comprehensive Coverage**: From CBSE to MERN Stack
- **Gamification**: Points, streaks, and badges for motivation
- **Adaptive Learning**: Dynamic difficulty and content adjustment

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `GET /api/auth/me` - Get current user

### Learning Plans
- `POST /api/learning-plans/generate` - Create new learning plan
- `GET /api/learning-plans` - Get all plans for student
- `GET /api/learning-plans/:id` - Get specific plan
- `PUT /api/learning-plans/:id/progress` - Update progress
- `PUT /api/learning-plans/:id/schedule` - Update schedule

### AI Features
- `POST /api/ai/generate-micro-quiz` - Generate practice questions
- `POST /api/ai/get-personalized-explanation` - Get custom explanations
- `POST /api/ai/adjust-difficulty` - Adjust difficulty level
- `GET /api/ai/learning-insights` - Get performance insights

### Lessons & Progress
- `GET /api/lessons` - Get available lessons
- `GET /api/lessons/:id` - Get specific lesson
- `GET /api/progress/overview` - Get progress overview

## 🗄️ Database Schema

### Student Model
- Basic info (name, email, age, student type)
- School details (class, board, medium, subjects, exam prep)
- College details (degree, branch, year, technologies)
- Learning preferences (style, subjects, difficulty)
- Progress tracking (points, streaks, performance history)
- Gamification data (level, experience, badges)

### Learning Plan Model
- Plan configuration (type, title, description)
- Curriculum structure (subjects, units, topics)
- Schedule configuration (weekly plan, study times)
- Progress tracking (completed topics, units, overall progress)
- Gamification (milestones, challenges)
- AI enhancements (personalization settings)

## 🚀 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set QWEN_API_KEY=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

# Deploy
git push heroku main
```

### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent content generation
- MongoDB for robust data storage
- React and Node.js communities for excellent documentation
- Educational institutions for syllabus data

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@ai-tutor.com
- Documentation: [Wiki](link-to-wiki)

---

**Built with ❤️ for the hackathon community**
