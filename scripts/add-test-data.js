const mongoose = require('mongoose');
const Student = require('../models/Student');
const LearningPlan = require('../models/LearningPlan');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform');
    console.log('MongoDB connected for adding test data...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Additional test scenarios
const addTestScenarios = async () => {
  try {
    console.log('Adding additional test scenarios...');

    // 1. Student with no learning plans (for testing empty states)
    const noPlanStudent = new Student({
      name: 'Test User - No Plans',
      email: 'no-plans@test.com',
      password: await bcrypt.hash('password123', 10),
      age: 18,
      studentType: 'college',
      collegeDetails: {
        college: 'Test University',
        course: 'Computer Science',
        year: 2,
        semester: 4,
        technologies: [{ name: 'JavaScript', proficiency: 'Beginner' }],
        projects: []
      },
      learningStyle: { visual: 5, auditory: 5, kinesthetic: 5, reading: 5 },
      preferredSubjects: ['Programming'],
      difficultyPreference: 5,
      gamification: {
        points: 0,
        level: 1,
        badges: [],
        streaks: { current: 0, longest: 0, lastStudyDate: null }
      },
      totalStudyTime: 0,
      totalPoints: 0
    });
    await noPlanStudent.save();
    console.log('✅ Created student with no learning plans');

    // 2. Student with completed learning plan
    const completedPlanStudent = new Student({
      name: 'Test User - Completed Plan',
      email: 'completed-plan@test.com',
      password: await bcrypt.hash('password123', 10),
      age: 20,
      studentType: 'college',
      collegeDetails: {
        college: 'Test University',
        course: 'Information Technology',
        year: 3,
        semester: 6,
        technologies: [{ name: 'React', proficiency: 'Advanced' }],
        projects: [{ name: 'Portfolio Website', tech: 'React', status: 'Completed' }]
      },
      learningStyle: { visual: 8, auditory: 6, kinesthetic: 7, reading: 8 },
      preferredSubjects: ['Web Development'],
      difficultyPreference: 7,
      gamification: {
        points: 5000,
        level: 25,
        badges: ['Completed Plan', 'Perfect Score', '30-Day Streak'],
        streaks: { current: 30, longest: 30, lastStudyDate: new Date() }
      },
      totalStudyTime: 2000,
      totalPoints: 5000
    });
    await completedPlanStudent.save();

    // Create completed learning plan
    const completedPlan = new LearningPlan({
      student: completedPlanStudent._id,
      planType: 'roadmap-based',
      title: 'Completed Web Development Roadmap',
      description: 'Successfully completed web development learning plan',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      progress: {
        overallProgress: 100,
        completedUnits: [
          { subject: 'Frontend', unit: 'HTML/CSS', completedAt: new Date(), score: 95 },
          { subject: 'Frontend', unit: 'JavaScript', completedAt: new Date(), score: 92 },
          { subject: 'Frontend', unit: 'React', completedAt: new Date(), score: 88 },
          { subject: 'Backend', unit: 'Node.js', completedAt: new Date(), score: 85 }
        ],
        completedTopics: [
          { subject: 'Frontend', unit: 'HTML/CSS', topic: 'Responsive Design', completedAt: new Date(), score: 95, timeSpent: 180 },
          { subject: 'Frontend', unit: 'JavaScript', topic: 'ES6+ Features', completedAt: new Date(), score: 92, timeSpent: 200 },
          { subject: 'Frontend', unit: 'React', topic: 'Hooks', completedAt: new Date(), score: 88, timeSpent: 250 },
          { subject: 'Backend', unit: 'Node.js', topic: 'Express.js', completedAt: new Date(), score: 85, timeSpent: 220 }
        ],
        dailyProgress: [
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), studyHours: 4, completedSessions: 6, totalSessions: 6, score: 90, mood: 'excellent', notes: 'Final day completed!' }
        ]
      },
      curriculum: {
        subjects: [
          {
            name: 'Frontend',
            description: 'Frontend development skills',
            weightage: 60,
            units: [
              { title: 'HTML/CSS', description: 'Web fundamentals', topics: ['HTML5', 'CSS3', 'Responsive Design'], estimatedDuration: 30, order: 1 },
              { title: 'JavaScript', description: 'Programming basics', topics: ['ES6+', 'DOM Manipulation', 'Async Programming'], estimatedDuration: 40, order: 2 },
              { title: 'React', description: 'Frontend framework', topics: ['Components', 'Hooks', 'State Management'], estimatedDuration: 50, order: 3 }
            ],
            totalHours: 120
          },
          {
            name: 'Backend',
            description: 'Backend development skills',
            weightage: 40,
            units: [
              { title: 'Node.js', description: 'Server-side JavaScript', topics: ['Express.js', 'REST APIs', 'Database Integration'], estimatedDuration: 45, order: 1 }
            ],
            totalHours: 45
          }
        ]
      },
      dailyRoadmap: [
        {
          dayNumber: 90,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dayOfWeek: 'Monday',
          isStudyDay: true,
          totalStudyHours: 4,
          sessions: [
            {
              sessionId: 'day90_session1',
              subject: 'Backend',
              unit: 'Node.js',
              topics: ['Final Project'],
              duration: 240,
              startTime: '09:00',
              endTime: '13:00',
              type: 'project',
              learningObjectives: ['Complete final project', 'Deploy application'],
              resources: [],
              exercises: [],
              assessment: null,
              isCompleted: true,
              completionTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              score: 90,
              notes: 'Successfully completed the final project!'
            }
          ],
          dailyGoals: [
            { goal: 'Complete final project', isCompleted: true }
          ],
          dailyReflection: { mood: 'excellent', energy: 9, notes: 'Amazing feeling to complete the roadmap!' },
          progress: { completedSessions: 1, totalSessions: 1, studyTime: 240, score: 90 }
        }
      ],
      weeklyMilestones: [
        {
          weekNumber: 12,
          title: 'Final Week Milestone',
          description: 'Complete the entire learning roadmap',
          goals: ['Complete all remaining sessions', 'Submit final project'],
          targetProgress: 100,
          isCompleted: true,
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          achievements: ['Roadmap Completed', 'Certificate Earned']
        }
      ],
      schedule: {
        weeklyPlan: [],
        dailyStudyHours: 4,
        weeklyStudyDays: 5,
        breakDays: ['Saturday', 'Sunday']
      },
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3,
        dailyAdjustment: { enabled: true, basedOnMood: true, basedOnPerformance: true, basedOnEnergy: true }
      },
      gamification: {
        milestones: [
          { title: '25% Complete', description: 'Complete 25% of your plan', targetProgress: 25, reward: { type: 'points', value: 250 }, achieved: true, achievedAt: new Date() },
          { title: '50% Complete', description: 'Complete 50% of your plan', targetProgress: 50, reward: { type: 'points', value: 500 }, achieved: true, achievedAt: new Date() },
          { title: '75% Complete', description: 'Complete 75% of your plan', targetProgress: 75, reward: { type: 'points', value: 750 }, achieved: true, achievedAt: new Date() },
          { title: '100% Complete', description: 'Complete the entire plan', targetProgress: 100, reward: { type: 'badge', value: 'Roadmap Master' }, achieved: true, achievedAt: new Date() }
        ],
        challenges: [
          { title: '7-Day Streak', description: 'Study for 7 consecutive days', type: 'streak', target: 7, reward: { type: 'points', value: 100 }, completed: true, completedAt: new Date() },
          { title: '30-Day Streak', description: 'Study for 30 consecutive days', type: 'streak', target: 30, reward: { type: 'badge', value: 'Dedication Master' }, completed: true, completedAt: new Date() }
        ],
        dailyChallenges: [
          { title: 'Early Bird', description: 'Start studying before 9 AM', type: 'timing', target: 1, reward: { type: 'points', value: 50 }, isCompleted: true, completedAt: new Date() }
        ]
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true,
        dailyInsights: { enabled: true, moodAnalysis: true, performancePrediction: true, adaptiveSuggestions: true }
      }
    });
    await completedPlan.save();
    console.log('✅ Created student with completed learning plan');

    // 3. Student with paused learning plan
    const pausedPlanStudent = new Student({
      name: 'Test User - Paused Plan',
      email: 'paused-plan@test.com',
      password: await bcrypt.hash('password123', 10),
      age: 19,
      studentType: 'school',
      schoolDetails: {
        school: 'Test School',
        board: 'CBSE',
        class: '12',
        section: 'A',
        examPreparation: { neet: false, jee: true, other: 'JEE Preparation' }
      },
      learningStyle: { visual: 7, auditory: 6, kinesthetic: 8, reading: 7 },
      preferredSubjects: ['Mathematics', 'Physics'],
      difficultyPreference: 8,
      gamification: {
        points: 1500,
        level: 8,
        badges: ['Math Pro', 'Physics Enthusiast'],
        streaks: { current: 0, longest: 15, lastStudyDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      },
      totalStudyTime: 800,
      totalPoints: 1500
    });
    await pausedPlanStudent.save();

    // Create paused learning plan
    const pausedPlan = new LearningPlan({
      student: pausedPlanStudent._id,
      planType: 'exam-preparation',
      title: 'Paused JEE Preparation Plan',
      description: 'JEE preparation plan currently on hold',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'paused',
      progress: {
        overallProgress: 35,
        completedUnits: [
          { subject: 'Physics', unit: 'Mechanics', completedAt: new Date(), score: 75 },
          { subject: 'Mathematics', unit: 'Calculus', completedAt: new Date(), score: 80 }
        ],
        completedTopics: [
          { subject: 'Physics', unit: 'Mechanics', topic: 'Newton\'s Laws', completedAt: new Date(), score: 78, timeSpent: 150 },
          { subject: 'Mathematics', unit: 'Calculus', topic: 'Differentiation', completedAt: new Date(), score: 82, timeSpent: 180 }
        ],
        dailyProgress: [
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), studyHours: 3, completedSessions: 4, totalSessions: 5, score: 80, mood: 'good', notes: 'Last study session before pause' }
        ]
      },
      curriculum: {
        subjects: [
          {
            name: 'Physics',
            description: 'JEE Physics preparation',
            weightage: 40,
            units: [
              { title: 'Mechanics', description: 'Classical mechanics', topics: ['Newton\'s Laws', 'Work & Energy', 'Momentum'], estimatedDuration: 40, order: 1 },
              { title: 'Electromagnetism', description: 'Electric and magnetic fields', topics: ['Electric Field', 'Magnetic Field', 'Electromagnetic Induction'], estimatedDuration: 45, order: 2 }
            ],
            totalHours: 85
          },
          {
            name: 'Mathematics',
            description: 'JEE Mathematics preparation',
            weightage: 40,
            units: [
              { title: 'Calculus', description: 'Differential and integral calculus', topics: ['Differentiation', 'Integration', 'Applications'], estimatedDuration: 50, order: 1 },
              { title: 'Algebra', description: 'Advanced algebra', topics: ['Complex Numbers', 'Matrices', 'Determinants'], estimatedDuration: 40, order: 2 }
            ],
            totalHours: 90
          },
          {
            name: 'Chemistry',
            description: 'JEE Chemistry preparation',
            weightage: 20,
            units: [
              { title: 'Physical Chemistry', description: 'Physical chemistry concepts', topics: ['Thermodynamics', 'Chemical Kinetics', 'Electrochemistry'], estimatedDuration: 35, order: 1 }
            ],
            totalHours: 35
          }
        ]
      },
      dailyRoadmap: [],
      weeklyMilestones: [
        {
          weekNumber: 8,
          title: 'Week 8 Milestone',
          description: 'Complete week 8 of JEE preparation',
          goals: ['Complete Physics mechanics', 'Start electromagnetism'],
          targetProgress: 40,
          isCompleted: false
        }
      ],
      schedule: {
        weeklyPlan: [],
        dailyStudyHours: 4,
        weeklyStudyDays: 6,
        breakDays: ['Sunday']
      },
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3,
        dailyAdjustment: { enabled: true, basedOnMood: true, basedOnPerformance: true, basedOnEnergy: true }
      },
      gamification: {
        milestones: [
          { title: '25% Complete', description: 'Complete 25% of JEE preparation', targetProgress: 25, reward: { type: 'points', value: 250 }, achieved: true, achievedAt: new Date() },
          { title: '50% Complete', description: 'Complete 50% of JEE preparation', targetProgress: 50, reward: { type: 'points', value: 500 }, achieved: false }
        ],
        challenges: [
          { title: '7-Day Streak', description: 'Study for 7 consecutive days', type: 'streak', target: 7, reward: { type: 'points', value: 100 }, completed: true, completedAt: new Date() }
        ],
        dailyChallenges: [
          { title: 'Early Bird', description: 'Start studying before 9 AM', type: 'timing', target: 1, reward: { type: 'points', value: 50 }, isCompleted: false }
        ]
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true,
        dailyInsights: { enabled: true, moodAnalysis: true, performancePrediction: true, adaptiveSuggestions: true }
      }
    });
    await pausedPlan.save();
    console.log('✅ Created student with paused learning plan');

    // 4. Add some test lessons for different scenarios
    const testLessons = [
      {
        title: 'Test Lesson - Easy',
        subject: 'Test Subject',
        description: 'An easy test lesson for beginners',
        content: 'This is a simple test lesson with basic content.',
        difficulty: 1,
        estimatedDuration: 15,
        resources: [
          { type: 'video', title: 'Easy Tutorial', url: 'https://example.com/video', duration: 10 }
        ],
        exercises: [
          { title: 'Easy Quiz', type: 'quiz', questions: 5, timeLimit: 10 }
        ],
        tags: ['test', 'easy', 'beginner'],
        isPublished: true
      },
      {
        title: 'Test Lesson - Hard',
        subject: 'Advanced Test Subject',
        description: 'A challenging test lesson for advanced learners',
        content: 'This is a complex test lesson with advanced concepts.',
        difficulty: 5,
        estimatedDuration: 60,
        resources: [
          { type: 'video', title: 'Advanced Tutorial', url: 'https://example.com/video', duration: 30 },
          { type: 'article', title: 'Advanced Guide', url: 'https://example.com/article', duration: 20 }
        ],
        exercises: [
          { title: 'Advanced Challenge', type: 'coding', questions: 10, timeLimit: 60 },
          { title: 'Complex Project', type: 'project', estimatedTime: 180 }
        ],
        tags: ['test', 'hard', 'advanced'],
        isPublished: true
      },
      {
        title: 'Test Lesson - Unpublished',
        subject: 'Draft Subject',
        description: 'An unpublished test lesson',
        content: 'This lesson is not published yet.',
        difficulty: 3,
        estimatedDuration: 30,
        resources: [],
        exercises: [],
        tags: ['test', 'draft'],
        isPublished: false
      }
    ];

    for (const lessonData of testLessons) {
      const lesson = new Lesson(lessonData);
      await lesson.save();
    }
    console.log('✅ Created test lessons for different scenarios');

    console.log('\n🎯 Test Scenarios Added:');
    console.log('1. Student with no learning plans (no-plans@test.com)');
    console.log('2. Student with completed learning plan (completed-plan@test.com)');
    console.log('3. Student with paused learning plan (paused-plan@test.com)');
    console.log('4. Test lessons (easy, hard, unpublished)');

  } catch (error) {
    console.error('Error adding test scenarios:', error);
  }
};

// Run the script
if (require.main === module) {
  connectDB().then(() => {
    addTestScenarios().then(() => {
      mongoose.connection.close();
      console.log('Database connection closed');
    });
  });
}

module.exports = { addTestScenarios, connectDB };
