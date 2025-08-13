require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const LearningPlan = require('../models/LearningPlan'); // Added LearningPlan import

let fetch = global.fetch;
if (!fetch) {
  fetch = require('node-fetch'); // For Node < 18
}

// OpenRouter API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "qwen/qwen-2.5-coder-32b-instruct:free"; // Updated to use Qwen 2.5 Coder

/**
 * Sanitize JSON response from AI to handle invalid values
 */
function sanitizeJSONResponse(response) {
  return response
    .replace(/: NaN/g, ': null')
    .replace(/: undefined/g, ': null')
    .replace(/: Infinity/g, ': null')
    .replace(/: -Infinity/g, ': null')
    .replace(/"duration":\s*NaN/g, '"duration": null')
    .replace(/"estimatedDuration":\s*NaN/g, '"estimatedDuration": null')
    .replace(/"difficulty":\s*NaN/g, '"difficulty": null')
    .replace(/"order":\s*NaN/g, '"order": null');
}

/**
 * Process lesson data to fix common AI response issues
 */
function processLessonData(lessonData) {
  // Process modules to fix interactiveElements and duration
  if (lessonData.modules && Array.isArray(lessonData.modules)) {
    lessonData.modules.forEach(module => {
      // Fix duration - ensure it's always a number
      if (module.duration) {
        if (typeof module.duration === 'string') {
          // Extract numeric value from strings like "30 minutes" or "30"
          const numericValue = parseInt(module.duration.replace(/\D/g, ''), 10);
          module.duration = isNaN(numericValue) ? 10 : numericValue; // Default to 10 if parsing fails
        } else if (typeof module.duration === 'number') {
          module.duration = isNaN(module.duration) ? 10 : module.duration;
        } else {
          module.duration = 10; // Default value
        }
      } else {
        module.duration = 10; // Default value if missing
      }

      // Fix interactiveElements - should be array of strings
      if (module.interactiveElements) {
        // If interactiveElements is a string, try to parse it
        if (typeof module.interactiveElements === 'string') {
          try {
            // Remove any JavaScript array syntax and parse as JSON
            let cleaned = module.interactiveElements
              .replace(/\[\s*\n\s*'?\s*\+\s*'?\s*\n\s*/g, '[')
              .replace(/\s*'?\s*\+\s*'?\s*\n\s*\]/g, ']')
              .replace(/'/g, '"')
              .replace(/(\w+):/g, '"$1":')
              .replace(/\n\s*/g, ' ')
              .replace(/\s+/g, ' ');
            
            // Try to parse as JSON
            module.interactiveElements = JSON.parse(cleaned);
          } catch (parseError) {
            console.warn('Failed to parse interactiveElements, creating default quiz:', parseError.message);
            // Create a default interactive element as string
            module.interactiveElements = [`Quiz: Test your understanding of ${module.title || 'this module'}`];
          }
        }
        
        // Ensure interactiveElements is an array
        if (!Array.isArray(module.interactiveElements)) {
          module.interactiveElements = [`Quiz: Test your understanding of ${module.title || 'this module'}`];
        }
        
        // Convert any objects to strings and ensure all elements are strings
        module.interactiveElements = module.interactiveElements.map(element => {
          if (typeof element === 'string') {
            return element;
          } else if (typeof element === 'object' && element !== null) {
            // Convert object to string format
            if (element.title && element.description) {
              return `${element.title}: ${element.description}`;
            } else if (element.title) {
              return element.title;
            } else if (element.description) {
              return element.description;
            } else {
              return 'Quiz: Test your understanding';
            }
          } else {
            return 'Quiz: Test your understanding';
          }
        });
      } else {
        // Create default interactive element if none exists
        module.interactiveElements = [`Quiz: Test your understanding of ${module.title || 'this module'}`];
      }
    });
  }
  
  // Fix estimatedDuration if it exists
  if (lessonData.estimatedDuration) {
    if (typeof lessonData.estimatedDuration === 'string') {
      const numericValue = parseInt(lessonData.estimatedDuration.replace(/\D/g, ''), 10);
      lessonData.estimatedDuration = isNaN(numericValue) ? 30 : numericValue;
    } else if (typeof lessonData.estimatedDuration === 'number') {
      lessonData.estimatedDuration = isNaN(lessonData.estimatedDuration) ? 30 : lessonData.estimatedDuration;
    } else {
      lessonData.estimatedDuration = 30;
    }
  }
  
  return lessonData;
}

/**
 * Helper function: Call Qwen via OpenRouter with enhanced error handling
 */
async function callQwenAPI(messages, temperature = 0.7, retries = 2) {
  const apiKey = OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 Calling OpenRouter API (attempt ${attempt + 1}/${retries + 1})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Learning Platform"
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          temperature: temperature,
          max_tokens: 4000, // Increased for better responses
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error ${response.status}:`, errorText);

        
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`OpenRouter API client error ${response.status}: ${errorText}`);
        }
        
        // Retry on server errors (5xx) if we have attempts left
        if (attempt < retries) {
          console.log(`Server error, retrying in ${(attempt + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        
        throw new Error(`OpenRouter API server error ${response.status}: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
        console.log("✅ OpenRouter API response received successfully");
      } catch (jsonError) {
        // If JSON parsing fails, it might be an HTML error page
        const responseText = await response.text();
        console.error('Response was not valid JSON:', responseText.substring(0, 200));
        throw new Error(`OpenRouter API returned invalid JSON (status ${response.status}). This might be an HTML error page. Check your API key and endpoint URL.`);
      }

      const outputText = data.choices?.[0]?.message?.content;
      if (!outputText) {
        throw new Error('Invalid response format from OpenRouter API - no content in response');
      }

      return outputText;

    } catch (error) {
      console.error(`OpenRouter API Error (attempt ${attempt + 1}):`, error.message);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.log(`Request timeout, retrying in ${(attempt + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw new Error('OpenRouter API timeout - service is taking too long to respond. Please try again.');
      }
      
      // Handle network errors
      if (error.message.includes('fetch')) {
        if (attempt < retries) {
          console.log(`Network error, retrying in ${(attempt + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw new Error('Network error connecting to OpenRouter API. Please check your internet connection.');
      }
      
      // Don't retry on other errors
      throw error;
    }
  }
}

/**
 * Demo lesson generator (when API key missing)
 */
async function createDemoLesson(topic, subject, difficulty, duration) {
  const demoLesson = new Lesson({
    title: `Demo Lesson: ${topic || subject}`,
    subject: subject || 'general',
    description: `This is a placeholder lesson for ${topic || subject}`,
    difficulty: difficulty || 5,
    content: `This is sample content for ${topic || subject}. Configure OPENROUTER_API_KEY for real AI content.`,
    summary: `Demo summary for ${topic || subject}`,
    exercises: ["Exercise 1", "Exercise 2", "Exercise 3"],
    resources: ["Resource 1", "Resource 2"],
    questions: [
      {
        question: `What is the main topic of ${subject || 'this lesson'}?`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "Demo explanation",
        difficulty: difficulty || 5,
        tags: [topic || subject || 'demo']
      }
    ],
    estimatedDuration: duration || 15,
    isAIGenerated: false
  });
  await demoLesson.save();
  return demoLesson;
}

/**
 * Demo lesson generator with modules (when API key missing)
 */
async function createDemoLessonWithModules(topic, subject, difficulty, duration, moduleCount, questionsPerModule) {
  const modules = [];
  const questions = [];
  
  // Generate demo modules
  for (let i = 0; i < moduleCount; i++) {
    modules.push({
      title: `Module ${i + 1}: ${topic || subject} Basics`,
      content: `This is demo content for module ${i + 1} covering ${topic || subject}. Configure OPENROUTER_API_KEY for real AI content.`,
      type: 'content',
      duration: Math.ceil(duration / moduleCount),
      order: i + 1,
      learningObjectives: [
        `Understand ${topic || subject} concept ${i + 1}`,
        `Apply ${topic || subject} principles`
      ],
      resources: [`Resource ${i + 1}`, `Reference ${i + 1}`],
      interactiveElements: [
        {
          type: 'quiz',
          title: `Module ${i + 1} Quiz`,
          description: `Test your understanding of module ${i + 1}`
        }
      ],
      isCompleted: false,
      progress: 0
    });
    
    // Generate demo questions for this module
    for (let j = 0; j < questionsPerModule; j++) {
      questions.push({
        question: `Demo question ${j + 1} for Module ${i + 1}: What is a key concept in ${topic || subject}?`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: `Demo explanation for question ${j + 1} in module ${i + 1}`,
        difficulty: difficulty || 5,
        tags: [`module-${i + 1}`, topic || subject || 'demo'],
        moduleIndex: i
      });
    }
  }

  const demoLesson = new Lesson({
    title: `Demo Modular Lesson: ${topic || subject}`,
    subject: subject || 'general',
    description: `This is a demo modular lesson for ${topic || subject} with ${moduleCount} modules`,
    difficulty: difficulty || 5,
    content: `This is a comprehensive demo lesson covering ${topic || subject} in ${moduleCount} modules. Configure OPENROUTER_API_KEY for real AI content.`,
    summary: `Demo modular lesson covering ${topic || subject} with ${moduleCount} learning modules and ${questions.length} practice questions.`,
    exercises: ["Exercise 1", "Exercise 2", "Exercise 3"],
    resources: ["Resource 1", "Resource 2"],
    modules: modules,
    questions: questions,
    estimatedDuration: duration || 60,
    isAIGenerated: false,
    aiEnhancements: {
      personalizedHints: false,
      dynamicDifficulty: false,
      contextualExplanations: false,
      moduleBasedLearning: true
    }
  });
  
  await demoLesson.save();
  return demoLesson;
}

/**
 * @route POST api/ai/generate-lesson
 * @desc Generate personalized lesson with modules and multiple quizzes using OpenRouter Qwen
 */
router.post('/generate-lesson', auth, async (req, res) => {
  const { topic, subject, difficulty, learningStyle, duration, numModules, numQuestions } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    // Set defaults
    const moduleCount = numModules || 3;
    const questionsPerModule = numQuestions || 5;
    const totalQuestions = moduleCount * questionsPerModule;

    if (!OPENROUTER_API_KEY) {
      const demoLesson = await createDemoLessonWithModules(topic, subject, difficulty, duration, moduleCount, questionsPerModule);
      return res.json({
        success: true,
        lesson: demoLesson,
        message: 'Demo lesson with modules created (AI not configured)'
      });
    }

    // Extract numeric difficulty from label
    const difficultyNum = typeof difficulty === "string" && difficulty.toLowerCase().startsWith("level")
      ? parseInt(difficulty.replace(/[^0-9]/g, ""), 10) || 1
      : difficulty;

    const prompt = `
You are an expert educational content creator. Generate a comprehensive modular lesson for the following student:

Student Details:
- Type: ${student.studentType}
- Age: ${student.age}
- Current Level: ${student.currentLevel || "Not specified"}
- Learning Style: ${JSON.stringify(learningStyle || student.learningStyle || "Not specified")}
- Preferred Subjects: ${student.preferredSubjects?.join(", ") || "Not specified"}

${
  student.studentType === "school"
    ? `Additional School Details:
- Class/Standard: ${student.standard || "Not specified"}
- Syllabus Type: ${student.syllabusType || "Not specified"}
- Medium of Study: ${student.medium || "Not specified"}
- NEET/JEE Preparation: ${student.prepareFor || "No"}`
    : `Additional College Details:
- Degree: ${student.degree || "Not specified"}
- Branch: ${student.branch || "Not specified"}
- Topics of Interest: ${student.interestTopics?.join(", ") || "Not specified"}`
}

Lesson Requirements:
- Subject: ${subject}
- Topic: ${topic || "Any beginner-friendly topic based on subject"}
- Difficulty Level: ${difficultyNum}/10
- Duration: ${duration} minutes
- Number of Modules: ${moduleCount}
- Questions per Module: ${questionsPerModule}
- Total Questions: ${totalQuestions}

Create a structured lesson with ${moduleCount} modules, each containing ${questionsPerModule} quiz questions.

Return the lesson in valid JSON format exactly as follows:
{
  "title": "Comprehensive lesson title",
  "content": "Brief overview of the entire lesson",
  "summary": "A concise 3-4 sentence summary of the lesson",
  "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"],
  "resources": ["Relevant resource link or name"],
  "modules": [
    ${Array.from({ length: moduleCount }).map((_, i) => `{
      "title": "Module ${i + 1} Title",
      "content": "Detailed content for module ${i + 1}",
      "type": "content",
      "duration": ${Math.ceil(duration / moduleCount)},
      "order": ${i + 1},
      "learningObjectives": ["Objective 1", "Objective 2"],
      "resources": ["Resource 1", "Resource 2"],
      "interactiveElements": ["Quiz: Test your understanding of module ${i + 1}"]
    }`).join(',\n    ')}
  ],
  "questions": [
    ${Array.from({ length: totalQuestions }).map((_, i) => {
      const moduleNum = Math.floor(i / questionsPerModule) + 1;
      return `{
        "question": "Question ${i + 1} for Module ${moduleNum}",
        "type": "multiple-choice",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Detailed explanation for question ${i + 1}",
        "difficulty": ${difficultyNum},
        "tags": ["module-${moduleNum}", "${topic || subject}"],
        "moduleIndex": ${moduleNum - 1}
      }`;
    }).join(',\n    ')}
  ],
  "estimatedDuration": ${duration},
  "difficulty": ${difficultyNum}
}

IMPORTANT:
- Create exactly ${moduleCount} modules with meaningful, progressive content
- Generate exactly ${totalQuestions} questions (${questionsPerModule} per module)
- Each module should build upon the previous one
- Questions should be distributed evenly across modules
- All content should match the subject, topic, and difficulty level
- Each question must have exactly 4 options with one correct answer
- CRITICAL: All duration fields MUST be integers (no "minutes" text)
- CRITICAL: interactiveElements must be arrays of strings, NOT objects
- CRITICAL: Do NOT include null values anywhere in the JSON
- CRITICAL: Output MUST be valid JSON only
`;

    const messages = [
      { 
        role: "system", 
        content: `You are an expert educational content creator specializing in modular learning design. 

CRITICAL FORMAT REQUIREMENTS:
- Output MUST be valid JSON only
- All duration fields MUST be integers (no "minutes" text)
- interactiveElements MUST be arrays of strings, NOT objects
- Do NOT include null values anywhere
- Follow the exact schema provided in the user prompt`
      },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callQwenAPI(messages, 0.7);

    let lessonData;
    try {
      // Clean the JSON response to handle invalid values
      const cleanedResponse = sanitizeJSONResponse(aiResponse);
      lessonData = JSON.parse(cleanedResponse);
      
      // Process the lesson data to fix common AI response issues
      lessonData = processLessonData(lessonData);
    } catch (err) {
      console.error('JSON Parse Error:', err);
      console.error('AI Response:', aiResponse);
      throw new Error(`Invalid JSON from Qwen: ${err.message}`);
    }

    if (!lessonData.title || !lessonData.modules || !Array.isArray(lessonData.modules)) {
      throw new Error('Lesson missing required fields from AI (title, modules)');
    }

    // Validate modules structure
    if (lessonData.modules.length !== moduleCount) {
      console.warn(`Expected ${moduleCount} modules, got ${lessonData.modules.length}`);
    }

    // Validate questions structure
    if (!lessonData.questions || lessonData.questions.length !== totalQuestions) {
      console.warn(`Expected ${totalQuestions} questions, got ${lessonData.questions?.length || 0}`);
    }

    // Additional validation for modules
    lessonData.modules.forEach((module, index) => {
      // Ensure all required fields exist
      if (!module.title) module.title = `Module ${index + 1}`;
      if (!module.content) module.content = `Content for module ${index + 1}`;
      if (!module.type) module.type = 'content';
      if (!module.order) module.order = index + 1;
      if (!module.learningObjectives) module.learningObjectives = [];
      if (!module.resources) module.resources = [];
      if (!module.interactiveElements) module.interactiveElements = [];
      
      // Ensure duration is a valid number
      if (!module.duration || isNaN(module.duration)) {
        module.duration = Math.ceil(duration / moduleCount);
      }
      
      // Ensure order is a valid number
      if (!module.order || isNaN(module.order)) {
        module.order = index + 1;
      }
      
      // Ensure interactiveElements is properly formatted
      if (!Array.isArray(module.interactiveElements)) {
        module.interactiveElements = [];
      }
    });

    const lesson = new Lesson({
      title: lessonData.title,
      subject: subject.toLowerCase(),
      description: `AI-generated modular lesson on ${topic} with ${moduleCount} modules`,
      difficulty: difficultyNum,
      content: lessonData.content || `Comprehensive ${moduleCount}-module lesson on ${topic}`,
      summary: lessonData.summary || '',
      exercises: lessonData.exercises || [],
      resources: lessonData.resources || [],
      modules: lessonData.modules || [],
      questions: lessonData.questions || [],
      estimatedDuration: lessonData.estimatedDuration || duration,
      isAIGenerated: true,
      aiEnhancements: {
        personalizedHints: true,
        dynamicDifficulty: true,
        contextualExplanations: true,
        moduleBasedLearning: true
      }
    });

    await lesson.save();
    
    res.json({ 
      success: true, 
      lesson, 
      message: `AI lesson with ${moduleCount} modules and ${totalQuestions} questions generated successfully!`,
      stats: {
        modules: lessonData.modules?.length || 0,
        questions: lessonData.questions?.length || 0,
        estimatedDuration: duration
      }
    });

  } catch (error) {
    console.error('Lesson Generation Error:', error);
    res.status(500).json({ 
      msg: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

// @route   POST api/ai/generate-learning-plan
// @desc    Generate personalized learning plan using AI
// @access  Private
router.post('/generate-learning-plan', auth, async (req, res) => {
  const { 
    planType, 
    subjects, 
    duration, 
    startDate, 
    learningGoals, 
    preferredSchedule,
    difficultyLevel 
  } = req.body;

  // Check if Qwen API is configured
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_qwen_api_key_here') {
    // Create a demo learning plan instead of returning 503
    const demoPlan = new LearningPlan({
      student: req.student.id,
      planType: planType || 'custom',
      title: `Demo Learning Plan: ${subjects?.join(', ') || 'General Studies'}`,
      description: `A demo learning plan created when AI features are not available. This plan covers ${subjects?.join(', ') || 'general topics'} over ${duration || 30} days.`,
      startDate: startDate || new Date(),
      endDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000),
      curriculum: {
        subjects: subjects?.map(subject => ({
          name: subject,
          description: `Comprehensive study of ${subject}`,
          weightage: 1,
          units: [
            {
              title: `Introduction to ${subject}`,
              description: `Basic concepts and fundamentals`,
              topics: [
                {
                  name: `Getting Started with ${subject}`,
                  description: `Overview and basic principles`,
                  difficulty: difficultyLevel || 3,
                  estimatedHours: 2,
                  prerequisites: [],
                  learningObjectives: [`Understand basic ${subject} concepts`, `Learn fundamental principles`],
                  resources: [
                    {
                      type: 'video',
                      title: `Introduction to ${subject}`,
                      url: '#',
                      duration: 30
                    },
                    {
                      type: 'article',
                      title: `${subject} Fundamentals`,
                      url: '#',
                      duration: 15
                    }
                  ]
                }
              ],
              estimatedDuration: 2,
              order: 1
            }
          ],
          totalHours: 2
        })) || [
          {
            name: 'General Studies',
            description: 'Comprehensive learning program',
            weightage: 1,
            units: [
              {
                title: 'Getting Started',
                description: 'Introduction to learning',
                topics: [
                  {
                    name: 'Learning Fundamentals',
                    description: 'Basic learning principles',
                    difficulty: 3,
                    estimatedHours: 2,
                    prerequisites: [],
                    learningObjectives: ['Understand learning basics', 'Develop study habits'],
                    resources: [
                      {
                        type: 'video',
                        title: 'Learning Fundamentals',
                        url: '#',
                        duration: 30
                      }
                    ]
                  }
                ],
                estimatedDuration: 2,
                order: 1
              }
            ],
            totalHours: 2
          }
        ],
        totalDuration: 2
      },
      schedule: {
        weeklyPlan: [
          {
            day: 'Monday',
            sessions: [
              {
                subject: subjects?.[0] || 'General Studies',
                unit: 'Getting Started',
                topics: ['Learning Fundamentals'],
                duration: 60,
                startTime: '09:00',
                endTime: '10:00',
                type: 'learning'
              }
            ]
          }
        ],
        dailyStudyHours: 1,
        weeklyStudyDays: 5,
        breakDays: ['Saturday', 'Sunday']
      },
      progress: {
        completedUnits: [],
        completedTopics: [],
        currentUnit: {
          subject: subjects?.[0] || 'General Studies',
          unit: 'Getting Started',
          progress: 0
        },
        overallProgress: 0
      },
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3
      },
      gamification: {
        milestones: [
          {
            title: 'First Steps',
            description: 'Complete your first learning session',
            targetProgress: 10,
            reward: { type: 'points', value: 100 },
            achieved: false
          }
        ],
        challenges: [
          {
            title: 'Week Warrior',
            description: 'Complete 5 days of study in a week',
            type: 'streak',
            target: 5,
            reward: { type: 'points', value: 200 },
            completed: false
          }
        ]
      },
      aiEnhancements: {
        personalizedRecommendations: false,
        dynamicScheduling: false,
        performanceAnalysis: false,
        adaptiveContent: false
      },
      status: 'active'
    });

    await demoPlan.save();

    res.json({
      success: true,
      learningPlan: demoPlan,
      message: 'Demo learning plan created successfully! (AI features not configured)'
    });
    return;
  }

  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Create prompt for learning plan generation
    const prompt = `Generate a comprehensive personalized learning plan for a student:

Student Profile:
- Age: ${student.age}
- Learning Style: ${JSON.stringify(student.learningStyle)}
- Current Level: ${student.currentLevel}
- Preferred Subjects: ${student.preferredSubjects.join(', ')}

Plan Requirements:
- Plan Type: ${planType}
- Subjects: ${subjects?.join(', ')}
- Duration: ${duration} days
- Start Date: ${startDate}
- Learning Goals: ${learningGoals}
- Preferred Schedule: ${JSON.stringify(preferredSchedule)}
- Difficulty Level: ${difficultyLevel}/10

Generate a detailed learning plan that includes:
1. A compelling title and description
2. Structured curriculum with subjects, units, and topics
3. Realistic timeline and scheduling
4. Appropriate difficulty progression
5. Learning objectives and resources
6. Gamification elements (milestones and challenges)
7. Adaptive settings for personalized learning

Format the response as JSON:
{
  "title": "plan title",
  "description": "detailed plan description",
  "curriculum": {
    "subjects": [
      {
        "name": "subject name",
        "description": "subject description",
        "weightage": 1,
        "units": [
          {
            "title": "unit title",
            "description": "unit description",
            "topics": [
              {
                "name": "topic name",
                "description": "topic description",
                "difficulty": 1-10,
                "estimatedHours": 2,
                "prerequisites": ["prereq1", "prereq2"],
                "learningObjectives": ["objective1", "objective2"],
                "resources": [
                  {
                    "type": "video|article|practice|quiz",
                    "title": "resource title",
                    "url": "resource url",
                    "duration": 30
                  }
                ]
              }
            ],
            "estimatedDuration": 2,
            "order": 1
          }
        ],
        "totalHours": 10
      }
    ],
    "totalDuration": 50
  },
  "schedule": {
    "weeklyPlan": [
      {
        "day": "Monday",
        "sessions": [
          {
            "subject": "subject name",
            "unit": "unit title",
            "topics": ["topic1", "topic2"],
            "duration": 60,
            "startTime": "09:00",
            "endTime": "10:00",
            "type": "learning|practice|assessment|revision"
          }
        ]
      }
    ],
    "dailyStudyHours": 2,
    "weeklyStudyDays": 5,
    "breakDays": ["Saturday", "Sunday"]
  },
  "gamification": {
    "milestones": [
      {
        "title": "milestone title",
        "description": "milestone description",
        "targetProgress": 25,
        "reward": {"type": "points", "value": 100}
      }
    ],
    "challenges": [
      {
        "title": "challenge title",
        "description": "challenge description",
        "type": "streak|score|completion",
        "target": 5,
        "reward": {"type": "points", "value": 200}
      }
    ]
  }
}`;

    const messages = [
      {
        role: "system",
        content: "You are an expert educational planner and curriculum designer. Generate comprehensive, personalized learning plans that adapt to student needs, learning styles, and goals. Always respond with valid JSON format."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const aiResponse = await callQwenAPI(messages, 0.7);
    
    // Try to parse the response, handle JSON parsing errors
    let planData;
    try {
      // Clean the JSON response to handle invalid values
      const cleanedResponse = sanitizeJSONResponse(aiResponse);
      planData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('AI Response:', aiResponse);
      throw new Error('Invalid JSON response from AI service');
    }

    // Validate required fields
    if (!planData.title || !planData.curriculum || !planData.curriculum.subjects) {
      throw new Error('AI response missing required fields');
    }

    // Calculate end date based on duration
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj.getTime() + (duration * 24 * 60 * 60 * 1000));

    // Create the learning plan
    const learningPlan = new LearningPlan({
      student: req.student.id,
      planType: planType || 'custom',
      title: planData.title,
      description: planData.description,
      startDate: startDateObj,
      endDate: endDateObj,
      curriculum: planData.curriculum,
      schedule: planData.schedule || {
        weeklyPlan: [],
        dailyStudyHours: 2,
        weeklyStudyDays: 5,
        breakDays: ['Saturday', 'Sunday']
      },
      progress: {
        completedUnits: [],
        completedTopics: [],
        currentUnit: {
          subject: planData.curriculum.subjects[0]?.name || 'General',
          unit: planData.curriculum.subjects[0]?.units[0]?.title || 'Getting Started',
          progress: 0
        },
        overallProgress: 0
      },
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3
      },
      gamification: planData.gamification || {
        milestones: [
          {
            title: 'First Steps',
            description: 'Complete your first learning session',
            targetProgress: 10,
            reward: { type: 'points', value: 100 },
            achieved: false
          }
        ],
        challenges: [
          {
            title: 'Week Warrior',
            description: 'Complete 5 days of study in a week',
            type: 'streak',
            target: 5,
            reward: { type: 'points', value: 200 },
            completed: false
          }
        ]
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true
      },
      status: 'active'
    });

    await learningPlan.save();

    // Log AI interaction
    student.aiInteractions.push({
      type: 'learning_plan_generation',
      context: `Generated learning plan: ${planData.title}`,
      timestamp: new Date()
    });
    await student.save();

    res.json({
      success: true,
      learningPlan,
      message: 'AI-generated learning plan created successfully!'
    });

  } catch (err) {
    console.error('Learning Plan Generation Error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate learning plan. Please try again.';
    if (err.message.includes('timeout')) {
      errorMessage = 'AI service is taking too long to respond. Please try again.';
    } else if (err.message.includes('JSON')) {
      errorMessage = 'Error processing AI response. Please try again.';
    } else if (err.message.includes('API key')) {
      errorMessage = 'AI service configuration error. Please contact support.';
    } else if (err.message.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/generate-subjects
// @desc    Generate personalized subject recommendations based on student preferences
// @access  Private
router.post('/generate-subjects', auth, async (req, res) => {
  const { interests, currentLevel, learningGoals } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        recommendedSubjects: [
          { subject: 'math', reason: 'Based on your analytical interests', difficulty: 3 },
          { subject: 'science', reason: 'Matches your curiosity about the world', difficulty: 2 },
          { subject: 'english', reason: 'Will help with communication skills', difficulty: 2 },
          { subject: 'computer-science', reason: 'Great for logical thinking', difficulty: 4 }
        ],
        personalizedMessage: 'These subjects are recommended based on your learning profile.'
      });
    }

    const prompt = `Generate personalized subject recommendations for this student:

Student Information:
- Current Level: ${currentLevel || student.currentLevel}
- Learning Style: ${JSON.stringify(student.learningStyle)}
- Current Preferred Subjects: ${student.preferredSubjects.join(', ')}
- Interests: ${interests || 'Not specified'}
- Learning Goals: ${learningGoals || 'General improvement'}

Generate 4-6 subject recommendations that:
1. Match the student's interests and learning style
2. Are appropriate for their current level
3. Include reasoning for each recommendation
4. Suggest appropriate difficulty levels

Format as valid JSON:
{
  "recommendedSubjects": [
    {
      "subject": "subject-name",
      "reason": "personalized reason",
      "difficulty": 1-10,
      "estimatedDuration": "time estimate"
    }
  ],
  "personalizedMessage": "overall recommendation message"
}`;

    const messages = [
      { role: "system", content: "You are an expert educational advisor. Provide personalized subject recommendations based on student profiles and learning preferences. Respond in valid JSON only." },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callQwenAPI(messages, 0.7);
    
    // Clean the JSON response to handle invalid values
    const cleanedResponse = sanitizeJSONResponse(aiResponse);
    const subjectData = JSON.parse(cleanedResponse);

    // Log AI interaction
    student.aiInteractions.push({
      type: 'subject_recommendation',
      context: `Generated subject recommendations based on interests: ${interests}`,
      timestamp: new Date()
    });
    await student.save();

    res.json(subjectData);

  } catch (error) {
    console.error('Subject Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating subject recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/generate-all-subjects
// @desc    Generate comprehensive subject information for all available subjects
// @access  Private
router.post('/generate-all-subjects', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        allSubjects: [
          { subject: 'math', description: 'Mathematics and problem solving', difficulty: 3, topics: ['Algebra', 'Geometry', 'Calculus'] },
          { subject: 'science', description: 'Scientific exploration and discovery', difficulty: 2, topics: ['Physics', 'Chemistry', 'Biology'] },
          { subject: 'english', description: 'Language arts and communication', difficulty: 2, topics: ['Grammar', 'Literature', 'Writing'] },
          { subject: 'history', description: 'Historical events and analysis', difficulty: 3, topics: ['World History', 'Ancient Civilizations', 'Modern Era'] },
          { subject: 'geography', description: 'World geography and cultures', difficulty: 2, topics: ['Physical Geography', 'Human Geography', 'Cultural Studies'] },
          { subject: 'computer-science', description: 'Programming and technology', difficulty: 4, topics: ['Algorithms', 'Web Development', 'Data Structures'] }
        ]
      });
    }

    const prompt = `Generate comprehensive subject information for all available subjects:

Student Profile:
- Current Level: ${student.currentLevel}
- Learning Style: ${JSON.stringify(student.learningStyle)}
- Preferred Subjects: ${student.preferredSubjects.join(', ')}

Available Subjects: math, science, english, history, geography, computer-science

For each subject, provide:
1. A compelling description
2. Appropriate difficulty level for this student
3. Key topics covered
4. Why this subject might interest them

Format as valid JSON:
{
  "allSubjects": [
    {
      "subject": "subject-name",
      "description": "engaging description",
      "difficulty": 1-10,
      "topics": ["topic1", "topic2", "topic3"],
      "whyInteresting": "personalized reason"
    }
  ]
}`;

    const messages = [
      { role: "system", content: "You are an expert educational content curator. Provide engaging descriptions of subjects tailored to individual student profiles. Respond in valid JSON only." },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callQwenAPI(messages, 0.7);
    
    // Clean the JSON response to handle invalid values
    const cleanedResponse = sanitizeJSONResponse(aiResponse);
    const subjectsData = JSON.parse(cleanedResponse);

    // Log AI interaction
    student.aiInteractions.push({
      type: 'all_subjects_generation',
      context: 'Generated comprehensive subject information',
      timestamp: new Date()
    });
    await student.save();

    res.json(subjectsData);

  } catch (error) {
    console.error('All Subjects Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating all subjects information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/generate-micro-quiz
// @desc    Generate personalized micro-quiz based on student mistakes
// @access  Private
router.post('/generate-micro-quiz', auth, async (req, res) => {
  const { mistake, topic, difficulty, studentAnswer } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        lesson: {
          title: `Micro-Quiz: ${topic}`,
          subject: topic.toLowerCase(),
          description: `Personalized practice based on your mistake: ${mistake}`,
          difficulty: difficulty,
          content: `This micro-quiz was generated to help you understand the concept you struggled with: ${mistake}`,
          questions: [
            {
              question: "What is the capital of France?",
              type: "multiple-choice",
              options: ["London", "Berlin", "Paris", "Madrid"],
              correctAnswer: "Paris",
              explanation: "Paris is the capital and largest city of France.",
              hints: ["Think of the Eiffel Tower", "It's known as the City of Light"],
              difficulty: difficulty || 5,
              tags: [topic || "geography"]
            }
          ],
          isAIGenerated: false
        },
        message: 'Demo micro-quiz created (AI not configured)'
      });
    }

    const prompt = `Generate a personalized micro-quiz question based on this student's mistake:

Original Topic: ${topic}
Student's Mistake: ${mistake}
Student's Answer: ${studentAnswer}
Target Difficulty: ${difficulty}/10

Generate a question that:
1. Addresses the specific misconception shown in the mistake
2. Is at difficulty level ${difficulty}
3. Provides a clear explanation
4. Includes 2-3 hints of increasing specificity

Format as valid JSON:
{
  "question": "question text",
  "type": "multiple-choice",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct option",
  "explanation": "detailed explanation",
  "hints": ["hint1", "hint2", "hint3"],
  "difficulty": ${difficulty},
  "tags": ["topic1", "topic2"]
}`;

    const messages = [
      { role: "system", content: "You are an expert educational AI tutor. Generate personalized learning content that addresses specific student misconceptions. Respond in valid JSON only." },
      { role: "user", content: prompt }
    ];

    const aiResponse = await callQwenAPI(messages, 0.7);
    
    // Clean the JSON response to handle invalid values
    const cleanedResponse = sanitizeJSONResponse(aiResponse);
    const microQuiz = JSON.parse(cleanedResponse);

    // Create a temporary lesson with the micro-quiz
    const tempLesson = new Lesson({
      title: `Micro-Quiz: ${topic}`,
      subject: topic.toLowerCase(),
      description: `Personalized practice based on your mistake: ${mistake}`,
      difficulty: difficulty,
      content: `This micro-quiz was generated to help you understand the concept you struggled with: ${mistake}`,
      questions: [microQuiz],
      isAIGenerated: true,
      aiEnhancements: {
        personalizedHints: true,
        dynamicDifficulty: true,
        contextualExplanations: true
      }
    });

    await tempLesson.save();

    // Log AI interaction
    student.aiInteractions.push({
      type: 'micro_quiz',
      context: `Generated micro-quiz for mistake: ${mistake}`,
      timestamp: new Date()
    });
    await student.save();

    res.json({
      success: true,
      lesson: tempLesson,
      message: 'Personalized micro-quiz generated based on your mistake!'
    });

  } catch (error) {
    console.error('Micro-Quiz Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating micro-quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/get-personalized-explanation
// @desc    Get personalized explanation for a question
// @access  Private
router.post('/get-personalized-explanation', auth, async (req, res) => {
  const { question, studentAnswer, isCorrect, topic } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        explanation: "Great job! You answered correctly. This shows you understand the concept well. Keep practicing to reinforce your knowledge."
      });
    }

    const prompt = `Provide a personalized explanation for this student:

Question: ${question}
Student's Answer: ${studentAnswer}
Correct: ${isCorrect}
Topic: ${topic}
Student's Learning Style: ${JSON.stringify(student.learningStyle)}
Student's Current Level: ${student.currentLevel}

Generate an explanation that:
1. ${isCorrect ? 'Reinforces the correct thinking' : 'Addresses the misconception'}
2. Uses language appropriate for level ${student.currentLevel}
3. Incorporates the student's learning style preferences
4. Provides actionable next steps

Keep it concise but helpful.`;

    const messages = [
      { role: "system", content: "You are a supportive and encouraging AI tutor. Provide explanations that build confidence and understanding." },
      { role: "user", content: prompt }
    ];

    const explanation = await callQwenAPI(messages, 0.7);

    // Log AI interaction
    student.aiInteractions.push({
      type: 'explanation',
      context: `Explanation for ${topic} question`,
      timestamp: new Date()
    });
    await student.save();

    res.json({ 
      success: true,
      explanation 
    });

  } catch (error) {
    console.error('Explanation Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating explanation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/adjust-difficulty
// @desc    AI-powered difficulty adjustment based on performance
// @access  Private
router.post('/adjust-difficulty', auth, async (req, res) => {
  const { currentDifficulty, performance, timeSpent, mistakes } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        newDifficulty: Math.max(currentDifficulty - 1, 1),
        adjustmentReason: 'Demo mode: Difficulty adjusted based on performance.',
        performanceAnalysis: {
          averageScore: performance,
          recentTrend: 'stable'
        }
      });
    }

    // Analyze recent performance
    const recentPerformance = student.performanceHistory.slice(-5);
    const avgScore = recentPerformance.length > 0 
      ? recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length 
      : performance;

    // AI-based difficulty adjustment logic
    let newDifficulty = currentDifficulty;
    let adjustmentReason = '';

    if (avgScore >= 0.9 && timeSpent < 30) {
      // High performance, fast completion - increase difficulty
      newDifficulty = Math.min(currentDifficulty + 1, 10);
      adjustmentReason = 'Excellent performance! Increasing difficulty to challenge you.';
    } else if (avgScore <= 0.6 || mistakes.length > 2) {
      // Low performance or many mistakes - decrease difficulty
      newDifficulty = Math.max(currentDifficulty - 1, 1);
      adjustmentReason = 'Let\'s practice this concept more. I\'ve adjusted the difficulty to help you build confidence.';
    } else if (avgScore >= 0.7 && avgScore < 0.9) {
      // Good performance - maintain difficulty
      adjustmentReason = 'Great work! This difficulty level seems perfect for you.';
    }

    // Update student's difficulty preference
    student.difficultyPreference = newDifficulty;
    await student.save();

    // Log AI interaction
    student.aiInteractions.push({
      type: 'difficulty_adjustment',
      context: `Difficulty adjusted from ${currentDifficulty} to ${newDifficulty}`,
      timestamp: new Date()
    });
    await student.save();

    res.json({
      success: true,
      newDifficulty,
      adjustmentReason,
      performanceAnalysis: {
        averageScore: avgScore,
        recentTrend: recentPerformance.length > 1 ? 'improving' : 'stable'
      }
    });

  } catch (error) {
    console.error('Difficulty Adjustment Error:', error);
    res.status(500).json({ 
      msg: 'Error adjusting difficulty',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST api/ai/get-encouragement
// @desc    Get personalized encouragement based on performance
// @access  Private
router.post('/get-encouragement', auth, async (req, res) => {
  const { performance, streak, topic } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        encouragement: "Great work! You're making excellent progress. Keep up the fantastic effort and you'll continue to improve!"
      });
    }

    const prompt = `Provide personalized encouragement for this student:

Student Name: ${student.name}
Current Performance: ${performance * 100}%
Current Streak: ${streak} days
Topic: ${topic}
Total Points: ${student.totalPoints}
Learning Style: ${JSON.stringify(student.learningStyle)}

Generate encouraging feedback that:
1. Acknowledges their effort and progress
2. Is specific to their performance level
3. Motivates them to continue learning
4. Uses their preferred learning style
5. Celebrates their streak if applicable

Keep it positive and motivating!`;

    const messages = [
      { role: "system", content: "You are an encouraging and supportive AI tutor. Provide motivation that builds confidence and enthusiasm for learning." },
      { role: "user", content: prompt }
    ];

    const encouragement = await callQwenAPI(messages, 0.7);

    // Log AI interaction
    student.aiInteractions.push({
      type: 'encouragement',
      context: `Encouragement for ${topic} performance`,
      timestamp: new Date()
    });
    await student.save();

    res.json({ 
      success: true,
      encouragement 
    });

  } catch (error) {
    console.error('Encouragement Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating encouragement',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET api/ai/learning-insights
// @desc    Get AI-generated learning insights for the student
// @access  Private
router.get('/learning-insights', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ msg: 'Student not found' });

    if (!OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        insights: "Demo mode: Based on your learning patterns, you're showing great progress in most subjects. Consider focusing on areas where you've struggled recently.",
        analytics: {
          strengths: ["general learning"],
          weaknesses: ["specific topics"],
          recommendations: ["Continue practicing", "Review difficult concepts"]
        }
      });
    }

    // Analyze learning patterns
    const recentProgress = student.performanceHistory.slice(-10);
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    // Analyze performance by subject
    const subjectPerformance = {};
    recentProgress.forEach(p => {
      if (!subjectPerformance[p.subject]) {
        subjectPerformance[p.subject] = { scores: [], count: 0 };
      }
      subjectPerformance[p.subject].scores.push(p.score);
      subjectPerformance[p.subject].count++;
    });

    Object.entries(subjectPerformance).forEach(([subject, data]) => {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      if (avgScore >= 0.8) {
        strengths.push(subject);
      } else if (avgScore <= 0.6) {
        weaknesses.push(subject);
      }
    });

    // Generate AI insights
    const prompt = `Analyze this student's learning data and provide insights:

Student: ${student.name}
Strengths: ${strengths.join(', ')}
Areas for Improvement: ${weaknesses.join(', ')}
Learning Style: ${JSON.stringify(student.learningStyle)}
Current Level: ${student.currentLevel}
Total Study Time: ${student.totalStudyTime} minutes
Streak: ${student.streak} days

Provide 3-5 specific, actionable insights and recommendations.`;

    const messages = [
      { role: "system", content: "You are an expert educational analyst. Provide specific, actionable insights based on learning data." },
      { role: "user", content: prompt }
    ];

    const insights = await callQwenAPI(messages, 0.7);

    res.json({
      success: true,
      insights,
      analytics: {
        strengths,
        weaknesses,
        subjectPerformance,
        overallTrend: recentProgress.length > 1 ? 'improving' : 'stable'
      }
    });

  } catch (error) {
    console.error('Learning Insights Error:', error);
    res.status(500).json({ 
      msg: 'Error generating insights',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
