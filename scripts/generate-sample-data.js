const mongoose = require('mongoose');
const Student = require('../models/Student');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const generateSampleData = async () => {
  try {
    console.log('Generating sample data...');

    // Find or create a test student
    let student = await Student.findOne({ email: 'test@example.com' });
    
    if (!student) {
      console.log('Creating test student...');
      student = new Student({
        name: 'Test Student',
        email: 'test@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        age: 16,
        studentType: 'school',
        schoolDetails: {
          class: '10',
          board: 'CBSE',
          medium: 'English',
          subjects: [
            {
              name: 'math',
              syllabus: [
                {
                  unit: 'Algebra',
                  topics: ['Linear Equations', 'Quadratic Equations'],
                  weightage: 30,
                  estimatedHours: 20
                }
              ]
            },
            {
              name: 'science',
              syllabus: [
                {
                  unit: 'Chemistry',
                  topics: ['Chemical Reactions', 'Acids and Bases'],
                  weightage: 25,
                  estimatedHours: 15
                }
              ]
            },
            {
              name: 'english',
              syllabus: [
                {
                  unit: 'Grammar',
                  topics: ['Parts of Speech', 'Sentence Structure'],
                  weightage: 20,
                  estimatedHours: 10
                }
              ]
            }
          ],
          examPreparation: { neet: false, jee: false, other: [] }
        },
        learningStyle: { visual: 0.4, auditory: 0.3, kinesthetic: 0.3 },
        preferredSubjects: ['math', 'science'],
        difficultyPreference: 6,
        currentLevel: 3,
        totalPoints: 1250,
        streak: 7,
        achievements: [
          'First Lesson Completed',
          'Math Master',
          'Week Warrior',
          'Perfect Score'
        ],
        performanceHistory: [
          {
            subject: 'math',
            difficulty: 5,
            score: 0.85,
            timeSpent: 15,
            mistakes: ['algebraic expressions'],
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            subject: 'science',
            difficulty: 4,
            score: 0.92,
            timeSpent: 12,
            mistakes: [],
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            subject: 'math',
            difficulty: 6,
            score: 0.78,
            timeSpent: 18,
            mistakes: ['quadratic equations', 'factoring'],
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
          },
          {
            subject: 'english',
            difficulty: 3,
            score: 0.95,
            timeSpent: 10,
            mistakes: [],
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
          },
          {
            subject: 'science',
            difficulty: 5,
            score: 0.88,
            timeSpent: 14,
            mistakes: ['chemical reactions'],
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        totalStudyTime: 180,
        lastActive: new Date(),
        aiInteractions: []
      });
      
      await student.save();
      console.log('Test student created successfully');
    } else {
      console.log('Test student already exists');
    }

    // Create sample lessons
    const sampleLessons = [
      {
        title: 'Introduction to Algebra',
        subject: 'math',
        description: 'Learn the basics of algebraic expressions and equations',
        difficulty: 4,
        content: 'Algebra is a branch of mathematics that deals with symbols and the rules for manipulating these symbols...',
        questions: [
          {
            question: 'What is the value of x in the equation 2x + 3 = 11?',
            type: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Subtract 3 from both sides: 2x = 8, then divide by 2: x = 4',
            difficulty: 4
          }
        ],
        estimatedDuration: 20,
        tags: ['algebra', 'equations', 'beginner']
      },
      {
        title: 'Chemical Reactions',
        subject: 'science',
        description: 'Understanding different types of chemical reactions',
        difficulty: 5,
        content: 'Chemical reactions are processes that lead to the transformation of one set of chemical substances to another...',
        questions: [
          {
            question: 'Which type of reaction produces heat and light?',
            type: 'multiple-choice',
            options: ['Endothermic', 'Exothermic', 'Neutral', 'Catalytic'],
            correctAnswer: 'Exothermic',
            explanation: 'Exothermic reactions release energy in the form of heat and light',
            difficulty: 5
          }
        ],
        estimatedDuration: 25,
        tags: ['chemistry', 'reactions', 'energy']
      },
      {
        title: 'Grammar Fundamentals',
        subject: 'english',
        description: 'Master the basics of English grammar',
        difficulty: 3,
        content: 'Grammar is the set of structural rules governing the composition of clauses, phrases, and words...',
        questions: [
          {
            question: 'Which word is a conjunction in the sentence: "I like both tea and coffee"?',
            type: 'multiple-choice',
            options: ['I', 'like', 'both', 'and'],
            correctAnswer: 'and',
            explanation: '"And" is a conjunction that connects two similar elements',
            difficulty: 3
          }
        ],
        estimatedDuration: 15,
        tags: ['grammar', 'conjunctions', 'basics']
      }
    ];

    for (const lessonData of sampleLessons) {
      const existingLesson = await Lesson.findOne({ title: lessonData.title });
      if (!existingLesson) {
        const lesson = new Lesson(lessonData);
        await lesson.save();
        console.log(`Created lesson: ${lessonData.title}`);
      }
    }

    // Create sample progress records
    const lessons = await Lesson.find();
    if (lessons.length > 0) {
      const sampleProgress = [
        {
          studentId: student._id,
          lessonId: lessons[0]._id,
          sessionId: 'session_1',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
          totalTimeSpent: 900,
          score: 85,
          questionsAttempted: 5,
          questionsCorrect: 4,
          questionResponses: [
            {
              questionId: 'q1',
              studentAnswer: '4',
              isCorrect: true,
              timeSpent: 120,
              hintsUsed: 0,
              attempts: 1,
              difficulty: 4
            }
          ],
          status: 'completed'
        },
        {
          studentId: student._id,
          lessonId: lessons[1]._id,
          sessionId: 'session_2',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
          totalTimeSpent: 720,
          score: 92,
          questionsAttempted: 4,
          questionsCorrect: 4,
          questionResponses: [
            {
              questionId: 'q1',
              studentAnswer: 'Exothermic',
              isCorrect: true,
              timeSpent: 90,
              hintsUsed: 0,
              attempts: 1,
              difficulty: 5
            }
          ],
          status: 'completed'
        }
      ];

      for (const progressData of sampleProgress) {
        const existingProgress = await Progress.findOne({ 
          studentId: progressData.studentId, 
          lessonId: progressData.lessonId 
        });
        if (!existingProgress) {
          const progress = new Progress(progressData);
          await progress.save();
          console.log(`Created progress record for lesson: ${progressData.lessonId}`);
        }
      }
    }

    console.log('Sample data generation completed successfully!');
    console.log('Test student email: test@example.com');
    console.log('Test student password: password');

  } catch (error) {
    console.error('Error generating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

generateSampleData();
