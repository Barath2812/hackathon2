const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-in-blank', 'true-false', 'coding', 'essay'],
    required: true
  },
  options: [String], // For multiple choice
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: String,
  hints: [String],
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  tags: [String], // For topic categorization
  timeEstimate: Number, // in seconds
  points: {
    type: Number,
    default: 10
  },
  // AI-generated content flags
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiContext: {
    originalMistake: String,
    generatedFor: String // student ID or pattern
  },
  // Trivia integration
  source: {
    type: String,
    enum: ['ai-generated', 'opentdb', 'fallback'],
    default: 'ai-generated'
  }
});

// Module Schema for structured lesson content
const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['content', 'exercise', 'assessment', 'video', 'interactive', 'practice'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 10
  },
  order: {
    type: Number,
    required: true
  },
  learningObjectives: [String],
  resources: [String],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionTime: Date,
  // Interactive elements
  interactiveElements: [String],
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['math', 'science', 'english', 'history', 'geography', 'computer-science', 'programming', 'art']
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Content
  content: {
    type: String,
    required: true
  },
  summary: String,
  exercises: [String],
  resources: [String],
  questions: [QuestionSchema],
  // Modules for structured learning
  modules: [ModuleSchema],
  // Learning Objectives
  objectives: [String],
  prerequisites: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    masteryLevel: {
      type: Number,
      default: 0.8
    }
  }],
  // Adaptive Features
  adaptiveRules: {
    timeBasedAdjustment: {
      type: Boolean,
      default: true
    },
    mistakeBasedAdjustment: {
      type: Boolean,
      default: true
    },
    performanceThreshold: {
      type: Number,
      default: 0.7
    }
  },
  // Media and Resources
  media: {
    images: [String],
    videos: [String],
    audio: [String],
    interactiveElements: [String]
  },
  // Metadata
  estimatedDuration: Number, // in minutes
  tags: [String],
  author: {
    type: String,
    default: 'AI Tutor System'
  },
  version: {
    type: Number,
    default: 1
  },
  // Usage Statistics
  usageStats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 5 }
  },
  // AI Enhancement
  aiEnhancements: {
    personalizedHints: { type: Boolean, default: true },
    dynamicDifficulty: { type: Boolean, default: true },
    contextualExplanations: { type: Boolean, default: true },
    triviaIntegration: { type: Boolean, default: false },
    moduleBasedLearning: { type: Boolean, default: false }
  },
  // AI Generation flags
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
LessonSchema.index({ subject: 1, difficulty: 1 });
LessonSchema.index({ tags: 1 });
LessonSchema.index({ 'usageStats.averageScore': -1 });
LessonSchema.index({ 'modules.order': 1 });

// Virtual for completion rate
LessonSchema.virtual('completionRate').get(function() {
  if (this.usageStats.totalAttempts === 0) return 0;
  return this.usageStats.averageScore;
});

// Virtual for module completion percentage
LessonSchema.virtual('moduleCompletionRate').get(function() {
  if (!this.modules || this.modules.length === 0) return 0;
  const completedModules = this.modules.filter(module => module.isCompleted).length;
  return Math.round((completedModules / this.modules.length) * 100);
});

// Method to update usage statistics
LessonSchema.methods.updateUsageStats = function(score, timeSpent) {
  this.usageStats.totalAttempts += 1;
  this.usageStats.averageScore = 
    (this.usageStats.averageScore * (this.usageStats.totalAttempts - 1) + score) / 
    this.usageStats.totalAttempts;
  this.usageStats.averageTimeSpent = 
    (this.usageStats.averageTimeSpent * (this.usageStats.totalAttempts - 1) + timeSpent) / 
    this.usageStats.totalAttempts;
  return this.save();
};

// Method to mark module as completed
LessonSchema.methods.completeModule = function(moduleIndex) {
  if (this.modules && this.modules[moduleIndex]) {
    this.modules[moduleIndex].isCompleted = true;
    this.modules[moduleIndex].completionTime = new Date();
    this.modules[moduleIndex].progress = 100;
    return this.save();
  }
  return Promise.reject(new Error('Module not found'));
};

// Method to update module progress
LessonSchema.methods.updateModuleProgress = function(moduleIndex, progress) {
  if (this.modules && this.modules[moduleIndex]) {
    this.modules[moduleIndex].progress = Math.min(100, Math.max(0, progress));
    if (progress >= 100) {
      this.modules[moduleIndex].isCompleted = true;
      this.modules[moduleIndex].completionTime = new Date();
    }
    return this.save();
  }
  return Promise.reject(new Error('Module not found'));
};

module.exports = mongoose.model('Lesson', LessonSchema);
