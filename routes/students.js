const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// @route   GET api/students/profile
// @desc    Get student profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select('-password');
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/students/profile
// @desc    Update student profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, preferredSubjects, learningStyle, avatar } = req.body;
    
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (name) student.name = name;
    if (preferredSubjects) student.preferredSubjects = preferredSubjects;
    if (learningStyle) student.learningStyle = learningStyle;
    if (avatar) student.avatar = avatar;

    await student.save();
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/students/dashboard
// @desc    Get student dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Calculate quick stats
    const recentPerformance = student.performanceHistory.slice(-5);
    const weeklyProgress = student.performanceHistory.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.timestamp) >= weekAgo;
    });

    // Generate recent activity
    const recentActivity = [];
    
    // Add recent achievements
    student.achievements.slice(-3).forEach(achievement => {
      recentActivity.push({
        icon: '🏆',
        title: 'Achievement Unlocked!',
        description: achievement,
        time: 'Recently'
      });
    });

    // Add recent performance
    recentPerformance.slice(-3).forEach(perf => {
      recentActivity.push({
        icon: '📊',
        title: `${perf.subject} Lesson`,
        description: `Scored ${Math.round(perf.score * 100)}%`,
        time: new Date(perf.timestamp).toLocaleDateString()
      });
    });

    // Add recommended lessons (placeholder)
    const recommendedLessons = [
      {
        _id: '1',
        title: 'Introduction to Mathematics',
        description: 'Learn the basics of mathematics',
        subject: 'math',
        difficulty: 1
      },
      {
        _id: '2',
        title: 'Science Fundamentals',
        description: 'Explore the world of science',
        subject: 'science',
        difficulty: 2
      }
    ];

    const dashboardData = {
      recentActivity: recentActivity.slice(0, 5),
      recommendedLessons,
      student: {
        name: student.name,
        currentLevel: student.currentLevel,
        totalPoints: student.totalPoints,
        streak: student.streak,
        achievements: student.achievements.slice(-3),
        totalStudyTime: student.totalStudyTime
      },
      performance: {
        recentAverage: recentPerformance.length > 0 ? 
          recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length : 0,
        weeklySessions: weeklyProgress.length,
        overallPerformance: student.overallPerformance
      },
      learningStyle: student.learningStyle,
      preferredSubjects: student.preferredSubjects,
      lastActive: student.lastActive
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/students/learning-patterns
// @desc    Get student learning patterns and preferences
// @access  Private
router.get('/learning-patterns', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Analyze learning patterns
    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      sessionLength: [],
      subjectPreferences: {},
      difficultyProgression: []
    };

    student.performanceHistory.forEach(p => {
      const date = new Date(p.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      
      // Time of day patterns
      patterns.timeOfDay[hour] = (patterns.timeOfDay[hour] || 0) + 1;
      
      // Day of week patterns
      patterns.dayOfWeek[day] = (patterns.dayOfWeek[day] || 0) + 1;
      
      // Session length patterns
      patterns.sessionLength.push(p.timeSpent);
      
      // Subject preferences
      if (!patterns.subjectPreferences[p.subject]) {
        patterns.subjectPreferences[p.subject] = { attempts: 0, totalScore: 0 };
      }
      patterns.subjectPreferences[p.subject].attempts++;
      patterns.subjectPreferences[p.subject].totalScore += p.score;
      
      // Difficulty progression
      patterns.difficultyProgression.push({
        difficulty: p.difficulty,
        score: p.score,
        timestamp: p.timestamp
      });
    });

    // Calculate averages and preferences
    const subjectPreferences = Object.entries(patterns.subjectPreferences).map(([subject, data]) => ({
      subject,
      attempts: data.attempts,
      averageScore: data.totalScore / data.attempts,
      preference: data.attempts / student.performanceHistory.length
    })).sort((a, b) => b.preference - a.preference);

    const optimalStudyTimes = Object.entries(patterns.timeOfDay)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), frequency: count }));

    const averageSessionLength = patterns.sessionLength.length > 0 ? 
      patterns.sessionLength.reduce((a, b) => a + b, 0) / patterns.sessionLength.length : 0;

    res.json({
      patterns: {
        timeOfDay: patterns.timeOfDay,
        dayOfWeek: patterns.dayOfWeek,
        sessionLength: averageSessionLength
      },
      preferences: {
        subjects: subjectPreferences,
        optimalStudyTimes,
        learningStyle: student.learningStyle
      },
      progression: {
        difficultyTrend: patterns.difficultyProgression.slice(-10),
        improvementRate: patterns.difficultyProgression.length > 1 ? 
          (patterns.difficultyProgression[patterns.difficultyProgression.length - 1].score - 
           patterns.difficultyProgression[0].score) / patterns.difficultyProgression.length : 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/students/update-preferences
// @desc    Update student learning preferences
// @access  Private
router.post('/update-preferences', auth, async (req, res) => {
  try {
    const { preferredSubjects, difficultyPreference, learningGoals } = req.body;
    
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (preferredSubjects) student.preferredSubjects = preferredSubjects;
    if (difficultyPreference) student.difficultyPreference = difficultyPreference;
    if (learningGoals) student.learningGoals = learningGoals;

    await student.save();
    res.json({ message: 'Preferences updated successfully', student });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/students/recommendations
// @desc    Get personalized lesson recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Analyze recent performance to generate recommendations
    const recentPerformance = student.performanceHistory.slice(-5);
    const subjectPerformance = {};
    
    recentPerformance.forEach(p => {
      if (!subjectPerformance[p.subject]) {
        subjectPerformance[p.subject] = { scores: [], count: 0 };
      }
      subjectPerformance[p.subject].scores.push(p.score);
      subjectPerformance[p.subject].count++;
    });

    // Calculate average performance by subject
    Object.keys(subjectPerformance).forEach(subject => {
      const data = subjectPerformance[subject];
      data.averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    });

    // Generate recommendations
    const recommendations = [];

    // Recommend subjects where student is performing well (for advancement)
    Object.entries(subjectPerformance).forEach(([subject, data]) => {
      if (data.averageScore >= 0.8) {
        recommendations.push({
          type: 'advance',
          subject,
          reason: `You're excelling in ${subject}! Try more challenging content.`,
          priority: 'high'
        });
      } else if (data.averageScore < 0.6) {
        recommendations.push({
          type: 'review',
          subject,
          reason: `You might benefit from reviewing ${subject} fundamentals.`,
          priority: 'high'
        });
      }
    });

    // Recommend subjects based on preferences
    student.preferredSubjects.forEach(subject => {
      if (!subjectPerformance[subject]) {
        recommendations.push({
          type: 'explore',
          subject,
          reason: `You've shown interest in ${subject}. Start exploring!`,
          priority: 'medium'
        });
      }
    });

    // Add streak-based recommendations
    if (student.streak >= 7) {
      recommendations.push({
        type: 'maintain',
        subject: 'any',
        reason: `Great streak! Keep up the momentum with any subject.`,
        priority: 'medium'
      });
    }

    res.json({
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      performance: subjectPerformance,
      currentStreak: student.streak,
      learningStyle: student.learningStyle
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
