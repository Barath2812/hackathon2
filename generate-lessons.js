const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Sample student data for testing
const testStudent = {
  name: 'Test Student',
  email: 'test@example.com',
  password: 'password123',
  preferredSubjects: ['math', 'science', 'english', 'history', 'geography', 'computer-science'],
  learningStyle: { visual: 0.4, auditory: 0.3, kinesthetic: 0.3 },
  difficultyPreference: 3
};

// Sample lessons to generate
const lessonRequests = [
  { subject: 'math', difficulty: 1, topic: 'Basic Addition', numQuestions: 3 },
  { subject: 'science', difficulty: 1, topic: 'Scientific Method', numQuestions: 3 },
  { subject: 'english', difficulty: 1, topic: 'Basic Grammar', numQuestions: 3 },
  { subject: 'history', difficulty: 2, topic: 'Ancient Civilizations', numQuestions: 3 },
  { subject: 'geography', difficulty: 1, topic: 'World Continents', numQuestions: 3 },
  { subject: 'computer-science', difficulty: 2, topic: 'Algorithms', numQuestions: 3 }
];

async function generateLessons() {
  try {
    console.log('🚀 Starting lesson generation...');
    console.log('📝 Using OpenAI API key:', OPENAI_API_KEY ? 'Configured' : 'Not configured');
    
    // First, register a test student
    console.log('\n👤 Registering test student...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testStudent);
    const { token } = registerResponse.data;
    
    console.log('✅ Student registered successfully');
    
    // Set up axios with authentication
    const authAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'x-auth-token': token
      }
    });
    
    // Generate lessons
    console.log('\n📚 Generating lessons...');
    const generatedLessons = [];
    
    for (const lessonRequest of lessonRequests) {
      try {
        console.log(`\n🎯 Generating lesson: ${lessonRequest.subject} - ${lessonRequest.topic}`);
        
        const response = await authAxios.post('/ai/generate-lesson', lessonRequest);
        
        if (response.data.lesson) {
          generatedLessons.push(response.data.lesson);
          console.log(`✅ Generated: ${response.data.lesson.title}`);
        } else {
          console.log(`⚠️  Demo lesson generated for: ${lessonRequest.topic}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error generating lesson for ${lessonRequest.topic}:`, error.response?.data?.msg || error.message);
      }
    }
    
    console.log('\n📊 Generation Summary:');
    console.log(`✅ Successfully generated ${generatedLessons.length} lessons`);
    
    // Display generated lessons
    generatedLessons.forEach((lesson, index) => {
      console.log(`\n${index + 1}. ${lesson.title}`);
      console.log(`   Subject: ${lesson.subject}`);
      console.log(`   Difficulty: Level ${lesson.difficulty}`);
      console.log(`   Questions: ${lesson.questions?.length || 0}`);
    });
    
    console.log('\n🎉 Lesson generation completed!');
    console.log('💡 You can now access these lessons in the application.');
    
  } catch (error) {
    console.error('❌ Error in lesson generation:', error.response?.data?.msg || error.message);
    
    if (error.response?.status === 503) {
      console.log('\n💡 Tip: Make sure your OpenAI API key is configured in the .env file');
      console.log('   Add: OPENAI_API_KEY=your-api-key-here');
    }
  }
}

// Check if OpenAI API key is available
if (!OPENAI_API_KEY) {
  console.log('⚠️  Warning: OPENAI_API_KEY not found in environment variables');
  console.log('💡 Add your OpenAI API key to the .env file or set it as an environment variable');
  console.log('   The script will still run but will generate demo lessons instead');
}

generateLessons();
