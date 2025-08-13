const mongoose = require('mongoose');

// Day-wise Roadmap Schema
const DayRoadmapSchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isStudyDay: {
    type: Boolean,
    default: true
  },
  totalStudyHours: {
    type: Number,
    default: 0
  },
  sessions: [{
    sessionId: String,
    subject: String,
    unit: String,
    topics: [String],
    duration: Number, // in minutes
    startTime: String,
    endTime: String,
    type: {
      type: String,
      enum: ['learning', 'practice', 'assessment', 'revision', 'break', 'review']
    },
    learningObjectives: [String],
    resources: [{
      type: String,
      title: String,
      url: String,
      duration: Number
    }],
    exercises: [{
      title: String,
      type: String,
      estimatedTime: Number
    }],
    assessment: {
      type: String,
      questions: Number,
      timeLimit: Number
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completionTime: Date,
    score: Number,
    notes: String
  }],
  dailyGoals: [{
    goal: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  dailyReflection: {
    mood: {
      type: String,
      enum: ['excellent', 'good', 'okay', 'challenging', 'difficult']
    },
    energy: {
      type: Number,
      min: 1,
      max: 10
    },
    notes: String,
    challenges: [String],
    achievements: [String]
  },
  progress: {
    completedSessions: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    studyTime: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    }
  }
});

// Weekly Milestone Schema
const WeeklyMilestoneSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  title: String,
  description: String,
  goals: [String],
  targetProgress: Number,
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  achievements: [String]
});

const LearningPlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Plan Configuration
  planType: {
    type: String,
    enum: ['syllabus-based', 'technology-roadmap', 'exam-preparation', 'custom', 'daily-roadmap', 'roadmap-based'],
    required: true
  },
  
  // Plan Details
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Timeline
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Day-wise Roadmap
  dailyRoadmap: [DayRoadmapSchema],
  
  // Weekly Milestones
  weeklyMilestones: [WeeklyMilestoneSchema],
  
  // Curriculum Structure
  curriculum: {
    subjects: [{
      name: String,
      description: String,
      weightage: Number,
      units: [{
        title: String,
        description: String,
        topics: [{
          name: String,
          description: String,
          difficulty: Number,
          estimatedHours: Number,
          prerequisites: [String],
          learningObjectives: [String],
          resources: [{
            type: String, // 'video', 'article', 'practice', 'quiz'
            title: String,
            url: String,
            duration: Number
          }]
        }],
        estimatedDuration: Number,
        order: Number
      }],
      totalHours: Number
    }],
    totalDuration: Number
  },
  
  // Schedule Configuration
  schedule: {
    weeklyPlan: [{
      day: String,
      sessions: [{
        subject: String,
        unit: String,
        topics: [String],
        duration: Number, // in minutes
        startTime: String,
        endTime: String,
        type: String // 'learning', 'practice', 'assessment', 'revision'
      }]
    }],
    dailyStudyHours: Number,
    weeklyStudyDays: Number,
    breakDays: [String]
  },
  
  // Progress Tracking
  progress: {
    completedUnits: [{
      subject: String,
      unit: String,
      completedAt: Date,
      score: Number
    }],
    completedTopics: [{
      subject: String,
      unit: String,
      topic: String,
      completedAt: Date,
      score: Number,
      timeSpent: Number
    }],
    currentUnit: {
      subject: String,
      unit: String,
      progress: Number // 0-100
    },
    overallProgress: {
      type: Number,
      default: 0
    },
    // Daily progress tracking
    dailyProgress: [{
      date: Date,
      studyHours: Number,
      completedSessions: Number,
      totalSessions: Number,
      score: Number,
      mood: String,
      notes: String
    }],
    // Weekly progress tracking
    weeklyProgress: [{
      weekNumber: Number,
      startDate: Date,
      endDate: Date,
      totalStudyHours: Number,
      completedSessions: Number,
      averageScore: Number,
      goalsAchieved: Number,
      totalGoals: Number
    }]
  },
  
  // Adaptive Features
  adaptiveSettings: {
    autoAdjust: { type: Boolean, default: true },
    difficultyScaling: { type: Boolean, default: true },
    personalizedPacing: { type: Boolean, default: true },
    revisionCycles: { type: Number, default: 3 },
    // Daily adjustment settings
    dailyAdjustment: {
      enabled: { type: Boolean, default: true },
      basedOnMood: { type: Boolean, default: true },
      basedOnPerformance: { type: Boolean, default: true },
      basedOnEnergy: { type: Boolean, default: true }
    }
  },
  
  // Gamification
  gamification: {
    milestones: [{
      title: String,
      description: String,
      targetProgress: Number,
      reward: String,
      achieved: { type: Boolean, default: false },
      achievedAt: Date
    }],
    challenges: [{
      title: String,
      description: String,
      type: String, // 'streak', 'score', 'completion'
      target: Number,
      reward: String,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }],
    // Daily challenges
    dailyChallenges: [{
      title: String,
      description: String,
      type: String,
      target: Number,
      reward: String,
      isCompleted: { type: Boolean, default: false },
      completedAt: Date
    }]
  },
  
  // AI Enhancements
  aiEnhancements: {
    personalizedRecommendations: { type: Boolean, default: true },
    dynamicScheduling: { type: Boolean, default: true },
    performanceAnalysis: { type: Boolean, default: true },
    adaptiveContent: { type: Boolean, default: true },
    // Daily AI insights
    dailyInsights: {
      enabled: { type: Boolean, default: true },
      moodAnalysis: { type: Boolean, default: true },
      performancePrediction: { type: Boolean, default: true },
      adaptiveSuggestions: { type: Boolean, default: true }
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Version tracking for plan updates
  version: {
    type: Number,
    default: 1
  },
  
  // Plan modifications history
  modifications: [{
    type: String,
    description: String,
    timestamp: { type: Date, default: Date.now },
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes
LearningPlanSchema.index({ student: 1, status: 1 });
LearningPlanSchema.index({ 'progress.overallProgress': -1 });
LearningPlanSchema.index({ startDate: 1, endDate: 1 });
LearningPlanSchema.index({ 'dailyRoadmap.date': 1 });

// Virtual for completion percentage
LearningPlanSchema.virtual('completionPercentage').get(function() {
  if (!this.curriculum.subjects.length) return 0;
  
  const totalTopics = this.curriculum.subjects.reduce((sum, subject) => 
    sum + subject.units.reduce((s, unit) => s + unit.topics.length, 0), 0);
  
  const completedTopics = this.progress.completedTopics.length;
  
  return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
});

// Virtual for estimated completion date
LearningPlanSchema.virtual('estimatedCompletionDate').get(function() {
  if (this.progress.overallProgress === 0) return this.endDate;
  
  const progressRate = this.progress.overallProgress / 
    ((new Date() - this.startDate) / (1000 * 60 * 60 * 24)); // progress per day
  
  if (progressRate <= 0) return this.endDate;
  
  const remainingProgress = 100 - this.progress.overallProgress;
  const daysToComplete = remainingProgress / progressRate;
  
  return new Date(Date.now() + (daysToComplete * 24 * 60 * 60 * 1000));
});

// Virtual for current day
LearningPlanSchema.virtual('currentDay').get(function() {
  const today = new Date();
  const startDate = new Date(this.startDate);
  const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, dayDiff);
});

// Virtual for today's roadmap
LearningPlanSchema.virtual('todayRoadmap').get(function() {
  const today = new Date().toDateString();
  return this.dailyRoadmap.find(day => 
    new Date(day.date).toDateString() === today
  );
});

// Pre-save middleware to update timestamps
LearningPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate progress
LearningPlanSchema.methods.calculateProgress = function() {
  if (!this.curriculum.subjects.length) return 0;
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  this.curriculum.subjects.forEach(subject => {
    const subjectWeight = subject.weightage || 1;
    totalWeight += subjectWeight;
    
    const completedUnits = this.progress.completedUnits.filter(
      unit => unit.subject === subject.name
    ).length;
    
    const totalUnits = subject.units.length;
    if (totalUnits > 0) {
      completedWeight += (completedUnits / totalUnits) * subjectWeight;
    }
  });
  
  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

// Method to add milestone
LearningPlanSchema.methods.addMilestone = function(milestone) {
  this.gamification.milestones.push({
    ...milestone,
    achieved: false
  });
  return this.save();
};

// Method to check and award milestones
LearningPlanSchema.methods.checkMilestones = function() {
  const currentProgress = this.calculateProgress();
  const newlyAchieved = [];
  
  this.gamification.milestones.forEach(milestone => {
    if (!milestone.achieved && currentProgress >= milestone.targetProgress) {
      milestone.achieved = true;
      milestone.achievedAt = new Date();
      newlyAchieved.push(milestone);
    }
  });
  
  if (newlyAchieved.length > 0) {
    this.progress.overallProgress = currentProgress;
    return this.save().then(() => newlyAchieved);
  }
  
  return Promise.resolve([]);
};

// Method to update daily progress
LearningPlanSchema.methods.updateDailyProgress = function(date, studyHours, completedSessions, totalSessions, score, mood, notes) {
  const existingProgress = this.progress.dailyProgress.find(
    p => new Date(p.date).toDateString() === new Date(date).toDateString()
  );
  
  if (existingProgress) {
    existingProgress.studyHours = studyHours;
    existingProgress.completedSessions = completedSessions;
    existingProgress.totalSessions = totalSessions;
    existingProgress.score = score;
    existingProgress.mood = mood;
    existingProgress.notes = notes;
  } else {
    this.progress.dailyProgress.push({
      date,
      studyHours,
      completedSessions,
      totalSessions,
      score,
      mood,
      notes
    });
  }
  
  return this.save();
};

// Method to get today's roadmap
LearningPlanSchema.methods.getTodayRoadmap = function() {
  const today = new Date().toDateString();
  return this.dailyRoadmap.find(day => 
    new Date(day.date).toDateString() === today
  );
};

// Method to mark session as completed
LearningPlanSchema.methods.completeSession = function(dayNumber, sessionId, score, notes) {
  const day = this.dailyRoadmap.find(d => d.dayNumber === dayNumber);
  if (day) {
    const session = day.sessions.find(s => s.sessionId === sessionId);
    if (session) {
      session.isCompleted = true;
      session.completionTime = new Date();
      session.score = score;
      session.notes = notes;
      
      // Update day progress
      day.progress.completedSessions = day.sessions.filter(s => s.isCompleted).length;
      day.progress.totalSessions = day.sessions.length;
      
      return this.save();
    }
  }
  return Promise.reject(new Error('Session not found'));
};

module.exports = mongoose.model('LearningPlan', LearningPlanSchema);
