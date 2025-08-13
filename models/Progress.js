const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  // Session Data
  sessionId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  totalTimeSpent: Number, // in seconds
  // Performance Data
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  // Detailed Question Tracking
  questionResponses: [{
    questionId: String,
    studentAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    timeSpent: Number,
    hintsUsed: Number,
    attempts: Number,
    difficulty: Number
  }],
  // Learning Analytics
  learningPatterns: {
    averageTimePerQuestion: Number,
    hintUsageRate: Number,
    mistakePatterns: [String],
    difficultyProgression: [Number],
    confidenceLevel: Number // 0-1 scale
  },
  // Adaptive Learning Data
  adaptiveAdjustments: [{
    type: String, // 'difficulty_change', 'hint_provided', 'explanation_generated'
    reason: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  // AI Interaction Data
  aiInteractions: [{
    type: String, // 'hint', 'explanation', 'encouragement', 'micro_quiz'
    content: String,
    context: String,
    effectiveness: Number, // 0-1 scale
    timestamp: { type: Date, default: Date.now }
  }],
  // Emotional State Tracking (if available)
  emotionalData: {
    frustrationLevel: Number, // 0-1 scale
    engagementLevel: Number, // 0-1 scale
    confidenceLevel: Number, // 0-1 scale
    recordedAt: [Date]
  },
  // Knowledge Gap Analysis
  identifiedGaps: [{
    topic: String,
    strength: Number, // 0-1 scale
    recommendedAction: String
  }],
  // Next Steps
  recommendedNextLesson: {
    lessonId: mongoose.Schema.Types.ObjectId,
    reason: String,
    priority: Number
  },
  // Completion Status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  // Feedback
  studentFeedback: {
    difficulty: Number, // 1-5 scale
    enjoyment: Number, // 1-5 scale
    helpfulness: Number, // 1-5 scale
    comments: String
  }
}, {
  timestamps: true
});

// Indexes for performance
ProgressSchema.index({ studentId: 1, lessonId: 1 });
ProgressSchema.index({ sessionId: 1 });
ProgressSchema.index({ 'learningPatterns.confidenceLevel': -1 });

// Virtual for accuracy rate
ProgressSchema.virtual('accuracyRate').get(function() {
  if (this.questionsAttempted === 0) return 0;
  return (this.questionsCorrect / this.questionsAttempted) * 100;
});

// Virtual for efficiency score
ProgressSchema.virtual('efficiencyScore').get(function() {
  if (!this.totalTimeSpent || this.questionsAttempted === 0) return 0;
  const timePerQuestion = this.totalTimeSpent / this.questionsAttempted;
  const accuracy = this.accuracyRate / 100;
  return (accuracy / timePerQuestion) * 1000; // Normalized score
});

// Method to calculate learning patterns
ProgressSchema.methods.calculateLearningPatterns = function() {
  if (this.questionResponses.length === 0) return;

  const totalTime = this.questionResponses.reduce((sum, q) => sum + q.timeSpent, 0);
  const totalHints = this.questionResponses.reduce((sum, q) => sum + q.hintsUsed, 0);
  const difficulties = this.questionResponses.map(q => q.difficulty);

  this.learningPatterns = {
    averageTimePerQuestion: totalTime / this.questionResponses.length,
    hintUsageRate: totalHints / this.questionResponses.length,
    difficultyProgression: difficulties,
    confidenceLevel: this.questionsCorrect / this.questionsAttempted
  };
};

// Method to identify knowledge gaps
ProgressSchema.methods.identifyKnowledgeGaps = function() {
  const incorrectQuestions = this.questionResponses.filter(q => !q.isCorrect);
  const gapMap = new Map();

  incorrectQuestions.forEach(q => {
    // Extract topics from question tags (simplified)
    const topics = q.tags || ['general'];
    topics.forEach(topic => {
      if (!gapMap.has(topic)) {
        gapMap.set(topic, { count: 0, totalStrength: 0 });
      }
      const gap = gapMap.get(topic);
      gap.count++;
      gap.totalStrength += q.difficulty / 10; // Normalize difficulty
    });
  });

  this.identifiedGaps = Array.from(gapMap.entries()).map(([topic, data]) => ({
    topic,
    strength: 1 - (data.totalStrength / data.count), // Lower strength = bigger gap
    recommendedAction: data.count > 2 ? 'review' : 'practice'
  }));
};

module.exports = mongoose.model('Progress', ProgressSchema);
