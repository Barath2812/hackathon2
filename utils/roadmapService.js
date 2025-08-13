const axios = require('axios');

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Roadmap data from roadmap.sh and other sources (fallback)
const ROADMAP_DATA = {
  'frontend': {
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
      },
      {
        name: 'Build Tools',
        topics: [
          { name: 'Webpack', description: 'Module bundler', duration: 20 },
          { name: 'Vite', description: 'Modern build tool', duration: 15 },
          { name: 'Testing', description: 'Jest, Cypress, etc.', duration: 25 }
        ]
      }
    ]
  },
  'backend': {
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
      },
      {
        name: 'APIs & Frameworks',
        topics: [
          { name: 'Express.js', description: 'Node.js web framework', duration: 20 },
          { name: 'Django', description: 'Python web framework', duration: 25 },
          { name: 'Spring Boot', description: 'Java framework', duration: 30 }
        ]
      }
    ]
  },
  'fullstack': {
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
      },
      {
        name: 'DevOps',
        topics: [
          { name: 'Git', description: 'Version control', duration: 15 },
          { name: 'Docker', description: 'Containerization', duration: 20 },
          { name: 'Deployment', description: 'Cloud platforms', duration: 20 }
        ]
      }
    ]
  },
  'data-science': {
    title: 'Data Science Roadmap',
    description: 'Complete roadmap to become a data scientist',
    stages: [
      {
        name: 'Mathematics',
        topics: [
          { name: 'Statistics', description: 'Statistical analysis', duration: 30 },
          { name: 'Linear Algebra', description: 'Mathematical foundations', duration: 25 },
          { name: 'Calculus', description: 'Mathematical concepts', duration: 20 }
        ]
      },
      {
        name: 'Programming',
        topics: [
          { name: 'Python', description: 'Primary language', duration: 25 },
          { name: 'R', description: 'Statistical programming', duration: 20 },
          { name: 'SQL', description: 'Data querying', duration: 15 }
        ]
      },
      {
        name: 'Machine Learning',
        topics: [
          { name: 'Scikit-learn', description: 'ML library', duration: 25 },
          { name: 'TensorFlow', description: 'Deep learning', duration: 30 },
          { name: 'Data Visualization', description: 'Matplotlib, Seaborn', duration: 20 }
        ]
      }
    ]
  },
  'cybersecurity': {
    title: 'Cybersecurity Roadmap',
    description: 'Complete roadmap to become a cybersecurity expert',
    stages: [
      {
        name: 'Networking',
        topics: [
          { name: 'Network Fundamentals', description: 'TCP/IP, protocols', duration: 25 },
          { name: 'Network Security', description: 'Firewalls, VPNs', duration: 20 },
          { name: 'Wireless Security', description: 'WiFi security', duration: 15 }
        ]
      },
      {
        name: 'Security Tools',
        topics: [
          { name: 'Wireshark', description: 'Network analysis', duration: 20 },
          { name: 'Metasploit', description: 'Penetration testing', duration: 25 },
          { name: 'Nmap', description: 'Network scanning', duration: 15 }
        ]
      },
      {
        name: 'Ethical Hacking',
        topics: [
          { name: 'Web Application Security', description: 'OWASP Top 10', duration: 30 },
          { name: 'Social Engineering', description: 'Human factor security', duration: 20 },
          { name: 'Incident Response', description: 'Security incident handling', duration: 25 }
        ]
      }
    ]
  }
};

class RoadmapService {
  constructor() {
    this.roadmaps = ROADMAP_DATA;
  }

  // OpenRouter API integration
  async generateRoadmapWithAI(roadmapType, duration = 90, preferences = {}) {
    try {
      const prompt = this.buildRoadmapPrompt(roadmapType, duration, preferences);
      
      const response = await axios.post(OPENROUTER_URL, {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "You are an expert learning path designer. Create comprehensive, structured learning roadmaps in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      }, {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://learning-platform.com",
          "X-Title": "Learning Platform",
          "Content-Type": "application/json"
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        const roadmapData = JSON.parse(aiResponse);
        return this.validateAndFormatRoadmap(roadmapData, roadmapType);
      } catch (parseError) {
        console.log('AI response not in JSON format, using fallback:', parseError.message);
        return this.getRoadmap(roadmapType); // Fallback to static data
      }
      
    } catch (error) {
      console.error('OpenRouter API Error:', error.message);
      console.log('Using fallback roadmap data');
      return this.getRoadmap(roadmapType); // Fallback to static data
    }
  }

  // Build prompt for AI roadmap generation
  buildRoadmapPrompt(roadmapType, duration, preferences) {
    return `Create a comprehensive learning roadmap for ${roadmapType} development. 

Requirements:
- Duration: ${duration} days
- Study days per week: ${preferences.weeklyStudyDays || 5}
- Study on weekends: ${preferences.studyOnWeekends ? 'Yes' : 'No'}

Please provide the response in this exact JSON format:
{
  "title": "Roadmap Title",
  "description": "Roadmap description",
  "stages": [
    {
      "name": "Stage Name",
      "topics": [
        {
          "name": "Topic Name",
          "description": "Topic description",
          "duration": hours
        }
      ]
    }
  ]
}

Make sure the roadmap is practical, well-structured, and covers all essential topics for ${roadmapType} development.`;
  }

  // Validate and format AI-generated roadmap
  validateAndFormatRoadmap(roadmapData, roadmapType) {
    // Basic validation
    if (!roadmapData.title || !roadmapData.stages || !Array.isArray(roadmapData.stages)) {
      throw new Error('Invalid roadmap structure from AI');
    }

    // Ensure all required fields are present
    const validatedRoadmap = {
      title: roadmapData.title,
      description: roadmapData.description || `AI-generated ${roadmapType} roadmap`,
      stages: roadmapData.stages.map(stage => ({
        name: stage.name,
        topics: stage.topics.map(topic => ({
          name: topic.name,
          description: topic.description,
          duration: topic.duration || 20 // Default duration
        }))
      }))
    };

    return validatedRoadmap;
  }

  // Get available roadmap types
  getAvailableRoadmaps() {
    return Object.keys(this.roadmaps).map(key => ({
      id: key,
      title: this.roadmaps[key].title,
      description: this.roadmaps[key].description
    }));
  }

  // Get roadmap by type
  getRoadmap(type) {
    return this.roadmaps[type] || null;
  }

  // Convert roadmap to curriculum format
  async convertToCurriculum(roadmapType, duration = 90, preferences = {}) {
    let roadmap;
    
    // Try AI generation first, fallback to static data
    try {
      console.log(`Generating AI roadmap for ${roadmapType}...`);
      roadmap = await this.generateRoadmapWithAI(roadmapType, duration, preferences);
      console.log('AI roadmap generated successfully');
    } catch (error) {
      console.log('AI generation failed, using static roadmap:', error.message);
      roadmap = this.getRoadmap(roadmapType);
    }
    
    if (!roadmap) {
      throw new Error(`Roadmap type '${roadmapType}' not found`);
    }

    const subjects = roadmap.stages.map((stage, index) => ({
      name: stage.name,
      description: `Comprehensive study of ${stage.name}`,
      weightage: Math.round(100 / roadmap.stages.length),
      units: stage.topics.map((topic, topicIndex) => ({
        title: topic.name,
        description: topic.description,
        topics: [
          {
            name: `Introduction to ${topic.name}`,
            description: `Learn the basics of ${topic.name}`,
            difficulty: 1,
            estimatedHours: topic.duration / 5,
            prerequisites: [],
            learningObjectives: [`Understand ${topic.name} fundamentals`],
            resources: []
          },
          {
            name: `Core Concepts`,
            description: `Master core concepts of ${topic.name}`,
            difficulty: 2,
            estimatedHours: topic.duration / 5,
            prerequisites: [`Introduction to ${topic.name}`],
            learningObjectives: [`Apply ${topic.name} core concepts`],
            resources: []
          },
          {
            name: `Practical Applications`,
            description: `Apply ${topic.name} in real scenarios`,
            difficulty: 3,
            estimatedHours: topic.duration / 5,
            prerequisites: [`Core Concepts`],
            learningObjectives: [`Build practical ${topic.name} applications`],
            resources: []
          },
          {
            name: `Advanced Features`,
            description: `Explore advanced ${topic.name} features`,
            difficulty: 4,
            estimatedHours: topic.duration / 5,
            prerequisites: [`Practical Applications`],
            learningObjectives: [`Master advanced ${topic.name} features`],
            resources: []
          },
          {
            name: `Best Practices`,
            description: `Learn ${topic.name} best practices`,
            difficulty: 3,
            estimatedHours: topic.duration / 5,
            prerequisites: [`Advanced Features`],
            learningObjectives: [`Implement ${topic.name} best practices`],
            resources: []
          }
        ],
        estimatedDuration: topic.duration,
        order: topicIndex + 1
      })),
      totalHours: stage.topics.reduce((sum, topic) => sum + topic.duration, 0)
    }));

    return {
      subjects,
      totalDuration: duration,
      roadmapType,
      source: roadmap.description?.includes('AI-generated') ? 'AI-generated' : 'roadmap.sh'
    };
  }

  // Generate daily roadmap from curriculum
  generateDailyRoadmap(curriculum, duration, preferences = {}) {
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
          mood: 'good', // Default mood instead of null
          energy: 5, // Default energy level (1-10)
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
          const sessionEndTime = this.calculateEndTime(sessionStartTime, sessionDuration);
          
          const session = {
            sessionId: `day${dayNumber}_session${dayRoadmap.sessions.length + 1}`,
            subject: subject.name,
            unit: unit.title,
                         topics: topics.slice(topicIndex, topicIndex + 2).map(topic => topic.name), // 1-2 topics per session
            duration: sessionDuration * 60, // Convert to minutes
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            type: 'learning',
                         learningObjectives: [`Understand ${topics[topicIndex].name}`, `Apply concepts from ${unit.title}`],
            resources: [
              {
                type: 'video',
                                 title: `${topics[topicIndex].name} Tutorial`,
                url: `https://roadmap.sh/${curriculum.roadmapType}`,
                duration: 30
              },
              {
                type: 'article',
                                 title: `${topics[topicIndex].name} Guide`,
                url: `https://roadmap.sh/${curriculum.roadmapType}`,
                duration: 15
              }
            ],
            exercises: [
              {
                                 title: `${topics[topicIndex].name} Practice`,
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
                         goal: `Complete ${topics[topicIndex].name} in ${subject.name}`,
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
            endTime: this.calculateEndTime(dayRoadmap.sessions[dayRoadmap.sessions.length - 1].endTime, 0.25),
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

  // Helper function to calculate end time
  calculateEndTime(startTime, hours) {
    const [hours_str, minutes_str] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours_str), parseInt(minutes_str), 0);
    
    const endDate = new Date(startDate.getTime() + (hours * 60 * 60 * 1000));
    
    return endDate.toTimeString().slice(0, 5);
  }

  // Generate weekly milestones
  generateWeeklyMilestones(duration) {
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

  // Generate schedule
  generateSchedule(curriculum, duration, preferences = {}) {
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
          topics: subjectData?.units[0]?.topics.slice(0, 2).map(topic => topic.name) || [],
          duration: sessionDuration * 60,
          startTime: dayPlan.sessions.length === 0 ? '09:00' : 
                    dayPlan.sessions[dayPlan.sessions.length - 1].endTime,
          endTime: this.calculateEndTime(
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

module.exports = new RoadmapService();
