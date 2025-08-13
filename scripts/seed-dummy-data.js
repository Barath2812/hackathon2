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
    console.log('MongoDB connected for seeding...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Dummy data for school students
const schoolStudents = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@school.com',
    password: 'password123',
    age: 15,
    studentType: 'school',
    schoolDetails: {
      school: 'Delhi Public School',
      board: 'CBSE',
      class: '10',
      section: 'A',
      examPreparation: {
        neet: false,
        jee: false,
        other: 'Board Exams'
      }
    },
    learningStyle: {
      visual: 8,
      auditory: 6,
      kinesthetic: 7,
      reading: 9
    },
    preferredSubjects: ['Mathematics', 'Science', 'Computer Science'],
    difficultyPreference: 7,
    gamification: {
      points: 1250,
      level: 8,
      badges: ['Early Bird', 'Perfect Score', 'Study Streak'],
      streaks: {
        current: 5,
        longest: 12,
        lastStudyDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@school.com',
    password: 'password123',
    age: 16,
    studentType: 'school',
    schoolDetails: {
      school: 'St. Mary\'s Convent',
      board: 'ICSE',
      class: '11',
      section: 'B',
      examPreparation: {
        neet: true,
        jee: false,
        other: 'NEET Preparation'
      }
    },
    learningStyle: {
      visual: 7,
      auditory: 8,
      kinesthetic: 6,
      reading: 8
    },
    preferredSubjects: ['Biology', 'Chemistry', 'Physics'],
    difficultyPreference: 8,
    gamification: {
      points: 2100,
      level: 12,
      badges: ['Biology Master', 'Perfect Score', '7-Day Streak'],
      streaks: {
        current: 3,
        longest: 15,
        lastStudyDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    name: 'Rahul Kumar',
    email: 'rahul.kumar@school.com',
    password: 'password123',
    age: 17,
    studentType: 'school',
    schoolDetails: {
      school: 'Kendriya Vidyalaya',
      board: 'CBSE',
      class: '12',
      section: 'C',
      examPreparation: {
        neet: false,
        jee: true,
        other: 'JEE Main & Advanced'
      }
    },
    learningStyle: {
      visual: 6,
      auditory: 5,
      kinesthetic: 9,
      reading: 7
    },
    preferredSubjects: ['Mathematics', 'Physics', 'Chemistry'],
    difficultyPreference: 9,
    gamification: {
      points: 3400,
      level: 18,
      badges: ['Math Genius', 'Physics Pro', 'Perfect Score'],
      streaks: {
        current: 8,
        longest: 20,
        lastStudyDate: new Date()
      }
    }
  }
];

// Dummy data for college students
const collegeStudents = [
  {
    name: 'Ananya Singh',
    email: 'ananya.singh@college.com',
    password: 'password123',
    age: 20,
    studentType: 'college',
    collegeDetails: {
      college: 'Delhi Technological University',
      course: 'Computer Science Engineering',
      year: 3,
      semester: 6,
      technologies: [
        { name: 'MERN Stack', proficiency: 'Intermediate' },
        { name: 'Python', proficiency: 'Advanced' },
        { name: 'Machine Learning', proficiency: 'Beginner' }
      ],
      projects: [
        { name: 'E-commerce Platform', tech: 'MERN Stack', status: 'Completed' },
        { name: 'AI Chatbot', tech: 'Python', status: 'In Progress' }
      ]
    },
    learningStyle: {
      visual: 8,
      auditory: 6,
      kinesthetic: 7,
      reading: 8
    },
    preferredSubjects: ['Web Development', 'Data Structures', 'Database Management'],
    difficultyPreference: 7,
    gamification: {
      points: 2800,
      level: 15,
      badges: ['Full Stack Developer', 'Code Master', 'Project Champion'],
      streaks: {
        current: 12,
        longest: 25,
        lastStudyDate: new Date()
      }
    }
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@college.com',
    password: 'password123',
    age: 22,
    studentType: 'college',
    collegeDetails: {
      college: 'BITS Pilani',
      course: 'Information Technology',
      year: 4,
      semester: 8,
      technologies: [
        { name: 'Java', proficiency: 'Advanced' },
        { name: 'Spring Boot', proficiency: 'Intermediate' },
        { name: 'AWS', proficiency: 'Beginner' }
      ],
      projects: [
        { name: 'Microservices API', tech: 'Spring Boot', status: 'Completed' },
        { name: 'Cloud Deployment', tech: 'AWS', status: 'In Progress' }
      ]
    },
    learningStyle: {
      visual: 7,
      auditory: 8,
      kinesthetic: 6,
      reading: 9
    },
    preferredSubjects: ['Backend Development', 'System Design', 'Cloud Computing'],
    difficultyPreference: 8,
    gamification: {
      points: 4200,
      level: 22,
      badges: ['Backend Expert', 'System Architect', 'Cloud Pioneer'],
      streaks: {
        current: 18,
        longest: 30,
        lastStudyDate: new Date()
      }
    }
  },
  {
    name: 'Zara Khan',
    email: 'zara.khan@college.com',
    password: 'password123',
    age: 19,
    studentType: 'college',
    collegeDetails: {
      college: 'Manipal Institute of Technology',
      course: 'Data Science',
      year: 2,
      semester: 4,
      technologies: [
        { name: 'Python', proficiency: 'Advanced' },
        { name: 'TensorFlow', proficiency: 'Intermediate' },
        { name: 'SQL', proficiency: 'Advanced' }
      ],
      projects: [
        { name: 'Sentiment Analysis', tech: 'Python', status: 'Completed' },
        { name: 'Recommendation System', tech: 'Machine Learning', status: 'In Progress' }
      ]
    },
    learningStyle: {
      visual: 9,
      auditory: 5,
      kinesthetic: 6,
      reading: 8
    },
    preferredSubjects: ['Machine Learning', 'Statistics', 'Data Visualization'],
    difficultyPreference: 7,
    gamification: {
      points: 1900,
      level: 10,
      badges: ['Data Scientist', 'ML Enthusiast', 'Visualization Pro'],
      streaks: {
        current: 6,
        longest: 14,
        lastStudyDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  }
];

// Generate learning plans for students
const generateLearningPlans = (student) => {
  const plans = [];
  
  if (student.studentType === 'school') {
    // School student plans
    plans.push({
      planType: 'syllabus-based',
      title: `${student.schoolDetails.board} Class ${student.schoolDetails.class} Complete Syllabus`,
      description: `Comprehensive study plan covering all subjects for ${student.schoolDetails.board} Class ${student.schoolDetails.class}`,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: {
        overallProgress: 65,
        completedUnits: [
          { subject: 'Mathematics', unit: 'Algebra', completedAt: new Date(), score: 85 },
          { subject: 'Science', unit: 'Physics', completedAt: new Date(), score: 78 }
        ],
        completedTopics: [
          { subject: 'Mathematics', unit: 'Algebra', topic: 'Linear Equations', completedAt: new Date(), score: 90, timeSpent: 120 },
          { subject: 'Science', unit: 'Physics', topic: 'Motion', completedAt: new Date(), score: 85, timeSpent: 90 }
        ],
        dailyProgress: [
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000), studyHours: 3, completedSessions: 4, totalSessions: 5, score: 82, mood: 'good', notes: 'Good progress in math' },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), studyHours: 2.5, completedSessions: 3, totalSessions: 4, score: 78, mood: 'okay', notes: 'Physics was challenging' }
        ]
      }
    });

    if (student.schoolDetails.examPreparation.neet || student.schoolDetails.examPreparation.jee) {
      plans.push({
        planType: 'exam-preparation',
        title: `${student.schoolDetails.examPreparation.neet ? 'NEET' : 'JEE'} Preparation Plan`,
        description: `Structured preparation plan for ${student.schoolDetails.examPreparation.neet ? 'NEET' : 'JEE'} examination`,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
        progress: {
          overallProgress: 35,
          completedUnits: [
            { subject: 'Physics', unit: 'Mechanics', completedAt: new Date(), score: 75 }
          ],
          completedTopics: [
            { subject: 'Physics', unit: 'Mechanics', topic: 'Newton\'s Laws', completedAt: new Date(), score: 80, timeSpent: 150 }
          ],
          dailyProgress: [
            { date: new Date(Date.now() - 24 * 60 * 60 * 1000), studyHours: 4, completedSessions: 5, totalSessions: 6, score: 85, mood: 'excellent', notes: 'Great understanding of mechanics' }
          ]
        }
      });
    }
  } else {
    // College student plans
    plans.push({
      planType: 'technology-roadmap',
      title: `${student.collegeDetails.technologies[0].name} Development Roadmap`,
      description: `Complete roadmap for mastering ${student.collegeDetails.technologies[0].name} development`,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: {
        overallProgress: 55,
        completedUnits: [
          { subject: 'Web Development', unit: 'Frontend Basics', completedAt: new Date(), score: 88 },
          { subject: 'Backend Development', unit: 'API Design', completedAt: new Date(), score: 82 }
        ],
        completedTopics: [
          { subject: 'Web Development', unit: 'Frontend Basics', topic: 'React Components', completedAt: new Date(), score: 92, timeSpent: 180 },
          { subject: 'Backend Development', unit: 'API Design', topic: 'REST APIs', completedAt: new Date(), score: 85, timeSpent: 150 }
        ],
        dailyProgress: [
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000), studyHours: 4.5, completedSessions: 6, totalSessions: 7, score: 88, mood: 'excellent', notes: 'React hooks are amazing!' },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), studyHours: 3.5, completedSessions: 5, totalSessions: 6, score: 82, mood: 'good', notes: 'API design concepts clear' }
        ]
      }
    });

    plans.push({
      planType: 'roadmap-based',
      title: 'Full Stack Development Roadmap',
      description: 'Complete roadmap for becoming a full stack developer',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: {
        overallProgress: 25,
        completedUnits: [
          { subject: 'Frontend', unit: 'HTML/CSS/JS', completedAt: new Date(), score: 90 }
        ],
        completedTopics: [
          { subject: 'Frontend', unit: 'HTML/CSS/JS', topic: 'JavaScript Fundamentals', completedAt: new Date(), score: 88, timeSpent: 200 }
        ],
        dailyProgress: [
          { date: new Date(Date.now() - 24 * 60 * 60 * 1000), studyHours: 3, completedSessions: 4, totalSessions: 5, score: 85, mood: 'good', notes: 'JavaScript concepts solid' }
        ]
      }
    });
  }

  return plans;
};

// Generate lessons for students
const generateLessons = (student) => {
  const lessons = [];
  
  if (student.studentType === 'school') {
    // School lessons
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
    subjects.forEach((subject, index) => {
      for (let i = 1; i <= 5; i++) {
        lessons.push({
          title: `${subject} - Lesson ${i}`,
          subject: subject,
          description: `Comprehensive lesson on ${subject} covering fundamental concepts`,
          content: `This lesson covers essential topics in ${subject} including theory, examples, and practice problems.`,
          difficulty: Math.floor(Math.random() * 3) + 1,
          estimatedDuration: Math.floor(Math.random() * 30) + 20,
          resources: [
            { type: 'video', title: `${subject} Tutorial ${i}`, url: 'https://example.com/video', duration: 15 },
            { type: 'article', title: `${subject} Guide ${i}`, url: 'https://example.com/article', duration: 10 }
          ],
          exercises: [
            { title: 'Practice Questions', type: 'quiz', questions: 10, timeLimit: 20 },
            { title: 'Assignment', type: 'assignment', estimatedTime: 30 }
          ],
          tags: [subject.toLowerCase(), 'school', 'class-' + student.schoolDetails.class],
          isPublished: true,
          createdAt: new Date(Date.now() - (index * 7 + i) * 24 * 60 * 60 * 1000)
        });
      }
    });
  } else {
    // College lessons
    const subjects = ['Web Development', 'Data Structures', 'Database Management', 'System Design', 'Machine Learning'];
    subjects.forEach((subject, index) => {
      for (let i = 1; i <= 4; i++) {
        lessons.push({
          title: `${subject} - Advanced Lesson ${i}`,
          subject: subject,
          description: `Advanced lesson on ${subject} covering practical applications and real-world scenarios`,
          content: `This advanced lesson delves deep into ${subject} concepts with hands-on projects and industry best practices.`,
          difficulty: Math.floor(Math.random() * 3) + 3,
          estimatedDuration: Math.floor(Math.random() * 45) + 30,
          resources: [
            { type: 'video', title: `${subject} Advanced Tutorial ${i}`, url: 'https://example.com/video', duration: 25 },
            { type: 'article', title: `${subject} Advanced Guide ${i}`, url: 'https://example.com/article', duration: 15 },
            { type: 'project', title: `${subject} Project ${i}`, url: 'https://github.com/example', duration: 60 }
          ],
          exercises: [
            { title: 'Coding Challenge', type: 'coding', questions: 5, timeLimit: 45 },
            { title: 'Project Assignment', type: 'project', estimatedTime: 120 }
          ],
          tags: [subject.toLowerCase().replace(' ', '-'), 'college', 'advanced'],
          isPublished: true,
          createdAt: new Date(Date.now() - (index * 7 + i) * 24 * 60 * 60 * 1000)
        });
      }
    });
  }

  return lessons;
};

// Generate progress data
const generateProgress = (student, lessons) => {
  const progress = [];
  
  lessons.forEach((lesson, index) => {
    // Randomly complete some lessons
    if (Math.random() > 0.3) {
      progress.push({
        student: student._id,
        lesson: lesson._id,
        status: 'completed',
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        timeSpent: Math.floor(Math.random() * 30) + lesson.estimatedDuration,
        completedAt: new Date(Date.now() - (index * 2) * 24 * 60 * 60 * 1000),
        notes: `Good understanding of ${lesson.subject} concepts`,
        exercises: [
          { title: lesson.exercises[0].title, score: Math.floor(Math.random() * 30) + 70, completedAt: new Date() }
        ]
      });
    } else {
      progress.push({
        student: student._id,
        lesson: lesson._id,
        status: 'in-progress',
        score: Math.floor(Math.random() * 40) + 30, // 30-70
        timeSpent: Math.floor(Math.random() * lesson.estimatedDuration),
        startedAt: new Date(Date.now() - (index * 3) * 24 * 60 * 60 * 1000),
        notes: `Still working on ${lesson.subject} concepts`,
        exercises: []
      });
    }
  });

  return progress;
};

// Main seeding function
const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Student.deleteMany({});
    await LearningPlan.deleteMany({});
    await Lesson.deleteMany({});
    await Progress.deleteMany({});

    console.log('Cleared existing data');

    // Create students
    const allStudents = [...schoolStudents, ...collegeStudents];
    const createdStudents = [];

    for (const studentData of allStudents) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(studentData.password, salt);

      const student = new Student({
        ...studentData,
        password: hashedPassword,
        totalStudyTime: Math.floor(Math.random() * 1000) + 500,
        totalPoints: studentData.gamification.points,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
      });

      const savedStudent = await student.save();
      createdStudents.push(savedStudent);
      console.log(`Created student: ${savedStudent.name}`);
    }

    // Create learning plans for each student
    for (const student of createdStudents) {
      const plans = generateLearningPlans(student);
      
      for (const planData of plans) {
        const plan = new LearningPlan({
          ...planData,
          student: student._id,
          curriculum: {
            subjects: [
              {
                name: 'Mathematics',
                description: 'Core mathematical concepts',
                weightage: 25,
                units: [
                  {
                    title: 'Algebra',
                    description: 'Algebraic concepts and problem solving',
                    topics: ['Linear Equations', 'Quadratic Equations', 'Polynomials'],
                    estimatedDuration: 20,
                    order: 1
                  }
                ],
                totalHours: 20
              }
            ]
          },
          dailyRoadmap: [
            {
              dayNumber: 1,
              date: new Date(),
              dayOfWeek: 'Monday',
              isStudyDay: true,
              totalStudyHours: 3,
              sessions: [
                {
                  sessionId: 'day1_session1',
                  subject: 'Mathematics',
                  unit: 'Algebra',
                  topics: ['Linear Equations'],
                  duration: 90,
                  startTime: '09:00',
                  endTime: '10:30',
                  type: 'learning',
                  learningObjectives: ['Understand linear equations', 'Solve practice problems'],
                  resources: [
                    { type: 'video', title: 'Linear Equations Tutorial', url: '#', duration: 30 }
                  ],
                  exercises: [
                    { title: 'Practice Problems', type: 'quiz', estimatedTime: 20 }
                  ],
                  assessment: { type: 'quiz', questions: 5, timeLimit: 15 },
                  isCompleted: false
                }
              ],
              dailyGoals: [
                { goal: 'Complete Algebra session', isCompleted: false }
              ],
              dailyReflection: { mood: null, energy: null, notes: '' },
              progress: { completedSessions: 0, totalSessions: 1, studyTime: 0, score: 0 }
            }
          ],
          weeklyMilestones: [
            {
              weekNumber: 1,
              title: 'Week 1 Milestone',
              description: 'Complete first week of learning',
              goals: ['Complete 5 daily sessions', 'Maintain study schedule'],
              targetProgress: 20,
              isCompleted: false
            }
          ],
          schedule: {
            weeklyPlan: [
              {
                day: 'Monday',
                sessions: [
                  {
                    subject: 'Mathematics',
                    unit: 'Algebra',
                    topics: ['Linear Equations'],
                    duration: 90,
                    startTime: '09:00',
                    endTime: '10:30',
                    type: 'learning'
                  }
                ]
              }
            ],
            dailyStudyHours: 3,
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
              { title: '25% Complete', description: 'Complete 25% of your plan', targetProgress: 25, reward: { type: 'points', value: 250 }, achieved: false },
              { title: '50% Complete', description: 'Complete 50% of your plan', targetProgress: 50, reward: { type: 'points', value: 500 }, achieved: false }
            ],
            challenges: [
              { title: '7-Day Streak', description: 'Study for 7 consecutive days', type: 'streak', target: 7, reward: { type: 'points', value: 100 }, completed: false }
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

        await plan.save();
        console.log(`Created learning plan: ${plan.title} for ${student.name}`);
      }
    }

    // Create lessons
    const allLessons = [];
    for (const student of createdStudents) {
      const lessons = generateLessons(student);
      for (const lessonData of lessons) {
        const lesson = new Lesson(lessonData);
        const savedLesson = await lesson.save();
        allLessons.push(savedLesson);
      }
      console.log(`Created ${lessons.length} lessons for ${student.name}`);
    }

    // Create progress data
    for (const student of createdStudents) {
      const studentLessons = allLessons.filter(lesson => 
        lesson.tags.some(tag => 
          (student.studentType === 'school' && tag.includes('school')) ||
          (student.studentType === 'college' && tag.includes('college'))
        )
      );
      
      const progress = generateProgress(student, studentLessons);
      for (const progressData of progress) {
        const progressRecord = new Progress(progressData);
        await progressRecord.save();
      }
      console.log(`Created ${progress.length} progress records for ${student.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- Students created: ${createdStudents.length}`);
    console.log(`- Learning plans created: ${createdStudents.length * 2}`);
    console.log(`- Lessons created: ${allLessons.length}`);
    console.log(`- Progress records created: ${allLessons.length * createdStudents.length}`);

    console.log('\n🎓 School Students:');
    schoolStudents.forEach(student => console.log(`  - ${student.name} (${student.email})`));
    
    console.log('\n🏫 College Students:');
    collegeStudents.forEach(student => console.log(`  - ${student.name} (${student.email})`));

    console.log('\n🔑 All students use password: password123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = { seedData, connectDB };
