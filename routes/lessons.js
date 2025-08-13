const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');

// @route   GET api/lessons
// @desc    Get lessons based on student's level and preferences
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { subject, difficulty, limit = 10 } = req.query;
    
    // Build query based on student's preferences and level
    let query = { isActive: true, isPublished: true };
    
    if (subject) {
      query.subject = subject;
    } else if (student.preferredSubjects.length > 0) {
      query.subject = { $in: student.preferredSubjects };
    }
    
    if (difficulty) {
      query.difficulty = parseInt(difficulty);
    } else {
      // Adaptive difficulty based on student's level and performance
      const targetDifficulty = Math.max(1, Math.min(10, 
        student.currentLevel + Math.floor(student.overallPerformance * 2)
      ));
      query.difficulty = { $gte: targetDifficulty - 1, $lte: targetDifficulty + 1 };
    }

    const lessons = await Lesson.find(query)
      .limit(parseInt(limit))
      .sort({ 'usageStats.averageScore': -1, difficulty: 1 });

    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/lessons/:id
// @desc    Get specific lesson with adaptive content
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    console.log('=== LESSON RETRIEVAL DEBUG ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Lesson title:', lesson.title);
    console.log('Questions count in database:', lesson.questions.length);
    console.log('Questions:', lesson.questions.map(q => ({ 
      question: q.question.substring(0, 50) + '...', 
      type: q.type,
      options: q.options?.length || 0 
    })));

    // Adapt lesson content based on student's learning style
    let adaptedLesson = lesson.toObject();
    
    // Add personalized hints if student struggles with this type of content
    if (lesson.aiEnhancements.personalizedHints) {
      const recentPerformance = student.performanceHistory
        .filter(p => p.subject === lesson.subject)
        .slice(-3);
      
      if (recentPerformance.length > 0) {
        const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
        if (avgScore < 0.7) {
          // Add extra hints for struggling students
          adaptedLesson.questions = adaptedLesson.questions.map(q => ({
            ...q,
            hints: [...(q.hints || []), 'Take your time and read carefully', 'Try breaking it down into smaller steps']
          }));
        }
      }
    }

    console.log('Adapted lesson questions count:', adaptedLesson.questions.length);
    console.log('=== END DEBUG ===');

    res.json(adaptedLesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/lessons/:id/start
// @desc    Start a lesson session
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      lesson,
      sessionId,
      startTime: new Date(),
      estimatedDuration: lesson.estimatedDuration || 15
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/lessons/:id/submit
// @desc    Submit lesson answers and get adaptive feedback
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeSpent, sessionId } = req.body;
    const student = await Student.findById(req.student.id);
    const lesson = await Lesson.findById(req.params.id);

    if (!student || !lesson) {
      return res.status(404).json({ msg: 'Student or lesson not found' });
    }

    // Calculate score and analyze performance
    let correctAnswers = 0;
    let mistakes = [];
    const questionResponses = [];

    lesson.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      const isCorrect = studentAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      } else {
        mistakes.push({
          question: question.question,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          topic: question.tags?.[0] || 'general'
        });
      }

      questionResponses.push({
        questionId: index.toString(),
        studentAnswer,
        isCorrect,
        timeSpent: timeSpent / lesson.questions.length,
        hintsUsed: 0,
        attempts: 1,
        difficulty: question.difficulty
      });
    });

    const score = (correctAnswers / lesson.questions.length) * 100;
    const pointsEarned = Math.floor(score / 10) * lesson.questions.length;

    // Update student progress
    student.performanceHistory.push({
      subject: lesson.subject,
      difficulty: lesson.difficulty,
      score: score / 100,
      timeSpent,
      mistakes: mistakes.map(m => m.topic),
      timestamp: new Date()
    });

    student.totalPoints += pointsEarned;
    student.totalStudyTime += Math.floor(timeSpent / 60); // Convert to minutes

    // Update streak
    const lastActive = new Date(student.lastActive);
    const today = new Date();
    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      student.streak += 1;
    } else {
      student.streak = 1;
    }

    student.lastActive = new Date();
    await student.save();

    // Update lesson usage statistics
    await lesson.updateUsageStats(score / 100, timeSpent);

    // Check for achievements
    const achievements = [];
    if (score >= 90 && student.achievements.indexOf('High Scorer') === -1) {
      achievements.push('High Scorer');
    }
    if (student.streak >= 7 && student.achievements.indexOf('Week Warrior') === -1) {
      achievements.push('Week Warrior');
    }
    if (student.totalPoints >= 1000 && student.achievements.indexOf('Point Master') === -1) {
      achievements.push('Point Master');
    }

    if (achievements.length > 0) {
      student.achievements.push(...achievements);
      await student.save();
    }

    // Prepare adaptive response
    const response = {
      score,
      pointsEarned,
      correctAnswers,
      totalQuestions: lesson.questions.length,
      timeSpent,
      mistakes,
      achievements,
      streak: student.streak,
      totalPoints: student.totalPoints
    };

    // Suggest micro-quiz if there are mistakes
    if (mistakes.length > 0) {
      response.suggestMicroQuiz = true;
      response.microQuizTopics = [...new Set(mistakes.map(m => m.topic))];
    }

    // Recommend next lesson
    const nextLesson = await Lesson.findOne({
      subject: lesson.subject,
      difficulty: { $gte: lesson.difficulty - 1, $lte: lesson.difficulty + 1 },
      _id: { $ne: lesson._id },
      isActive: true,
      isPublished: true
    }).sort({ difficulty: 1 });

    if (nextLesson) {
      response.recommendedNextLesson = {
        id: nextLesson._id,
        title: nextLesson.title,
        difficulty: nextLesson.difficulty
      };
    }

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/lessons/subjects/:subject
// @desc    Get lessons by subject with difficulty progression
// @access  Private
router.get('/subjects/:subject', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const { subject } = req.params;
    const { difficulty } = req.query;

    let query = { 
      subject, 
      isActive: true, 
      isPublished: true 
    };

    if (difficulty) {
      query.difficulty = parseInt(difficulty);
    }

    const lessons = await Lesson.find(query)
      .sort({ difficulty: 1, 'usageStats.averageScore': -1 })
      .select('title description difficulty estimatedDuration usageStats');

    // Group by difficulty for progression view
    const lessonsByDifficulty = {};
    lessons.forEach(lesson => {
      if (!lessonsByDifficulty[lesson.difficulty]) {
        lessonsByDifficulty[lesson.difficulty] = [];
      }
      lessonsByDifficulty[lesson.difficulty].push(lesson);
    });

    res.json({
      subject,
      lessonsByDifficulty,
      totalLessons: lessons.length,
      difficultyRange: {
        min: Math.min(...lessons.map(l => l.difficulty)),
        max: Math.max(...lessons.map(l => l.difficulty))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/lessons
// @desc    Create a new lesson (admin function)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      difficulty,
      content,
      questions,
      objectives,
      tags,
      estimatedDuration
    } = req.body;

    const lesson = new Lesson({
      title,
      subject,
      description,
      difficulty,
      content,
      questions,
      objectives,
      tags,
      estimatedDuration
    });

    await lesson.save();
    res.json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/lessons/:id/debug
// @desc    Debug route to check raw lesson data
// @access  Private
router.get('/:id/debug', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).lean();
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    console.log('=== RAW LESSON DEBUG ===');
    console.log('Lesson ID:', req.params.id);
    console.log('Lesson title:', lesson.title);
    console.log('Questions count:', lesson.questions?.length || 0);
    console.log('Raw questions:', JSON.stringify(lesson.questions, null, 2));
    console.log('=== END RAW DEBUG ===');

    res.json({
      lessonId: lesson._id,
      title: lesson.title,
      questionsCount: lesson.questions?.length || 0,
      questions: lesson.questions || [],
      rawLesson: lesson
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
