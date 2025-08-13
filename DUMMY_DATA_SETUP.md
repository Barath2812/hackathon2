# Dummy Data Setup Guide

## Overview

This guide explains how to set up dummy data for the learning platform to test all routes and features for both college and school students.

## Prerequisites

### 1. MongoDB Setup

#### Option A: Local MongoDB Installation
```bash
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB service
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Set environment variable:
```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/learning-platform"
```

#### Option C: Docker
```bash
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/learning-platform
JWT_SECRET=your_jwt_secret_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
NODE_ENV=development
```

## Running the Seeding Scripts

### 1. Main Dummy Data Seeding
```bash
# Run the main seeding script
node scripts/seed-dummy-data.js
```

This will create:
- **6 Students** (3 school + 3 college)
- **12 Learning Plans** (2 per student)
- **125 Lessons** (25 per student type)
- **125 Progress Records** (1 per lesson per student)

### 2. Additional Test Scenarios
```bash
# Run additional test scenarios
node scripts/add-test-data.js
```

This will add:
- Student with no learning plans
- Student with completed learning plan
- Student with paused learning plan
- Test lessons for different scenarios

## Dummy Data Details

### 🎓 School Students

#### 1. Aarav Sharma (aarav.sharma@school.com)
- **School**: Delhi Public School
- **Board**: CBSE, Class 10
- **Subjects**: Mathematics, Science, Computer Science
- **Learning Style**: Visual (8), Reading (9)
- **Points**: 1,250, Level: 8
- **Badges**: Early Bird, Perfect Score, Study Streak

#### 2. Priya Patel (priya.patel@school.com)
- **School**: St. Mary's Convent
- **Board**: ICSE, Class 11
- **Exam Prep**: NEET Preparation
- **Subjects**: Biology, Chemistry, Physics
- **Learning Style**: Auditory (8), Reading (8)
- **Points**: 2,100, Level: 12
- **Badges**: Biology Master, Perfect Score, 7-Day Streak

#### 3. Rahul Kumar (rahul.kumar@school.com)
- **School**: Kendriya Vidyalaya
- **Board**: CBSE, Class 12
- **Exam Prep**: JEE Main & Advanced
- **Subjects**: Mathematics, Physics, Chemistry
- **Learning Style**: Kinesthetic (9), Reading (7)
- **Points**: 3,400, Level: 18
- **Badges**: Math Genius, Physics Pro, Perfect Score

### 🏫 College Students

#### 1. Ananya Singh (ananya.singh@college.com)
- **College**: Delhi Technological University
- **Course**: Computer Science Engineering, Year 3
- **Technologies**: MERN Stack, Python, Machine Learning
- **Projects**: E-commerce Platform, AI Chatbot
- **Subjects**: Web Development, Data Structures, Database Management
- **Points**: 2,800, Level: 15
- **Badges**: Full Stack Developer, Code Master, Project Champion

#### 2. Vikram Malhotra (vikram.malhotra@college.com)
- **College**: BITS Pilani
- **Course**: Information Technology, Year 4
- **Technologies**: Java, Spring Boot, AWS
- **Projects**: Microservices API, Cloud Deployment
- **Subjects**: Backend Development, System Design, Cloud Computing
- **Points**: 4,200, Level: 22
- **Badges**: Backend Expert, System Architect, Cloud Pioneer

#### 3. Zara Khan (zara.khan@college.com)
- **College**: Manipal Institute of Technology
- **Course**: Data Science, Year 2
- **Technologies**: Python, TensorFlow, SQL
- **Projects**: Sentiment Analysis, Recommendation System
- **Subjects**: Machine Learning, Statistics, Data Visualization
- **Points**: 1,900, Level: 10
- **Badges**: Data Scientist, ML Enthusiast, Visualization Pro

### 🧪 Test Scenarios

#### 1. No Plans Student (no-plans@test.com)
- **Purpose**: Test empty states and first-time user experience
- **Details**: College student with no learning plans
- **Points**: 0, Level: 1

#### 2. Completed Plan Student (completed-plan@test.com)
- **Purpose**: Test completed learning plan features
- **Details**: College student with 100% completed web development roadmap
- **Points**: 5,000, Level: 25
- **Badges**: Completed Plan, Perfect Score, 30-Day Streak

#### 3. Paused Plan Student (paused-plan@test.com)
- **Purpose**: Test paused learning plan functionality
- **Details**: School student with paused JEE preparation plan
- **Points**: 1,500, Level: 8
- **Progress**: 35% completed

## Learning Plans Created

### School Students
1. **Syllabus-based Plans**: CBSE/ICSE class-specific comprehensive study plans
2. **Exam Preparation Plans**: NEET/JEE preparation plans for eligible students

### College Students
1. **Technology Roadmap Plans**: Based on student's technology stack
2. **Roadmap-based Plans**: Full Stack Development roadmap

### Test Scenarios
1. **Completed Plan**: 100% completed web development roadmap
2. **Paused Plan**: 35% completed JEE preparation plan

## Lessons Created

### School Lessons (25 per student type)
- **Subjects**: Mathematics, Science, English, Social Studies, Computer Science
- **Format**: 5 lessons per subject
- **Difficulty**: 1-3 (Beginner to Intermediate)
- **Duration**: 20-50 minutes
- **Resources**: Videos, articles, practice questions

### College Lessons (20 per student type)
- **Subjects**: Web Development, Data Structures, Database Management, System Design, Machine Learning
- **Format**: 4 lessons per subject
- **Difficulty**: 3-5 (Intermediate to Advanced)
- **Duration**: 30-75 minutes
- **Resources**: Videos, articles, projects, coding challenges

### Test Lessons
- **Easy Lesson**: Beginner-friendly test lesson
- **Hard Lesson**: Advanced test lesson with complex concepts
- **Unpublished Lesson**: Draft lesson for testing unpublished content

## Progress Data

### Completed Lessons
- **70% of lessons** are marked as completed
- **Scores**: 70-100% (realistic performance range)
- **Time Spent**: Based on lesson duration with some variation

### In-Progress Lessons
- **30% of lessons** are marked as in-progress
- **Scores**: 30-70% (partial completion)
- **Time Spent**: Partial duration

## Authentication

### Login Credentials
All students use the same password: **`password123`**

### Example Login
```javascript
// School Student
{
  email: "aarav.sharma@school.com",
  password: "password123"
}

// College Student
{
  email: "ananya.singh@college.com", 
  password: "password123"
}

// Test Scenarios
{
  email: "no-plans@test.com",
  password: "password123"
}
```

## API Testing

### Available Routes with Dummy Data

#### Authentication
- `POST /api/auth/register` - Register new students
- `POST /api/auth/login` - Login with dummy credentials

#### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update profile
- `GET /api/students/progress` - Get progress summary

#### Learning Plans
- `GET /api/learning-plans` - Get all plans for student
- `GET /api/learning-plans/roadmaps` - Get available roadmaps
- `POST /api/learning-plans/generate-from-roadmap` - Create roadmap plan
- `POST /api/learning-plans/generate-daily-roadmap` - Create daily roadmap
- `GET /api/learning-plans/:id` - Get specific plan
- `GET /api/learning-plans/:id/today` - Get today's roadmap
- `PUT /api/learning-plans/:id/progress` - Update progress

#### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get specific lesson
- `POST /api/lessons` - Create new lesson
- `PUT /api/lessons/:id` - Update lesson

#### Progress
- `GET /api/progress` - Get student progress
- `POST /api/progress` - Create progress record
- `PUT /api/progress/:id` - Update progress

#### AI Features
- `POST /api/ai/generate-lesson` - Generate AI lesson
- `POST /api/ai/generate-subject` - Generate AI subject

## Testing Scenarios

### 1. Empty State Testing
- Login as `no-plans@test.com`
- Test learning plan creation flows
- Test empty dashboard states

### 2. Active Learning Testing
- Login as any regular student
- Test daily roadmap functionality
- Test progress tracking
- Test lesson completion

### 3. Completed Plan Testing
- Login as `completed-plan@test.com`
- Test completed plan features
- Test achievement displays
- Test certificate generation

### 4. Paused Plan Testing
- Login as `paused-plan@test.com`
- Test paused plan functionality
- Test plan resumption
- Test progress preservation

### 5. Roadmap Testing
- Test roadmap selection
- Test roadmap-based plan generation
- Test fallback mechanisms

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod

# Docker
docker ps | grep mongo
```

#### 2. Environment Variables
```bash
# Check if .env file exists
ls -la .env

# Verify MONGODB_URI
echo $MONGODB_URI
```

#### 3. Permission Issues
```bash
# Make scripts executable (Linux/macOS)
chmod +x scripts/seed-dummy-data.js
chmod +x scripts/add-test-data.js
```

#### 4. Port Conflicts
```bash
# Check if port 27017 is in use
netstat -an | grep 27017

# Kill process if needed
sudo kill -9 <PID>
```

## Data Reset

### Clear All Data
```bash
# Connect to MongoDB
mongo learning-platform

# Clear collections
db.students.deleteMany({})
db.learningplans.deleteMany({})
db.lessons.deleteMany({})
db.progress.deleteMany({})
```

### Re-seed Data
```bash
# Run seeding scripts again
node scripts/seed-dummy-data.js
node scripts/add-test-data.js
```

## Performance Notes

### Data Volume
- **Total Records**: ~300+ records
- **Database Size**: ~5-10 MB
- **Seeding Time**: 30-60 seconds

### Memory Usage
- **Peak Memory**: ~100-200 MB during seeding
- **Runtime Memory**: ~50-100 MB normal operation

## Security Notes

### Test Data Security
- All passwords are hashed using bcrypt
- JWT tokens are properly signed
- No sensitive real-world data included

### Production Considerations
- Change default passwords in production
- Use strong JWT secrets
- Implement proper rate limiting
- Add data validation

## Support

For issues with dummy data setup:
1. Check MongoDB connection
2. Verify environment variables
3. Review error logs
4. Test with minimal data first

## Next Steps

After setting up dummy data:
1. Test all API endpoints
2. Verify frontend functionality
3. Test roadmap integration
4. Validate progress tracking
5. Test AI features
6. Performance testing
