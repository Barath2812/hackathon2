const fs = require('fs');
const path = require('path');

console.log('🔧 MongoDB Setup Instructions\n');

console.log('📋 To fix the MongoDB connection issue, you have two options:\n');

console.log('Option 1: Install MongoDB Locally (Recommended)');
console.log('1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community');
console.log('2. Install it on your system');
console.log('3. Start MongoDB service');
console.log('4. The app will automatically connect to: mongodb://localhost:27017/ai-tutor\n');

console.log('Option 2: Use MongoDB Atlas (Cloud)');
console.log('1. Go to: https://www.mongodb.com/atlas');
console.log('2. Create a free account and cluster');
console.log('3. Get your connection string');
console.log('4. Update your .env file with: MONGODB_URI=your-atlas-connection-string\n');

console.log('Option 3: Use Docker (Advanced)');
console.log('1. Install Docker Desktop');
console.log('2. Run: docker run -d -p 27017:27017 --name mongodb mongo:latest');
console.log('3. MongoDB will be available at: mongodb://localhost:27017\n');

console.log('💡 Quick Fix: The app is now configured to use local MongoDB by default.');
console.log('   If you have MongoDB installed locally, just restart the server and it should work!');

// Create a simple .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `# MongoDB Connection (Local)
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API Key (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Server Port
PORT=5000
`;

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Created .env file with local MongoDB configuration');
  } else {
    console.log('\n⚠️  .env file already exists');
    console.log('📝 Please make sure MONGODB_URI is set to: mongodb://localhost:27017/ai-tutor');
  }
} catch (error) {
  console.log('\n❌ Could not create .env file automatically');
  console.log('📝 Please create a .env file manually with the following content:');
  console.log(envContent);
}

console.log('\n🚀 After setting up MongoDB, restart your server with: npm start');

