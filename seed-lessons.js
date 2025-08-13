const mongoose = require('mongoose');
const Lesson = require('./models/Lesson');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleLessons = [
  {
    title: 'Introduction to Basic Mathematics',
    subject: 'math',
    description: 'Learn fundamental mathematical concepts including addition, subtraction, multiplication, and division.',
    difficulty: 1,
    content: 'Mathematics is the foundation of many subjects. In this lesson, we will explore basic arithmetic operations.',
    questions: [
      {
        question: 'What is 5 + 3?',
        type: 'multiple-choice',
        options: ['6', '7', '8', '9'],
        correctAnswer: '8',
        explanation: '5 + 3 = 8. This is basic addition.',
        difficulty: 1,
        tags: ['addition', 'basic-math']
      },
      {
        question: 'What is 10 - 4?',
        type: 'multiple-choice',
        options: ['4', '5', '6', '7'],
        correctAnswer: '6',
        explanation: '10 - 4 = 6. This is basic subtraction.',
        difficulty: 1,
        tags: ['subtraction', 'basic-math']
      }
    ],
    objectives: ['Understand basic addition', 'Understand basic subtraction'],
    estimatedDuration: 15,
    tags: ['basic-math', 'arithmetic']
  },
  {
    title: 'Introduction to Science',
    subject: 'science',
    description: 'Explore the scientific method and basic scientific concepts.',
    difficulty: 1,
    content: 'Science is a systematic approach to understanding the natural world through observation and experimentation.',
    questions: [
      {
        question: 'What is the first step of the scientific method?',
        type: 'multiple-choice',
        options: ['Make a hypothesis', 'Ask a question', 'Conduct an experiment', 'Draw conclusions'],
        correctAnswer: 'Ask a question',
        explanation: 'The scientific method starts with asking a question about something you observe.',
        difficulty: 1,
        tags: ['scientific-method', 'science-basics']
      }
    ],
    objectives: ['Understand the scientific method', 'Learn basic scientific concepts'],
    estimatedDuration: 20,
    tags: ['scientific-method', 'science-basics']
  },
  {
    title: 'Basic English Grammar',
    subject: 'english',
    description: 'Learn fundamental English grammar rules and sentence structure.',
    difficulty: 1,
    content: 'Grammar is the system of rules that govern how words are used in a language.',
    questions: [
      {
        question: 'Which of the following is a proper noun?',
        type: 'multiple-choice',
        options: ['city', 'London', 'country', 'river'],
        correctAnswer: 'London',
        explanation: 'London is a proper noun because it is the name of a specific city.',
        difficulty: 1,
        tags: ['grammar', 'nouns']
      }
    ],
    objectives: ['Understand proper nouns', 'Learn basic grammar rules'],
    estimatedDuration: 15,
    tags: ['grammar', 'nouns', 'english-basics']
  },
  {
    title: 'Introduction to Computer Science',
    subject: 'computer-science',
    description: 'Learn the basics of computer science and programming concepts.',
    difficulty: 2,
    content: 'Computer science is the study of computers and computational systems.',
    questions: [
      {
        question: 'What is an algorithm?',
        type: 'multiple-choice',
        options: ['A computer program', 'A step-by-step procedure', 'A programming language', 'A computer hardware'],
        correctAnswer: 'A step-by-step procedure',
        explanation: 'An algorithm is a step-by-step procedure for solving a problem.',
        difficulty: 2,
        tags: ['algorithms', 'programming-basics']
      }
    ],
    objectives: ['Understand what algorithms are', 'Learn basic programming concepts'],
    estimatedDuration: 25,
    tags: ['algorithms', 'programming-basics', 'computer-science']
  },
  {
    title: 'World Geography Basics',
    subject: 'geography',
    description: 'Learn about continents, countries, and basic geographical concepts.',
    difficulty: 1,
    content: 'Geography is the study of places and the relationships between people and their environments.',
    questions: [
      {
        question: 'How many continents are there?',
        type: 'multiple-choice',
        options: ['5', '6', '7', '8'],
        correctAnswer: '7',
        explanation: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
        difficulty: 1,
        tags: ['continents', 'geography-basics']
      }
    ],
    objectives: ['Learn about continents', 'Understand basic geography'],
    estimatedDuration: 20,
    tags: ['continents', 'geography-basics']
  },
  {
    title: 'Ancient History Introduction',
    subject: 'history',
    description: 'Explore ancient civilizations and their contributions to modern society.',
    difficulty: 2,
    content: 'History helps us understand how past events have shaped the world we live in today.',
    questions: [
      {
        question: 'Which ancient civilization built the pyramids?',
        type: 'multiple-choice',
        options: ['Romans', 'Greeks', 'Egyptians', 'Mesopotamians'],
        correctAnswer: 'Egyptians',
        explanation: 'The ancient Egyptians built the pyramids as tombs for their pharaohs.',
        difficulty: 2,
        tags: ['ancient-egypt', 'pyramids', 'ancient-civilizations']
      }
    ],
    objectives: ['Learn about ancient civilizations', 'Understand historical significance'],
    estimatedDuration: 30,
    tags: ['ancient-civilizations', 'egypt', 'pyramids']
  }
];

async function seedLessons() {
  try {
    // Clear existing lessons
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');

    // Insert sample lessons
    const insertedLessons = await Lesson.insertMany(sampleLessons);
    console.log(`Successfully inserted ${insertedLessons.length} sample lessons`);

    // Display the inserted lessons
    insertedLessons.forEach(lesson => {
      console.log(`- ${lesson.title} (${lesson.subject}, Level ${lesson.difficulty})`);
    });

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding lessons:', error);
    mongoose.connection.close();
  }
}

seedLessons();
