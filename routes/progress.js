const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');

// @route   GET api/progress/overview
// @desc    Get student progress overview
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Calculate recent performance trends
    const recentPerformance = student.performanceHistory.slice(-10);
    const weeklyProgress = student.performanceHistory
      .filter(p => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(p.timestamp) >= weekAgo;
      });

    // Calculate subject-wise performance
    const subjectPerformance = {};
    student.performanceHistory.forEach(p => {
      if (!subjectPerformance[p.subject]) {
        subjectPerformance[p.subject] = { scores: [], totalTime: 0, attempts: 0 };
      }
      subjectPerformance[p.subject].scores.push(p.score);
      subjectPerformance[p.subject].totalTime += p.timeSpent;
      subjectPerformance[p.subject].attempts++;
    });

    // Calculate averages
    Object.keys(subjectPerformance).forEach(subject => {
      const data = subjectPerformance[subject];
      data.averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      data.averageTime = data.totalTime / data.attempts;
    });

    // Get learning insights
    const insights = {
      bestSubject: Object.keys(subjectPerformance).reduce((a, b) => 
        subjectPerformance[a].averageScore > subjectPerformance[b].averageScore ? a : b
      ),
      needsImprovement: Object.keys(subjectPerformance).filter(subject => 
        subjectPerformance[subject].averageScore < 0.7
      ),
      studyTimePerDay: student.totalStudyTime / Math.max(1, student.streak),
      improvementRate: recentPerformance.length > 1 ? 
        (recentPerformance[recentPerformance.length - 1].score - recentPerformance[0].score) / recentPerformance.length : 0
    };

    // Format achievements for frontend
    const formattedAchievements = student.achievements.map(achievement => ({
      title: achievement,
      description: `Achievement: ${achievement}`,
      icon: '🏆',
      date: new Date().toLocaleDateString()
    }));

    res.json({
      totalLessons: student.performanceHistory.length,
      averageScore: recentPerformance.length > 0 ? 
        recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length : 0,
      totalStudyTime: student.totalStudyTime,
      achievements: formattedAchievements,
      subjectPerformance: Object.entries(subjectPerformance).map(([subject, data]) => ({
        subject,
        averageScore: data.averageScore,
        count: data.attempts
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/progress/subject/:subject
// @desc    Get detailed progress for a specific subject
// @access  Private
router.get('/subject/:subject', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { subject } = req.params;
    const subjectProgress = student.performanceHistory.filter(p => p.subject === subject);

    if (subjectProgress.length === 0) {
      return res.json({
        subject,
        progress: [],
        stats: {
          totalAttempts: 0,
          averageScore: 0,
          totalTime: 0,
          bestScore: 0,
          improvementRate: 0
        },
        recommendations: []
      });
    }

    // Calculate detailed statistics
    const totalAttempts = subjectProgress.length;
    const averageScore = subjectProgress.reduce((sum, p) => sum + p.score, 0) / totalAttempts;
    const totalTime = subjectProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const bestScore = Math.max(...subjectProgress.map(p => p.score));
    
    // Calculate improvement rate
    const recentScores = subjectProgress.slice(-5).map(p => p.score);
    const improvementRate = recentScores.length > 1 ? 
      (recentScores[recentScores.length - 1] - recentScores[0]) / recentScores.length : 0;

    // Analyze difficulty progression
    const difficultyProgress = subjectProgress.map(p => ({
      difficulty: p.difficulty,
      score: p.score,
      timestamp: p.timestamp
    }));

    // Identify knowledge gaps
    const mistakes = subjectProgress.flatMap(p => p.mistakes);
    const mistakeFrequency = {};
    mistakes.forEach(mistake => {
      mistakeFrequency[mistake] = (mistakeFrequency[mistake] || 0) + 1;
    });

    const knowledgeGaps = Object.entries(mistakeFrequency)
      .map(([topic, count]) => ({ topic, frequency: count, priority: count > 2 ? 'high' : 'medium' }))
      .sort((a, b) => b.frequency - a.frequency);

    // Generate recommendations
    const recommendations = [];
    if (averageScore < 0.7) {
      recommendations.push('Consider reviewing fundamental concepts in this subject');
    }
    if (improvementRate < 0.05) {
      recommendations.push('Try increasing study time or seeking additional help');
    }
    if (knowledgeGaps.length > 0) {
      recommendations.push(`Focus on: ${knowledgeGaps.slice(0, 3).map(g => g.topic).join(', ')}`);
    }

    res.json({
      subject,
      progress: subjectProgress,
      stats: {
        totalAttempts,
        averageScore,
        totalTime,
        bestScore,
        improvementRate,
        averageTimePerAttempt: totalTime / totalAttempts
      },
      difficultyProgress,
      knowledgeGaps,
      recommendations
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/progress/analytics
// @desc    Get advanced learning analytics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { timeframe = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Filter recent progress
    const recentProgress = student.performanceHistory.filter(p => 
      new Date(p.timestamp) >= daysAgo
    );

    // Daily progress tracking
    const dailyProgress = {};
    recentProgress.forEach(p => {
      const date = new Date(p.timestamp).toDateString();
      if (!dailyProgress[date]) {
        dailyProgress[date] = { scores: [], timeSpent: 0, attempts: 0 };
      }
      dailyProgress[date].scores.push(p.score);
      dailyProgress[date].timeSpent += p.timeSpent;
      dailyProgress[date].attempts++;
    });

    // Convert to array format for charts
    const dailyData = Object.entries(dailyProgress).map(([date, data]) => ({
      date,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      totalTime: data.timeSpent,
      attempts: data.attempts
    }));

    // Learning pattern analysis
    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      sessionLength: []
    };

    recentProgress.forEach(p => {
      const date = new Date(p.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      
      patterns.timeOfDay[hour] = (patterns.timeOfDay[hour] || 0) + 1;
      patterns.dayOfWeek[day] = (patterns.dayOfWeek[day] || 0) + 1;
      patterns.sessionLength.push(p.timeSpent);
    });

    // Calculate optimal study times
    const optimalHours = Object.entries(patterns.timeOfDay)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Performance trends
    const trendData = recentProgress.map((p, index) => ({
      attempt: index + 1,
      score: p.score,
      difficulty: p.difficulty,
      timeSpent: p.timeSpent
    }));

    // Calculate learning efficiency
    const efficiencyScores = recentProgress.map(p => ({
      score: p.score,
      efficiency: p.score / (p.timeSpent / 60), // score per minute
      timestamp: p.timestamp
    }));

    const averageEfficiency = efficiencyScores.reduce((sum, e) => sum + e.efficiency, 0) / efficiencyScores.length;

    // Calculate subject performance for frontend
    const subjectPerformance = {};
    recentProgress.forEach(p => {
      if (!subjectPerformance[p.subject]) {
        subjectPerformance[p.subject] = { scores: [], count: 0 };
      }
      subjectPerformance[p.subject].scores.push(p.score);
      subjectPerformance[p.subject].count++;
    });

    Object.keys(subjectPerformance).forEach(subject => {
      const data = subjectPerformance[subject];
      data.averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    });

    // Calculate learning patterns
    const learningPatterns = {
      bestTime: optimalHours.length > 0 ? `${optimalHours[0].hour}:00` : 'Not enough data',
      preferredSubject: Object.keys(subjectPerformance).reduce((a, b) => 
        subjectPerformance[a].averageScore > subjectPerformance[b].averageScore ? a : b
      ) || 'Not enough data',
      streak: student.streak || 0,
      improvementRate: trendData.length > 1 ? 
        `${Math.round(((trendData[trendData.length - 1].score - trendData[0].score) / trendData.length) * 100)}%` : 'Calculating...'
    };

    res.json({
      subjectPerformance,
      learningPatterns
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/progress/update-learning-style
// @desc    Update student's learning style based on interaction patterns
// @access  Private
router.post('/update-learning-style', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { interactionType, timeSpent, successRate } = req.body;

    // Analyze interaction patterns to update learning style
    let { visual, auditory, kinesthetic } = student.learningStyle;

    switch (interactionType) {
      case 'visual':
        visual = Math.min(1, visual + 0.1);
        break;
      case 'auditory':
        auditory = Math.min(1, auditory + 0.1);
        break;
      case 'kinesthetic':
        kinesthetic = Math.min(1, kinesthetic + 0.1);
        break;
    }

    // Normalize to ensure sum equals 1
    const total = visual + auditory + kinesthetic;
    student.learningStyle = {
      visual: visual / total,
      auditory: auditory / total,
      kinesthetic: kinesthetic / total
    };

    await student.save();

    res.json({
      learningStyle: student.learningStyle,
      message: 'Learning style updated based on your interaction patterns'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/progress/achievements
// @desc    Get student achievements and progress towards next ones
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const allAchievements = [
      { id: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', requirement: 1, type: 'lessons' },
      { id: 'high_scorer', name: 'High Scorer', description: 'Score 90% or higher on a lesson', requirement: 90, type: 'score' },
      { id: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', requirement: 7, type: 'streak' },
      { id: 'point_master', name: 'Point Master', description: 'Earn 1000 total points', requirement: 1000, type: 'points' },
      { id: 'subject_expert', name: 'Subject Expert', description: 'Complete 10 lessons in one subject', requirement: 10, type: 'subject_lessons' },
      { id: 'speed_learner', name: 'Speed Learner', description: 'Complete a lesson in under 5 minutes with 80%+ score', requirement: 5, type: 'speed' },
      { id: 'persistent', name: 'Persistent Learner', description: 'Study for 30 days in a row', requirement: 30, type: 'streak' },
      { id: 'all_rounder', name: 'All-Rounder', description: 'Study 5 different subjects', requirement: 5, type: 'subjects' }
    ];

    // Calculate progress towards each achievement
    const achievementProgress = allAchievements.map(achievement => {
      const earned = student.achievements.includes(achievement.name);
      let progress = 0;
      let current = 0;

      switch (achievement.type) {
        case 'lessons':
          current = student.performanceHistory.length;
          break;
        case 'score':
          const bestScore = Math.max(...student.performanceHistory.map(p => p.score * 100));
          current = bestScore;
          break;
        case 'streak':
          current = student.streak;
          break;
        case 'points':
          current = student.totalPoints;
          break;
        case 'subject_lessons':
          const subjectCounts = {};
          student.performanceHistory.forEach(p => {
            subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + 1;
          });
          current = Math.max(...Object.values(subjectCounts));
          break;
        case 'speed':
          const fastLessons = student.performanceHistory.filter(p => 
            p.timeSpent < 300 && p.score >= 0.8
          );
          current = fastLessons.length;
          break;
        case 'subjects':
          const uniqueSubjects = new Set(student.performanceHistory.map(p => p.subject));
          current = uniqueSubjects.size;
          break;
      }

      progress = Math.min(100, (current / achievement.requirement) * 100);

      return {
        ...achievement,
        earned,
        progress,
        current,
        requirement: achievement.requirement
      };
    });

    res.json({
      earned: student.achievements,
      progress: achievementProgress,
      totalEarned: student.achievements.length,
      totalAvailable: allAchievements.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
