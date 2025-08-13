const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const LearningPlan = require('../models/LearningPlan');
const syllabusDatasets = require('../data/syllabus-datasets');
const roadmapService = require('../utils/roadmapService');

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

// Helper function to call Qwen API with improved error handling
async function callQwenAPI(messages, temperature = 0.7, retries = 2) {
  // Check if API key is properly configured
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here' || OPENROUTER_API_KEY === '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') {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.');
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

      console.log(`Qwen API attempt ${attempt + 1}/${retries + 1}`);

      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Learning Plan Generator'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          temperature: temperature,
          max_tokens: 4000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`API client error: ${response.status} - ${errorText}`);
        }
        
        // Retry on server errors (5xx) if we have attempts left
        if (attempt < retries) {
          console.log(`Server error ${response.status}, retrying in ${(attempt + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        
        throw new Error(`API server error: ${response.status} - ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, it might be an HTML error page
        const responseText = await response.text();
        console.error('Response was not valid JSON:', responseText.substring(0, 200));
        throw new Error(`OpenRouter API returned invalid JSON (status ${response.status}). This might be an HTML error page. Check your API key and endpoint URL.`);
      }
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Invalid response format from AI API');
      }

      console.log('Qwen API call successful');
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error(`Qwen API Error (attempt ${attempt + 1}):`, error.message);
      
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          console.log('Request timeout, retrying...');
          continue;
        }
        throw new Error('Request timeout - AI service is taking too long to respond. Please try again.');
      }
      
      // Don't retry on JSON parsing errors or client errors
      if (error.message.includes('Invalid response format') || error.message.includes('client error')) {
        throw error;
      }
      
      // Retry on network errors if we have attempts left
      if (attempt < retries) {
        console.log(`Network error, retrying in ${(attempt + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
        continue;
      }
      
      throw error;
    }
  }
}

// @route   POST api/learning-plans/generate-daily-roadmap
// @desc    Generate comprehensive day-wise learning roadmap
// @access  Private
router.post('/generate-daily-roadmap', auth, async (req, res) => {
  const { duration, subjects, preferences } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Generate curriculum based on requested subjects
    let curriculum = { subjects: [] };
    
    if (subjects && subjects.length > 0) {
      curriculum.subjects = subjects.map((subject, index) => ({
        name: subject.name,
        description: subject.description || `Comprehensive study of ${subject.name}`,
        weightage: subject.weightage || Math.round(100 / subjects.length),
        units: subject.units || [
          {
            title: `Introduction to ${subject.name}`,
            description: `Basic concepts and fundamentals of ${subject.name}`,
            topics: [
              `Fundamentals of ${subject.name}`,
              `Core Concepts`,
              `Basic Applications`,
              `Problem Solving`
            ],
            estimatedDuration: 20,
            order: 1
          },
          {
            title: `Advanced ${subject.name}`,
            description: `Advanced topics and applications`,
            topics: [
              `Advanced Concepts`,
              `Complex Applications`,
              `Real-world Problems`,
              `Project Work`
            ],
            estimatedDuration: 25,
            order: 2
          }
        ],
        totalHours: subject.totalHours || 45
      }));
    } else {
      // Default curriculum based on student type
      if (student.studentType === 'school') {
        curriculum.subjects = [
          {
            name: 'Mathematics',
            description: 'Core mathematical concepts and problem-solving',
            weightage: 25,
            units: [
              {
                title: 'Basic Mathematics',
                description: 'Fundamental mathematical concepts',
                topics: ['Numbers', 'Algebra', 'Geometry', 'Statistics'],
                estimatedDuration: 20,
                order: 1
              }
            ],
            totalHours: 20
          },
          {
            name: 'Science',
            description: 'Scientific concepts and experiments',
            weightage: 25,
            units: [
              {
                title: 'Basic Science',
                description: 'Introduction to scientific concepts',
                topics: ['Physics', 'Chemistry', 'Biology', 'Experiments'],
                estimatedDuration: 20,
                order: 1
              }
            ],
            totalHours: 20
          },
          {
            name: 'English',
            description: 'Language and communication skills',
            weightage: 20,
            units: [
              {
                title: 'Language Skills',
                description: 'Reading, writing, and communication',
                topics: ['Grammar', 'Vocabulary', 'Comprehension', 'Writing'],
                estimatedDuration: 15,
                order: 1
              }
            ],
            totalHours: 15
          },
          {
            name: 'Social Studies',
            description: 'History, geography, and civics',
            weightage: 15,
            units: [
              {
                title: 'Social Sciences',
                description: 'Understanding society and environment',
                topics: ['History', 'Geography', 'Civics', 'Economics'],
                estimatedDuration: 15,
                order: 1
              }
            ],
            totalHours: 15
          },
          {
            name: 'Computer Science',
            description: 'Technology and programming basics',
            weightage: 15,
            units: [
              {
                title: 'Technology Fundamentals',
                description: 'Basic computer and programming concepts',
                topics: ['Computer Basics', 'Programming', 'Internet', 'Applications'],
                estimatedDuration: 15,
                order: 1
              }
            ],
            totalHours: 15
          }
        ];
      } else {
        // College student default curriculum
        curriculum.subjects = [
          {
            name: 'Programming Fundamentals',
            description: 'Core programming concepts and practices',
            weightage: 30,
            units: [
              {
                title: 'Basic Programming',
                description: 'Introduction to programming concepts',
                topics: ['Variables', 'Control Structures', 'Functions', 'Data Types'],
                estimatedDuration: 25,
                order: 1
              }
            ],
            totalHours: 25
          },
          {
            name: 'Web Development',
            description: 'Frontend and backend web technologies',
            weightage: 30,
            units: [
              {
                title: 'Web Technologies',
                description: 'HTML, CSS, JavaScript fundamentals',
                topics: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
                estimatedDuration: 25,
                order: 1
              }
            ],
            totalHours: 25
          },
          {
            name: 'Database Management',
            description: 'Database design and management',
            weightage: 20,
            units: [
              {
                title: 'Database Concepts',
                description: 'Database design and SQL',
                topics: ['Database Design', 'SQL', 'Normalization', 'Relationships'],
                estimatedDuration: 20,
                order: 1
              }
            ],
            totalHours: 20
          },
          {
            name: 'Software Engineering',
            description: 'Software development methodologies',
            weightage: 20,
            units: [
              {
                title: 'Development Process',
                description: 'Software development lifecycle',
                topics: ['Requirements', 'Design', 'Implementation', 'Testing'],
                estimatedDuration: 20,
                order: 1
              }
            ],
            totalHours: 20
          }
        ];
      }
    }

    // Generate comprehensive day-wise roadmap
    let dailyRoadmap;
    let weeklyMilestones;
    let schedule;
    let isAIGenerated = true;
    
    try {
      console.log('Generating daily roadmap with AI...');
      dailyRoadmap = await generateDailyRoadmap(student, curriculum, duration, preferences);
      weeklyMilestones = generateWeeklyMilestones(duration);
      schedule = await generateSchedule(student, curriculum, duration, preferences);
      console.log('AI generation successful');
    } catch (error) {
      console.log('AI generation failed, using roadmap service fallback:', error.message);
      isAIGenerated = false;
      
      try {
        // Use roadmap service as fallback
        const roadmapType = student.studentType === 'college' ? 'fullstack' : 'frontend';
        console.log(`Using fallback roadmap type: ${roadmapType}`);
        
        const fallbackCurriculum = await roadmapService.convertToCurriculum(roadmapType, duration, preferences);
        
        dailyRoadmap = roadmapService.generateDailyRoadmap(fallbackCurriculum, duration, preferences);
        weeklyMilestones = roadmapService.generateWeeklyMilestones(duration);
        schedule = roadmapService.generateSchedule(fallbackCurriculum, duration, preferences);
        
        // Update curriculum with fallback data
        curriculum = fallbackCurriculum;
        console.log('Fallback generation successful');
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError.message);
        throw new Error(`Failed to generate roadmap: ${error.message}. Fallback also failed: ${fallbackError.message}`);
      }
    }

    // Create learning plan
    const learningPlan = new LearningPlan({
      student: student._id,
      planType: 'daily-roadmap',
      title: `Personalized ${duration}-Day Learning Roadmap`,
      description: `Comprehensive day-wise learning plan with ${curriculum.subjects.length} subjects over ${duration} days`,
      startDate: new Date(),
      endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)),
      dailyRoadmap,
      weeklyMilestones,
      curriculum,
      schedule,
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3,
        dailyAdjustment: {
          enabled: true,
          basedOnMood: true,
          basedOnPerformance: true,
          basedOnEnergy: true
        }
      },
      gamification: {
        milestones: generateMilestones(curriculum),
        challenges: generateChallenges(student),
        dailyChallenges: generateDailyChallenges()
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true,
        dailyInsights: {
          enabled: true,
          moodAnalysis: true,
          performancePrediction: true,
          adaptiveSuggestions: true
        }
      },
      status: 'active'
    });

    await learningPlan.save();

    // Update student with learning plan reference
    student.learningSchedule = {
      preferredStudyTimes: schedule.weeklyPlan.map(day => ({
        day: day.day,
        startTime: day.sessions[0]?.startTime || '09:00',
        endTime: day.sessions[day.sessions.length - 1]?.endTime || '17:00',
        subjects: [...new Set(day.sessions.map(s => s.subject))]
      })),
      weeklyGoals: {
        hoursPerWeek: schedule.dailyStudyHours * schedule.weeklyStudyDays,
        subjectsPerWeek: curriculum.subjects.length
      }
    };
    await student.save();

    res.json({
      success: true,
      learningPlan,
      message: `Comprehensive ${duration}-day learning roadmap generated successfully!${isAIGenerated ? ' (AI-powered)' : ' (Using fallback data)'}`,
      stats: {
        totalDays: duration,
        totalSubjects: curriculum.subjects.length,
        totalSessions: dailyRoadmap.reduce((sum, day) => sum + day.sessions.length, 0),
        weeklyMilestones: weeklyMilestones.length,
        dailyStudyHours: Math.ceil(curriculum.subjects.reduce((sum, s) => sum + s.totalHours, 0) / (duration * 0.7)),
        generatedBy: isAIGenerated ? 'AI' : 'Fallback'
      }
    });

  } catch (err) {
    console.error('Daily Roadmap Generation Error:', err);
    res.status(500).json({ 
      msg: 'Error generating daily roadmap. Please try again or check your API configuration.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      suggestion: 'Try using the "Choose Roadmap" option for pre-built roadmaps if AI generation continues to fail.'
    });
  }
});

// @route   POST api/learning-plans/generate
// @desc    Generate personalized learning plan with day-wise roadmap
// @access  Private
router.post('/generate', auth, async (req, res) => {
  const { planType, duration, preferences } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    let curriculum = { subjects: [] };
    let planTitle = '';
    let planDescription = '';

    // Generate curriculum based on student type and plan type
    if (student.studentType === 'school') {
      if (planType === 'syllabus-based') {
        const board = student.schoolDetails?.board || 'CBSE';
        const classLevel = student.schoolDetails?.class || '9';
        
        if (syllabusDatasets.cbse && syllabusDatasets.cbse[classLevel]) {
          const cbseData = syllabusDatasets.cbse[classLevel];
          curriculum.subjects = Object.entries(cbseData.subjects).map(([name, data]) => ({
            name,
            description: data.description,
            weightage: data.weightage,
            units: data.units,
            totalHours: data.totalHours
          }));
          planTitle = `${board} Class ${classLevel} Complete Syllabus Plan`;
          planDescription = `Comprehensive day-wise study plan covering all subjects for ${board} Class ${classLevel}`;
        } else {
          // Fallback curriculum
          curriculum.subjects = [
            {
              name: 'Mathematics',
              description: 'Core mathematical concepts',
              weightage: 25,
              units: [
                {
                  title: 'Basic Mathematics',
                  description: 'Fundamental concepts',
                  topics: ['Numbers', 'Algebra', 'Geometry'],
                  estimatedDuration: 20,
                  order: 1
                }
              ],
              totalHours: 20
            },
            {
              name: 'Science',
              description: 'Scientific concepts and experiments',
              weightage: 25,
              units: [
                {
                  title: 'Basic Science',
                  description: 'Introduction to science',
                  topics: ['Physics', 'Chemistry', 'Biology'],
                  estimatedDuration: 20,
                  order: 1
                }
              ],
              totalHours: 20
            }
          ];
          planTitle = 'General School Study Plan';
          planDescription = 'Comprehensive day-wise study plan for school students';
        }
      } else if (planType === 'exam-preparation') {
        if (student.schoolDetails?.examPreparation?.neet) {
          curriculum.subjects = [
            {
              name: 'Physics',
              description: 'NEET Physics preparation',
              weightage: 25,
              units: [
                {
                  title: 'Mechanics',
                  description: 'Classical mechanics',
                  topics: ['Motion', 'Forces', 'Energy', 'Momentum'],
                  estimatedDuration: 30,
                  order: 1
                }
              ],
              totalHours: 30
            },
            {
              name: 'Chemistry',
              description: 'NEET Chemistry preparation',
              weightage: 25,
              units: [
                {
                  title: 'Physical Chemistry',
                  description: 'Physical chemistry concepts',
                  topics: ['Atomic Structure', 'Chemical Bonding', 'Thermodynamics'],
                  estimatedDuration: 30,
                  order: 1
                }
              ],
              totalHours: 30
            },
            {
              name: 'Biology',
              description: 'NEET Biology preparation',
              weightage: 50,
              units: [
                {
                  title: 'Botany',
                  description: 'Plant biology',
                  topics: ['Cell Biology', 'Plant Physiology', 'Ecology'],
                  estimatedDuration: 40,
                  order: 1
                }
              ],
              totalHours: 40
            }
          ];
          planTitle = 'NEET Preparation Plan';
          planDescription = 'Structured day-wise preparation plan for NEET medical entrance examination';
        }
      }
    } else if (student.studentType === 'college') {
      if (planType === 'technology-roadmap') {
        const technologies = student.collegeDetails?.technologies?.map(tech => tech.name) || ['MERN Stack'];
        
        if (technologies.includes('MERN Stack')) {
          curriculum.subjects = [
            {
              name: 'MongoDB',
              description: 'NoSQL database fundamentals',
              weightage: 20,
              units: [
                {
                  title: 'Database Basics',
                  description: 'MongoDB fundamentals',
                  topics: ['CRUD Operations', 'Schema Design', 'Indexing'],
                  estimatedDuration: 25,
                  order: 1
                }
              ],
              totalHours: 25
            },
            {
              name: 'Express.js',
              description: 'Node.js web framework',
              weightage: 20,
              units: [
                {
                  title: 'Backend Development',
                  description: 'Express.js fundamentals',
                  topics: ['Routing', 'Middleware', 'API Development'],
                  estimatedDuration: 25,
                  order: 1
                }
              ],
              totalHours: 25
            },
            {
              name: 'React.js',
              description: 'Frontend library',
              weightage: 30,
              units: [
                {
                  title: 'Frontend Development',
                  description: 'React.js fundamentals',
                  topics: ['Components', 'State Management', 'Hooks'],
                  estimatedDuration: 30,
                  order: 1
                }
              ],
              totalHours: 30
            },
            {
              name: 'Node.js',
              description: 'JavaScript runtime',
              weightage: 30,
              units: [
                {
                  title: 'Server Development',
                  description: 'Node.js fundamentals',
                  topics: ['Event Loop', 'Modules', 'NPM'],
                  estimatedDuration: 30,
                  order: 1
                }
              ],
              totalHours: 30
            }
          ];
          planTitle = 'MERN Stack Development Roadmap';
          planDescription = 'Complete day-wise roadmap for becoming a full-stack MERN developer';
        }
      }
    }

    // Generate day-wise roadmap
    const dailyRoadmap = await generateDailyRoadmap(student, curriculum, duration, preferences);
    
    // Generate weekly milestones
    const weeklyMilestones = generateWeeklyMilestones(duration);

    // Generate schedule using AI
    const schedule = await generateSchedule(student, curriculum, duration, preferences);

    // Create learning plan
    const learningPlan = new LearningPlan({
      student: student._id,
      planType: planType || 'daily-roadmap',
      title: planTitle || 'Personalized Learning Plan',
      description: planDescription || 'Comprehensive day-wise learning roadmap',
      startDate: new Date(),
      endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)), // duration in days
      dailyRoadmap,
      weeklyMilestones,
      curriculum,
      schedule,
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3,
        dailyAdjustment: {
          enabled: true,
          basedOnMood: true,
          basedOnPerformance: true,
          basedOnEnergy: true
        }
      },
      gamification: {
        milestones: generateMilestones(curriculum),
        challenges: generateChallenges(student),
        dailyChallenges: generateDailyChallenges()
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true,
        dailyInsights: {
          enabled: true,
          moodAnalysis: true,
          performancePrediction: true,
          adaptiveSuggestions: true
        }
      }
    });

    await learningPlan.save();

    // Update student with learning plan reference
    student.learningSchedule = {
      preferredStudyTimes: schedule.weeklyPlan.map(day => ({
        day: day.day,
        startTime: day.sessions[0]?.startTime || '09:00',
        endTime: day.sessions[day.sessions.length - 1]?.endTime || '17:00',
        subjects: [...new Set(day.sessions.map(s => s.subject))]
      })),
      weeklyGoals: {
        hoursPerWeek: schedule.dailyStudyHours * schedule.weeklyStudyDays,
        subjectsPerWeek: curriculum.subjects.length
      }
    };
    await student.save();

    res.json({
      success: true,
      learningPlan,
      message: 'Personalized day-wise learning plan generated successfully!',
      stats: {
        totalDays: duration,
        totalSubjects: curriculum.subjects.length,
        totalSessions: dailyRoadmap.reduce((sum, day) => sum + day.sessions.length, 0),
        weeklyMilestones: weeklyMilestones.length
      }
    });

  } catch (err) {
    console.error('Learning Plan Generation Error:', err);
    res.status(500).json({ 
      msg: 'Error generating learning plan',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Helper function to generate day-wise roadmap
async function generateDailyRoadmap(student, curriculum, duration, preferences) {
  const roadmap = [];
  const startDate = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Calculate total study hours
  const totalHours = curriculum.subjects.reduce((sum, subject) => sum + subject.totalHours, 0);
  const dailyStudyHours = Math.ceil(totalHours / (duration * 0.7)); // 70% efficiency
  
  // Distribute subjects across days
  const subjects = curriculum.subjects;
  let subjectIndex = 0;
  let unitIndex = 0;
  let topicIndex = 0;

  for (let dayNumber = 1; dayNumber <= duration; dayNumber++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayNumber - 1);
    const dayOfWeek = daysOfWeek[currentDate.getDay()];
    
    // Skip weekends if preference is set
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const isStudyDay = !isWeekend || preferences?.studyOnWeekends !== false;
    
    const dayRoadmap = {
      dayNumber,
      date: currentDate,
      dayOfWeek,
      isStudyDay,
      totalStudyHours: isStudyDay ? dailyStudyHours : 0,
      sessions: [],
      dailyGoals: [],
      dailyReflection: {
        mood: null,
        energy: null,
        notes: '',
        challenges: [],
        achievements: []
      },
      progress: {
        completedSessions: 0,
        totalSessions: 0,
        studyTime: 0,
        score: 0
      }
    };

    if (isStudyDay) {
      let remainingHours = dailyStudyHours;
      let sessionStartTime = '09:00';
      
      while (remainingHours > 0 && subjectIndex < subjects.length) {
        const subject = subjects[subjectIndex];
        const units = subject.units;
        
        if (unitIndex >= units.length) {
          subjectIndex++;
          unitIndex = 0;
          if (subjectIndex >= subjects.length) break;
          continue;
        }
        
        const unit = units[unitIndex];
        const topics = unit.topics;
        
        if (topicIndex >= topics.length) {
          unitIndex++;
          topicIndex = 0;
          continue;
        }
        
        const sessionDuration = Math.min(2, remainingHours); // Max 2 hours per session
        const sessionEndTime = calculateEndTime(sessionStartTime, sessionDuration);
        
        const session = {
          sessionId: `day${dayNumber}_session${dayRoadmap.sessions.length + 1}`,
          subject: subject.name,
          unit: unit.title,
          topics: topics.slice(topicIndex, topicIndex + 2), // 1-2 topics per session
          duration: sessionDuration * 60, // Convert to minutes
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          type: 'learning',
          learningObjectives: [`Understand ${topics[topicIndex]}`, `Apply concepts from ${unit.title}`],
          resources: [
            {
              type: 'video',
              title: `${topics[topicIndex]} Tutorial`,
              url: '#',
              duration: 30
            },
            {
              type: 'article',
              title: `${topics[topicIndex]} Guide`,
              url: '#',
              duration: 15
            }
          ],
          exercises: [
            {
              title: `${topics[topicIndex]} Practice`,
              type: 'quiz',
              estimatedTime: 20
            }
          ],
          assessment: {
            type: 'quiz',
            questions: 5,
            timeLimit: 15
          },
          isCompleted: false,
          completionTime: null,
          score: null,
          notes: ''
        };
        
        dayRoadmap.sessions.push(session);
        dayRoadmap.progress.totalSessions++;
        
        // Add daily goals
        dayRoadmap.dailyGoals.push({
          goal: `Complete ${topics[topicIndex]} in ${subject.name}`,
          isCompleted: false
        });
        
        remainingHours -= sessionDuration;
        sessionStartTime = sessionEndTime;
        
        topicIndex += 2;
        if (topicIndex >= topics.length) {
          unitIndex++;
          topicIndex = 0;
        }
      }
      
      // Add break sessions if needed
      if (dayRoadmap.sessions.length > 0) {
        dayRoadmap.sessions.push({
          sessionId: `day${dayNumber}_break`,
          subject: 'Break',
          unit: 'Rest',
          topics: ['Short Break'],
          duration: 15,
          startTime: dayRoadmap.sessions[dayRoadmap.sessions.length - 1].endTime,
          endTime: calculateEndTime(dayRoadmap.sessions[dayRoadmap.sessions.length - 1].endTime, 0.25),
          type: 'break',
          learningObjectives: [],
          resources: [],
          exercises: [],
          assessment: null,
          isCompleted: false,
          completionTime: null,
          score: null,
          notes: ''
        });
      }
    }
    
    roadmap.push(dayRoadmap);
  }
  
  return roadmap;
}

// Helper function to generate weekly milestones
function generateWeeklyMilestones(duration) {
  const milestones = [];
  const totalWeeks = Math.ceil(duration / 7);
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = (week - 1) * 7 + 1;
    const weekEnd = Math.min(week * 7, duration);
    
    milestones.push({
      weekNumber: week,
      title: `Week ${week} Milestone`,
      description: `Complete all learning objectives for days ${weekStart}-${weekEnd}`,
      goals: [
        `Complete ${Math.ceil((weekEnd - weekStart + 1) * 0.8)} out of ${weekEnd - weekStart + 1} daily sessions`,
        `Maintain consistent study schedule`,
        `Review and reflect on learning progress`
      ],
      targetProgress: Math.round((week / totalWeeks) * 100),
      isCompleted: false,
      completedAt: null,
      achievements: []
    });
  }
  
  return milestones;
}

// Helper function to generate daily challenges
function generateDailyChallenges() {
  return [
    {
      title: 'Early Bird',
      description: 'Start studying before 9 AM',
      type: 'timing',
      target: 1,
      reward: '50 points',
      isCompleted: false,
      completedAt: null
    },
    {
      title: 'Perfect Score',
      description: 'Achieve 100% on any assessment',
      type: 'score',
      target: 100,
      reward: '100 points',
      isCompleted: false,
      completedAt: null
    },
    {
      title: 'Study Streak',
      description: 'Study for 3 consecutive days',
      type: 'streak',
      target: 3,
      reward: 'Achievement Badge',
      isCompleted: false,
      completedAt: null
    }
  ];
}

// Helper function to generate schedule using Qwen AI
async function generateSchedule(student, curriculum, duration, preferences) {
  try {
    const subjects = curriculum.subjects.map(s => s.name);
    const totalHours = curriculum.subjects.reduce((sum, subject) => sum + subject.totalHours, 0);
    
    // Calculate daily study hours based on duration
    const dailyStudyHours = Math.ceil(totalHours / (duration * 0.7)); // 70% efficiency
    const weeklyStudyDays = preferences?.weeklyStudyDays || 5;
    
    // Use Qwen AI to generate intelligent schedule
    const prompt = `Generate a personalized weekly study schedule for a ${student.studentType} student.

Student Profile:
- Age: ${student.age}
- Learning Style: ${JSON.stringify(student.learningStyle)}
- Preferred Subjects: ${student.preferredSubjects?.join(', ') || 'Not specified'}
- Difficulty Preference: ${student.difficultyPreference || 5}/10

Curriculum:
${JSON.stringify(curriculum, null, 2)}

Requirements:
- Duration: ${duration} days
- Daily Study Hours: ${dailyStudyHours}
- Weekly Study Days: ${weeklyStudyDays}
- Subjects: ${subjects.join(', ')}

Generate a JSON schedule with this structure:
{
  "weeklyPlan": [
    {
      "day": "Monday",
      "sessions": [
        {
          "subject": "subject_name",
          "unit": "unit_title",
          "topics": ["topic1", "topic2"],
          "duration": 120,
          "startTime": "09:00",
          "endTime": "11:00",
          "type": "learning"
        }
      ]
    }
  ],
  "dailyStudyHours": ${dailyStudyHours},
  "weeklyStudyDays": ${weeklyStudyDays},
  "breakDays": ["Saturday", "Sunday"]
}

Consider the student's learning style and preferences for optimal scheduling.`;

    const messages = [
      {
        role: "system",
        content: "You are an expert educational planner. Generate personalized study schedules that optimize learning based on student profiles and curriculum requirements. Always respond with valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const aiResponse = await callQwenAPI(messages, 0.5);
    
    // Clean the JSON response to handle invalid values
    const cleanedResponse = sanitizeJSONResponse(aiResponse);
    const schedule = JSON.parse(cleanedResponse);
    
    return schedule;
  } catch (error) {
    console.error('AI Schedule Generation Error:', error);
    
    // Fallback to basic schedule generation
    const subjects = curriculum.subjects.map(s => s.name);
    const totalHours = curriculum.subjects.reduce((sum, subject) => sum + subject.totalHours, 0);
    const dailyStudyHours = Math.ceil(totalHours / (duration * 0.7));
    const weeklyStudyDays = preferences?.weeklyStudyDays || 5;
    
    const schedule = {
      weeklyPlan: [],
      dailyStudyHours,
      weeklyStudyDays,
      breakDays: ['Saturday', 'Sunday']
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    days.forEach((day, dayIndex) => {
      const dayPlan = {
        day,
        sessions: []
      };

      let remainingHours = dailyStudyHours;
      let subjectIndex = dayIndex % subjects.length;

      while (remainingHours > 0) {
        const subject = subjects[subjectIndex];
        const subjectData = curriculum.subjects.find(s => s.name === subject);
        
        const sessionDuration = Math.min(2, remainingHours);
        
        dayPlan.sessions.push({
          subject,
          unit: subjectData?.units[0]?.title || 'Introduction',
          topics: subjectData?.units[0]?.topics.slice(0, 2) || [],
          duration: sessionDuration * 60,
          startTime: dayPlan.sessions.length === 0 ? '09:00' : 
                    dayPlan.sessions[dayPlan.sessions.length - 1].endTime,
          endTime: calculateEndTime(
            dayPlan.sessions.length === 0 ? '09:00' : 
            dayPlan.sessions[dayPlan.sessions.length - 1].endTime,
            sessionDuration
          ),
          type: 'learning'
        });

        remainingHours -= sessionDuration;
        subjectIndex = (subjectIndex + 1) % subjects.length;
      }

      schedule.weeklyPlan.push(dayPlan);
    });

    return schedule;
  }
}

// Helper function to calculate end time
function calculateEndTime(startTime, hours) {
  const [hours_str, minutes_str] = startTime.split(':');
  const startDate = new Date();
  startDate.setHours(parseInt(hours_str), parseInt(minutes_str), 0);
  
  const endDate = new Date(startDate.getTime() + (hours * 60 * 60 * 1000));
  
  return endDate.toTimeString().slice(0, 5);
}

// Helper function to generate milestones
function generateMilestones(curriculum) {
  const milestones = [];
  const totalTopics = curriculum.subjects.reduce((sum, subject) => 
    sum + subject.units.reduce((s, unit) => s + unit.topics.length, 0), 0);

  // Progress milestones
  [25, 50, 75, 100].forEach(percentage => {
    milestones.push({
      title: `${percentage}% Complete`,
      description: `Complete ${percentage}% of your learning plan`,
      targetProgress: percentage,
      reward: `${percentage * 10} points`,
      achieved: false,
      achievedAt: null
    });
  });

  // Subject-specific milestones
  curriculum.subjects.forEach((subject, index) => {
    milestones.push({
      title: `${subject.name} Master`,
      description: `Complete all units in ${subject.name}`,
      targetProgress: Math.round(((index + 1) / curriculum.subjects.length) * 100),
      reward: 'Achievement Badge',
      achieved: false,
      achievedAt: null
    });
  });

  return milestones;
}

// Helper function to generate challenges
function generateChallenges(student) {
  return [
    {
      title: '7-Day Streak',
      description: 'Study for 7 consecutive days',
      type: 'streak',
      target: 7,
      reward: '100 points',
      completed: false,
      completedAt: null
    },
    {
      title: 'Perfect Score',
      description: 'Achieve 100% on any assessment',
      type: 'score',
      target: 100,
      reward: '50 points',
      completed: false,
      completedAt: null
    },
    {
      title: 'Quick Learner',
      description: 'Complete 5 topics in a single day',
      type: 'completion',
      target: 5,
      reward: 'Achievement Badge',
      completed: false,
      completedAt: null
    }
  ];
}

// @route   GET api/learning-plans
// @desc    Get all learning plans for a student
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const learningPlans = await LearningPlan.find({ 
      student: req.student.id 
    }).sort({ createdAt: -1 });

    res.json(learningPlans);
  } catch (err) {
    console.error('Get Learning Plans Error:', err);
    res.status(500).json({ msg: 'Error fetching learning plans' });
  }
});

// @route   GET api/learning-plans/roadmaps
// @desc    Get available roadmap types
// @access  Private
router.get('/roadmaps', auth, async (req, res) => {
  try {
    const roadmaps = roadmapService.getAvailableRoadmaps();
    res.json({
      success: true,
      roadmaps
    });
  } catch (err) {
    console.error('Get Roadmaps Error:', err);
    res.status(500).json({ msg: 'Error fetching roadmaps' });
  }
});

// @route   GET api/learning-plans/:id
// @desc    Get specific learning plan
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    res.json(learningPlan);
  } catch (err) {
    console.error('Get Learning Plan Error:', err);
    res.status(500).json({ msg: 'Error fetching learning plan' });
  }
});

// @route   POST api/learning-plans/generate-from-roadmap
// @desc    Generate learning plan from specific roadmap type
// @access  Private
router.post('/generate-from-roadmap', auth, async (req, res) => {
  const { roadmapType, duration, preferences } = req.body;

  try {
    const student = await Student.findById(req.student.id);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Convert roadmap to curriculum
    const curriculum = await roadmapService.convertToCurriculum(roadmapType, duration, preferences);
    
    // Generate roadmap components
    const dailyRoadmap = roadmapService.generateDailyRoadmap(curriculum, duration, preferences);
    const weeklyMilestones = roadmapService.generateWeeklyMilestones(duration);
    const schedule = roadmapService.generateSchedule(curriculum, duration, preferences);

    // Create learning plan
    const learningPlan = new LearningPlan({
      student: student._id,
      planType: 'roadmap-based',
      title: `${curriculum.roadmapType} Learning Roadmap`,
      description: `Comprehensive ${duration}-day learning plan based on ${curriculum.roadmapType} roadmap`,
      startDate: new Date(),
      endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)),
      dailyRoadmap,
      weeklyMilestones,
      curriculum,
      schedule,
      adaptiveSettings: {
        autoAdjust: true,
        difficultyScaling: true,
        personalizedPacing: true,
        revisionCycles: 3,
        dailyAdjustment: {
          enabled: true,
          basedOnMood: true,
          basedOnPerformance: true,
          basedOnEnergy: true
        }
      },
      gamification: {
        milestones: generateMilestones(curriculum),
        challenges: generateChallenges(student),
        dailyChallenges: generateDailyChallenges()
      },
      aiEnhancements: {
        personalizedRecommendations: true,
        dynamicScheduling: true,
        performanceAnalysis: true,
        adaptiveContent: true,
        dailyInsights: {
          enabled: true,
          moodAnalysis: true,
          performancePrediction: true,
          adaptiveSuggestions: true
        }
      }
    });

    await learningPlan.save();

    // Update student with learning plan reference
    student.learningSchedule = {
      preferredStudyTimes: schedule.weeklyPlan.map(day => ({
        day: day.day,
        startTime: day.sessions[0]?.startTime || '09:00',
        endTime: day.sessions[day.sessions.length - 1]?.endTime || '17:00',
        subjects: [...new Set(day.sessions.map(s => s.subject))]
      })),
      weeklyGoals: {
        hoursPerWeek: schedule.dailyStudyHours * schedule.weeklyStudyDays,
        subjectsPerWeek: curriculum.subjects.length
      }
    };
    await student.save();

    res.json({
      success: true,
      learningPlan,
      message: `${curriculum.roadmapType} roadmap generated successfully!`,
      stats: {
        totalDays: duration,
        totalSubjects: curriculum.subjects.length,
        totalSessions: dailyRoadmap.reduce((sum, day) => sum + day.sessions.length, 0),
        weeklyMilestones: weeklyMilestones.length,
        dailyStudyHours: Math.ceil(curriculum.subjects.reduce((sum, s) => sum + s.totalHours, 0) / (duration * 0.7))
      }
    });

  } catch (err) {
    console.error('Roadmap Generation Error:', err);
    res.status(500).json({ 
      msg: 'Error generating roadmap-based learning plan',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   GET api/learning-plans/:id/today
// @desc    Get today's roadmap for a learning plan
// @access  Private
router.get('/:id/today', auth, async (req, res) => {
  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    const todayRoadmap = learningPlan.getTodayRoadmap();
    
    if (!todayRoadmap) {
      return res.status(404).json({ msg: 'No roadmap found for today' });
    }

    res.json({
      success: true,
      todayRoadmap,
      learningPlan: {
        id: learningPlan._id,
        title: learningPlan.title,
        currentDay: learningPlan.currentDay,
        completionPercentage: learningPlan.completionPercentage
      }
    });
  } catch (err) {
    console.error('Get Today Roadmap Error:', err);
    res.status(500).json({ msg: 'Error fetching today\'s roadmap' });
  }
});

// @route   PUT api/learning-plans/:id/session/:sessionId/complete
// @desc    Mark a session as completed
// @access  Private
router.put('/:id/session/:sessionId/complete', auth, async (req, res) => {
  const { score, notes } = req.body;

  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    const sessionId = req.params.sessionId;
    const dayNumber = parseInt(sessionId.split('_')[0].replace('day', ''));
    
    await learningPlan.completeSession(dayNumber, sessionId, score, notes);

    res.json({
      success: true,
      message: 'Session completed successfully!'
    });

  } catch (err) {
    console.error('Complete Session Error:', err);
    res.status(500).json({ msg: 'Error completing session' });
  }
});

// @route   PUT api/learning-plans/:id/daily-progress
// @desc    Update daily progress and reflection
// @access  Private
router.put('/:id/daily-progress', auth, async (req, res) => {
  const { date, studyHours, completedSessions, totalSessions, score, mood, notes, challenges, achievements } = req.body;

  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    // Update daily progress
    await learningPlan.updateDailyProgress(date, studyHours, completedSessions, totalSessions, score, mood, notes);

    // Update daily reflection if provided
    if (mood || challenges || achievements) {
      const todayRoadmap = learningPlan.getTodayRoadmap();
      if (todayRoadmap) {
        if (mood) todayRoadmap.dailyReflection.mood = mood;
        if (challenges) todayRoadmap.dailyReflection.challenges = challenges;
        if (achievements) todayRoadmap.dailyReflection.achievements = achievements;
        await learningPlan.save();
      }
    }

    res.json({
      success: true,
      message: 'Daily progress updated successfully!'
    });

  } catch (err) {
    console.error('Update Daily Progress Error:', err);
    res.status(500).json({ msg: 'Error updating daily progress' });
  }
});

// @route   PUT api/learning-plans/:id/progress
// @desc    Update learning plan progress
// @access  Private
router.put('/:id/progress', auth, async (req, res) => {
  const { subject, unit, topic, score, timeSpent } = req.body;

  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    // Update progress
    if (topic) {
      // Mark topic as completed
      const existingTopic = learningPlan.progress.completedTopics.find(
        t => t.subject === subject && t.unit === unit && t.topic === topic
      );

      if (!existingTopic) {
        learningPlan.progress.completedTopics.push({
          subject,
          unit,
          topic,
          completedAt: new Date(),
          score: score || 0,
          timeSpent: timeSpent || 0
        });
      }
    }

    if (unit) {
      // Check if unit is completed
      const subjectData = learningPlan.curriculum.subjects.find(s => s.name === subject);
      const unitData = subjectData?.units.find(u => u.title === unit);
      const unitTopics = unitData?.topics || [];

      const completedUnitTopics = learningPlan.progress.completedTopics.filter(
        t => t.subject === subject && t.unit === unit
      );

      if (completedUnitTopics.length === unitTopics.length) {
        // Mark unit as completed
        const existingUnit = learningPlan.progress.completedUnits.find(
          u => u.subject === subject && u.unit === unit
        );

        if (!existingUnit) {
          learningPlan.progress.completedUnits.push({
            subject,
            unit,
            completedAt: new Date(),
            score: score || 0
          });
        }
      }
    }

    // Calculate overall progress
    learningPlan.progress.overallProgress = learningPlan.calculateProgress();

    // Check for milestones
    const newMilestones = await learningPlan.checkMilestones();

    await learningPlan.save();

    // Update student progress
    const student = await Student.findById(req.student.id);
    if (student) {
      student.totalStudyTime += timeSpent || 0;
      student.totalPoints += Math.round((score || 0) * 10);
      
      // Update streak
      const today = new Date().toDateString();
      const lastStudyDate = student.gamification?.streaks?.lastStudyDate;
      
      if (!lastStudyDate || new Date(lastStudyDate).toDateString() !== today) {
        if (lastStudyDate && 
            new Date(lastStudyDate).getTime() === new Date(Date.now() - 24 * 60 * 60 * 1000).getTime()) {
          student.gamification.streaks.current += 1;
        } else {
          student.gamification.streaks.current = 1;
        }
        
        student.gamification.streaks.lastStudyDate = new Date();
        student.gamification.streaks.longest = Math.max(
          student.gamification.streaks.longest,
          student.gamification.streaks.current
        );
      }

      await student.save();
    }

    res.json({
      success: true,
      learningPlan,
      newMilestones,
      message: 'Progress updated successfully!'
    });

  } catch (err) {
    console.error('Update Progress Error:', err);
    res.status(500).json({ msg: 'Error updating progress' });
  }
});

// @route   PUT api/learning-plans/:id/schedule
// @desc    Update learning plan schedule
// @access  Private
router.put('/:id/schedule', auth, async (req, res) => {
  const { schedule } = req.body;

  try {
    const learningPlan = await LearningPlan.findOne({
      _id: req.params.id,
      student: req.student.id
    });

    if (!learningPlan) {
      return res.status(404).json({ msg: 'Learning plan not found' });
    }

    learningPlan.schedule = schedule;
    await learningPlan.save();

    res.json({
      success: true,
      learningPlan,
      message: 'Schedule updated successfully!'
    });

  } catch (err) {
    console.error('Update Schedule Error:', err);
    res.status(500).json({ msg: 'Error updating schedule' });
  }
});

module.exports = router;
