const roadmapService = require('./utils/roadmapService');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const LearningPlan = require('./models/LearningPlan');

console.log('🔧 Testing Roadmap Generation Fix');
console.log('='.repeat(50));

async function testRoadmapFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('✅ Connected to MongoDB');

    // Create a test student
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const student = new Student({
      name: 'Test Student',
      email: 'test@example.com',
      password: hashedPassword,
      studentType: 'college',
      age: 20,
      learningStyle: { visual: 0.4, auditory: 0.3, kinesthetic: 0.3 },
      difficultyPreference: 5,
      preferredSubjects: ['computer-science'],
      collegeDetails: {
        degree: 'Bachelor of Technology',
        branch: 'Computer Science',
        year: 2,
        technologies: [{ name: 'JavaScript', proficiency: 5 }],
        careerGoals: ['Full Stack Developer'],
        learningObjectives: ['Web Development']
      }
    });
    
    await student.save();
    console.log('✅ Test student created');

    // Test roadmap generation
    console.log('\n🧪 Testing roadmap generation...');
    
    const curriculum = await roadmapService.convertToCurriculum('frontend', 30, {
      weeklyStudyDays: 5,
      studyOnWeekends: false
    });
    console.log('✅ Curriculum generated');

    const dailyRoadmap = roadmapService.generateDailyRoadmap(curriculum, 30, {
      weeklyStudyDays: 5,
      studyOnWeekends: false
    });
    console.log('✅ Daily roadmap generated');

    const weeklyMilestones = roadmapService.generateWeeklyMilestones(30);
    console.log('✅ Weekly milestones generated');

    const schedule = roadmapService.generateSchedule(curriculum, 30, {
      weeklyStudyDays: 5,
      studyOnWeekends: false
    });
    console.log('✅ Schedule generated');

    // Test creating learning plan
    console.log('\n📚 Testing learning plan creation...');
    
    const learningPlan = new LearningPlan({
      student: student._id,
      planType: 'roadmap-based',
      title: 'Frontend Development Roadmap',
      description: 'Test learning plan',
      startDate: new Date(),
      endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
      dailyRoadmap: dailyRoadmap.slice(0, 7), // Just first week
      weeklyMilestones: weeklyMilestones.slice(0, 4), // Just first 4 weeks
      curriculum: curriculum,
      schedule: schedule,
      progress: {
        completedUnits: [],
        completedTopics: [],
        currentUnit: {
          subject: curriculum.subjects[0]?.name || 'General',
          unit: curriculum.subjects[0]?.units[0]?.title || 'Introduction',
          progress: 0
        },
        overallProgress: 0,
        dailyProgress: [],
        weeklyProgress: []
      },
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
        milestones: [
          {
            title: '25% Complete',
            description: 'Complete 25% of your learning plan',
            targetProgress: 25,
            reward: '250 points',
            achieved: false
          }
        ],
        challenges: [
          {
            title: '7-Day Streak',
            description: 'Study for 7 consecutive days',
            type: 'streak',
            target: 7,
            reward: '100 points',
            completed: false
          }
        ],
        dailyChallenges: [
          {
            title: 'Early Bird',
            description: 'Start studying before 9 AM',
            type: 'timing',
            target: 1,
            reward: '50 points',
            isCompleted: false
          }
        ]
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
    console.log('✅ Learning plan created successfully!');

    console.log('\n📊 Learning Plan Details:');
    console.log(`- Title: ${learningPlan.title}`);
    console.log(`- Student: ${learningPlan.student}`);
    console.log(`- Daily Roadmap Days: ${learningPlan.dailyRoadmap.length}`);
    console.log(`- Weekly Milestones: ${learningPlan.weeklyMilestones.length}`);
    console.log(`- Curriculum Subjects: ${learningPlan.curriculum.subjects.length}`);
    console.log(`- Schedule Days: ${learningPlan.schedule.weeklyPlan.length}`);

    // Test schedule structure
    if (learningPlan.schedule.weeklyPlan.length > 0) {
      const firstDay = learningPlan.schedule.weeklyPlan[0];
      console.log(`\n📅 First Day (${firstDay.day}):`);
      console.log(`- Sessions: ${firstDay.sessions.length}`);
      if (firstDay.sessions.length > 0) {
        const firstSession = firstDay.sessions[0];
        console.log(`- First Session: ${firstSession.subject} - ${firstSession.unit}`);
        console.log(`- Topics: ${firstSession.topics.join(', ')}`);
        console.log(`- Duration: ${firstSession.duration} minutes`);
      }
    }

    console.log('\n🎉 All tests passed! Roadmap generation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}:`, error.errors[key].message);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testRoadmapFix();


