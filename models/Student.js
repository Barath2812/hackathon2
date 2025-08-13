const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  
  // Enhanced Student Classification
  studentType: {
    type: String,
    enum: ['school', 'college'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 5,
    max: 100
  },
  
  // School Student Details
  schoolDetails: {
    class: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    board: {
      type: String,
      enum: ['CBSE', 'ICSE', 'IB', 'State', 'Other']
    },
    medium: {
      type: String,
      enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Other']
    },
    subjects: [{
      name: String,
      syllabus: [{
        unit: String,
        topics: [String],
        weightage: Number,
        estimatedHours: Number
      }]
    }],
    examPreparation: {
      neet: { type: Boolean, default: false },
      jee: { type: Boolean, default: false },
      other: [String]
    }
  },
  
  // College Student Details
  collegeDetails: {
    degree: String,
    branch: String,
    year: {
      type: Number,
      min: 1,
      max: 4
    },
    technologies: [{
      name: String,
      proficiency: {
        type: Number,
        min: 1,
        max: 10,
        default: 1
      },
      roadmap: [{
        topic: String,
        description: String,
        difficulty: Number,
        estimatedHours: Number,
        prerequisites: [String]
      }]
    }],
    careerGoals: [String],
    learningObjectives: [String]
  },
  
  // Learning Profile
  learningStyle: {
    visual: { type: Number, default: 0.33 },
    auditory: { type: Number, default: 0.33 },
    kinesthetic: { type: Number, default: 0.34 }
  },
  preferredSubjects: [{
    type: String,
    enum: ['math', 'science', 'english', 'history', 'programming', 'art', 'computer-science', 'geography']
  }],
  difficultyPreference: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  
  // Enhanced Progress Tracking
  currentLevel: {
    type: Number,
    default: 1
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  
  // Performance Analytics
  performanceHistory: [{
    subject: String,
    difficulty: Number,
    score: Number,
    timeSpent: Number,
    mistakes: [String],
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Adaptive Learning Data
  knowledgeGaps: [{
    topic: String,
    strength: { type: Number, default: 0.5 },
    lastPracticed: Date
  }],
  learningPace: {
    type: Number,
    default: 1.0 // 1.0 = normal pace
  },
  
  // Session Data
  lastActive: {
    type: Date,
    default: Date.now
  },
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  
  // AI Interaction Data
  aiInteractions: [{
    type: String, // 'hint', 'explanation', 'encouragement'
    context: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Enhanced Learning Schedule
  learningSchedule: {
    preferredStudyTimes: [{
      day: String,
      startTime: String,
      endTime: String,
      subjects: [String]
    }],
    weeklyGoals: {
      hoursPerWeek: { type: Number, default: 10 },
      subjectsPerWeek: { type: Number, default: 3 }
    },
    missedSessions: [{
      date: Date,
      reason: String,
      rescheduled: { type: Boolean, default: false }
    }]
  },
  
  // Gamification Data
  gamification: {
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    badges: [{
      name: String,
      description: String,
      earnedAt: { type: Date, default: Date.now },
      icon: String
    }],
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastStudyDate: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
StudentSchema.index({ email: 1 });
StudentSchema.index({ 'performanceHistory.timestamp': -1 });
StudentSchema.index({ studentType: 1, 'schoolDetails.class': 1 });
StudentSchema.index({ studentType: 1, 'collegeDetails.branch': 1 });

// Virtual for overall performance score
StudentSchema.virtual('overallPerformance').get(function() {
  if (this.performanceHistory.length === 0) return 0;
  const recentScores = this.performanceHistory
    .slice(-10)
    .map(p => p.score);
  return recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
});

// Virtual for learning progress percentage
StudentSchema.virtual('learningProgress').get(function() {
  if (this.studentType === 'school') {
    const totalTopics = this.schoolDetails.subjects.reduce((sum, subject) => 
      sum + subject.syllabus.reduce((s, unit) => s + unit.topics.length, 0), 0);
    const completedTopics = this.knowledgeGaps.filter(gap => gap.strength >= 0.8).length;
    return totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  } else {
    const totalTopics = this.collegeDetails.technologies.reduce((sum, tech) => 
      sum + tech.roadmap.length, 0);
    const completedTopics = this.knowledgeGaps.filter(gap => gap.strength >= 0.8).length;
    return totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  }
});

module.exports = mongoose.model('Student', StudentSchema);
