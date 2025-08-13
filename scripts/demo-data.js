// Demo Data Structure for Learning Platform
// This script shows the structure of dummy data without requiring MongoDB

const demoData = {
  students: {
    school: [
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
    ],
    college: [
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
    ]
  },
  learningPlans: {
    school: [
      {
        planType: 'syllabus-based',
        title: 'CBSE Class 10 Complete Syllabus',
        description: 'Comprehensive study plan covering all subjects for CBSE Class 10',
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
          ]
        }
      },
      {
        planType: 'exam-preparation',
        title: 'NEET Preparation Plan',
        description: 'Structured preparation plan for NEET medical entrance examination',
        status: 'active',
        progress: {
          overallProgress: 35,
          completedUnits: [
            { subject: 'Physics', unit: 'Mechanics', completedAt: new Date(), score: 75 }
          ],
          completedTopics: [
            { subject: 'Physics', unit: 'Mechanics', topic: 'Newton\'s Laws', completedAt: new Date(), score: 80, timeSpent: 150 }
          ]
        }
      }
    ],
    college: [
      {
        planType: 'technology-roadmap',
        title: 'MERN Stack Development Roadmap',
        description: 'Complete roadmap for mastering MERN Stack development',
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
          ]
        }
      },
      {
        planType: 'roadmap-based',
        title: 'Full Stack Development Roadmap',
        description: 'Complete roadmap for becoming a full stack developer',
        status: 'active',
        progress: {
          overallProgress: 25,
          completedUnits: [
            { subject: 'Frontend', unit: 'HTML/CSS/JS', completedAt: new Date(), score: 90 }
          ],
          completedTopics: [
            { subject: 'Frontend', unit: 'HTML/CSS/JS', topic: 'JavaScript Fundamentals', completedAt: new Date(), score: 88, timeSpent: 200 }
          ]
        }
      }
    ]
  },
  lessons: {
    school: [
      {
        title: 'Mathematics - Lesson 1',
        subject: 'Mathematics',
        description: 'Comprehensive lesson on Mathematics covering fundamental concepts',
        difficulty: 1,
        estimatedDuration: 30,
        resources: [
          { type: 'video', title: 'Mathematics Tutorial 1', url: 'https://example.com/video', duration: 15 },
          { type: 'article', title: 'Mathematics Guide 1', url: 'https://example.com/article', duration: 10 }
        ],
        exercises: [
          { title: 'Practice Questions', type: 'quiz', questions: 10, timeLimit: 20 },
          { title: 'Assignment', type: 'assignment', estimatedTime: 30 }
        ],
        tags: ['mathematics', 'school', 'class-10'],
        isPublished: true
      },
      {
        title: 'Science - Lesson 1',
        subject: 'Science',
        description: 'Comprehensive lesson on Science covering fundamental concepts',
        difficulty: 2,
        estimatedDuration: 25,
        resources: [
          { type: 'video', title: 'Science Tutorial 1', url: 'https://example.com/video', duration: 12 },
          { type: 'article', title: 'Science Guide 1', url: 'https://example.com/article', duration: 8 }
        ],
        exercises: [
          { title: 'Practice Questions', type: 'quiz', questions: 8, timeLimit: 15 },
          { title: 'Lab Assignment', type: 'assignment', estimatedTime: 45 }
        ],
        tags: ['science', 'school', 'class-10'],
        isPublished: true
      }
    ],
    college: [
      {
        title: 'Web Development - Advanced Lesson 1',
        subject: 'Web Development',
        description: 'Advanced lesson on Web Development covering practical applications',
        difficulty: 4,
        estimatedDuration: 45,
        resources: [
          { type: 'video', title: 'Web Development Advanced Tutorial 1', url: 'https://example.com/video', duration: 25 },
          { type: 'article', title: 'Web Development Advanced Guide 1', url: 'https://example.com/article', duration: 15 },
          { type: 'project', title: 'Web Development Project 1', url: 'https://github.com/example', duration: 60 }
        ],
        exercises: [
          { title: 'Coding Challenge', type: 'coding', questions: 5, timeLimit: 45 },
          { title: 'Project Assignment', type: 'project', estimatedTime: 120 }
        ],
        tags: ['web-development', 'college', 'advanced'],
        isPublished: true
      },
      {
        title: 'Data Structures - Advanced Lesson 1',
        subject: 'Data Structures',
        description: 'Advanced lesson on Data Structures covering practical applications',
        difficulty: 5,
        estimatedDuration: 60,
        resources: [
          { type: 'video', title: 'Data Structures Advanced Tutorial 1', url: 'https://example.com/video', duration: 30 },
          { type: 'article', title: 'Data Structures Advanced Guide 1', url: 'https://example.com/article', duration: 20 },
          { type: 'project', title: 'Data Structures Project 1', url: 'https://github.com/example', duration: 90 }
        ],
        exercises: [
          { title: 'Algorithm Challenge', type: 'coding', questions: 8, timeLimit: 60 },
          { title: 'Implementation Project', type: 'project', estimatedTime: 180 }
        ],
        tags: ['data-structures', 'college', 'advanced'],
        isPublished: true
      }
    ]
  },
  roadmaps: [
    {
      id: 'frontend',
      title: 'Frontend Development Roadmap',
      description: 'Complete roadmap to become a frontend developer',
      stages: [
        {
          name: 'Basics',
          topics: [
            { name: 'HTML', description: 'Learn HTML structure and semantics', duration: 20 },
            { name: 'CSS', description: 'Master CSS styling and layout', duration: 30 },
            { name: 'JavaScript', description: 'Learn JavaScript fundamentals', duration: 40 }
          ]
        },
        {
          name: 'Advanced Frontend',
          topics: [
            { name: 'React', description: 'Learn React.js framework', duration: 35 },
            { name: 'Vue.js', description: 'Alternative frontend framework', duration: 30 },
            { name: 'TypeScript', description: 'Type-safe JavaScript', duration: 25 }
          ]
        }
      ]
    },
    {
      id: 'backend',
      title: 'Backend Development Roadmap',
      description: 'Complete roadmap to become a backend developer',
      stages: [
        {
          name: 'Programming Fundamentals',
          topics: [
            { name: 'Python', description: 'Learn Python programming', duration: 30 },
            { name: 'Node.js', description: 'JavaScript runtime', duration: 25 },
            { name: 'Java', description: 'Enterprise programming', duration: 35 }
          ]
        },
        {
          name: 'Databases',
          topics: [
            { name: 'SQL', description: 'Relational databases', duration: 25 },
            { name: 'MongoDB', description: 'NoSQL database', duration: 20 },
            { name: 'Redis', description: 'In-memory database', duration: 15 }
          ]
        }
      ]
    },
    {
      id: 'fullstack',
      title: 'Full Stack Development Roadmap',
      description: 'Complete roadmap to become a full stack developer',
      stages: [
        {
          name: 'Frontend',
          topics: [
            { name: 'HTML/CSS/JS', description: 'Frontend fundamentals', duration: 30 },
            { name: 'React', description: 'Frontend framework', duration: 25 },
            { name: 'State Management', description: 'Redux, Context API', duration: 20 }
          ]
        },
        {
          name: 'Backend',
          topics: [
            { name: 'Node.js', description: 'JavaScript backend', duration: 25 },
            { name: 'Express.js', description: 'Web framework', duration: 20 },
            { name: 'Database Design', description: 'SQL and NoSQL', duration: 25 }
          ]
        }
      ]
    }
  ]
};

// Display demo data structure
console.log('🎓 Learning Platform - Demo Data Structure');
console.log('==========================================\n');

console.log('📚 Students:');
console.log(`- School Students: ${demoData.students.school.length}`);
demoData.students.school.forEach((student, index) => {
  console.log(`  ${index + 1}. ${student.name} (${student.email})`);
  console.log(`     School: ${student.schoolDetails.school}, Class: ${student.schoolDetails.class}`);
  console.log(`     Points: ${student.gamification.points}, Level: ${student.gamification.level}`);
});

console.log(`\n- College Students: ${demoData.students.college.length}`);
demoData.students.college.forEach((student, index) => {
  console.log(`  ${index + 1}. ${student.name} (${student.email})`);
  console.log(`     College: ${student.collegeDetails.college}, Course: ${student.collegeDetails.course}`);
  console.log(`     Points: ${student.gamification.points}, Level: ${student.gamification.level}`);
});

console.log('\n📋 Learning Plans:');
console.log(`- School Plans: ${demoData.learningPlans.school.length}`);
demoData.learningPlans.school.forEach((plan, index) => {
  console.log(`  ${index + 1}. ${plan.title}`);
  console.log(`     Type: ${plan.planType}, Progress: ${plan.progress.overallProgress}%`);
});

console.log(`\n- College Plans: ${demoData.learningPlans.college.length}`);
demoData.learningPlans.college.forEach((plan, index) => {
  console.log(`  ${index + 1}. ${plan.title}`);
  console.log(`     Type: ${plan.planType}, Progress: ${plan.progress.overallProgress}%`);
});

console.log('\n📖 Lessons:');
console.log(`- School Lessons: ${demoData.lessons.school.length}`);
demoData.lessons.school.forEach((lesson, index) => {
  console.log(`  ${index + 1}. ${lesson.title}`);
  console.log(`     Subject: ${lesson.subject}, Difficulty: ${lesson.difficulty}/5`);
});

console.log(`\n- College Lessons: ${demoData.lessons.college.length}`);
demoData.lessons.college.forEach((lesson, index) => {
  console.log(`  ${index + 1}. ${lesson.title}`);
  console.log(`     Subject: ${lesson.subject}, Difficulty: ${lesson.difficulty}/5`);
});

console.log('\n🗺️ Available Roadmaps:');
console.log(`- Total Roadmaps: ${demoData.roadmaps.length}`);
demoData.roadmaps.forEach((roadmap, index) => {
  console.log(`  ${index + 1}. ${roadmap.title}`);
  console.log(`     Description: ${roadmap.description}`);
  console.log(`     Stages: ${roadmap.stages.length}`);
});

console.log('\n🔑 Login Credentials:');
console.log('All students use password: password123');
console.log('\nExample logins:');
console.log('- School: aarav.sharma@school.com / password123');
console.log('- College: ananya.singh@college.com / password123');

console.log('\n📊 Data Summary:');
console.log(`- Total Students: ${demoData.students.school.length + demoData.students.college.length}`);
console.log(`- Total Learning Plans: ${demoData.learningPlans.school.length + demoData.learningPlans.college.length}`);
console.log(`- Total Lessons: ${demoData.lessons.school.length + demoData.lessons.college.length}`);
console.log(`- Total Roadmaps: ${demoData.roadmaps.length}`);

console.log('\n✅ Demo data structure ready for testing!');
console.log('\nTo use this data:');
console.log('1. Set up MongoDB (see DUMMY_DATA_SETUP.md)');
console.log('2. Run: node scripts/seed-dummy-data.js');
console.log('3. Run: node scripts/add-test-data.js');
console.log('4. Start the application and test with the provided credentials');

module.exports = demoData;
