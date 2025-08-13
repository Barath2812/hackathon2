# AI Features Setup Guide

## Overview
This application includes AI-powered features for generating personalized lessons, subjects, and learning content using OpenAI's GPT models.

## Prerequisites
1. Node.js (version 18 or higher)
2. MongoDB database
3. OpenAI API key

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key and paste it in your `.env` file

### 3. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
```

### 4. Start the Application

```bash
# Start both server and client
npm run dev

# Or start them separately
npm run server  # Backend only
npm run client  # Frontend only
```

## AI Features Available

### 1. Generate Subjects
- **Route**: `POST /api/ai/generate-subjects`
- **Purpose**: Generate personalized subject recommendations based on student interests
- **Input**: interests, currentLevel, learningGoals

### 2. Generate All Subjects
- **Route**: `POST /api/ai/generate-all-subjects`
- **Purpose**: Generate comprehensive information about all available subjects
- **Input**: None (uses student profile)

### 3. Generate Lessons
- **Route**: `POST /api/ai/generate-lesson`
- **Purpose**: Create personalized lessons with questions and explanations
- **Input**: subject, difficulty, topic, numQuestions

### 4. Generate Micro-Quizzes
- **Route**: `POST /api/ai/generate-micro-quiz`
- **Purpose**: Create targeted practice based on student mistakes
- **Input**: mistake, topic, difficulty, studentAnswer

### 5. Get Personalized Explanations
- **Route**: `POST /api/ai/get-personalized-explanation`
- **Purpose**: Provide tailored explanations for questions
- **Input**: question, studentAnswer, isCorrect, topic

### 6. Adjust Difficulty
- **Route**: `POST /api/ai/adjust-difficulty`
- **Purpose**: AI-powered difficulty adjustment based on performance
- **Input**: currentDifficulty, performance, timeSpent, mistakes

### 7. Get Encouragement
- **Route**: `POST /api/ai/get-encouragement`
- **Purpose**: Provide personalized motivational messages
- **Input**: performance, streak, topic

### 8. Learning Insights
- **Route**: `GET /api/ai/learning-insights`
- **Purpose**: Generate AI-powered learning analytics and recommendations
- **Input**: None (uses student data)

## Troubleshooting

### Common Issues

1. **"AI features are currently unavailable"**
   - Check if `OPENAI_API_KEY` is set in your `.env` file
   - Verify the API key is valid and has sufficient credits

2. **"Failed to generate lesson"**
   - Check server logs for detailed error messages
   - Ensure MongoDB is running and accessible
   - Verify the student is authenticated

3. **JSON parsing errors**
   - The AI response might not be properly formatted
   - Check the OpenAI API response format
   - Ensure the prompt is generating valid JSON

4. **Rate limiting**
   - OpenAI has rate limits on API calls
   - Implement proper error handling for rate limit responses
   - Consider implementing request queuing for high-volume usage

### Debug Mode

To enable detailed error messages, set:
```env
NODE_ENV=development
```

This will show full error details in API responses.

### Testing AI Features

1. **Test with Demo Mode**: When AI is not configured, the app provides demo responses
2. **Check API Key**: Verify your OpenAI API key is working with a simple test
3. **Monitor Logs**: Check server console for detailed error messages
4. **Test Individual Routes**: Use tools like Postman to test API endpoints directly

## Security Considerations

1. **API Key Security**: Never commit your `.env` file to version control
2. **Rate Limiting**: Implement proper rate limiting to prevent abuse
3. **Input Validation**: Validate all user inputs before sending to AI APIs
4. **Error Handling**: Don't expose sensitive information in error messages

## Cost Optimization

1. **Token Usage**: Monitor your OpenAI API usage to control costs
2. **Caching**: Consider caching AI responses for similar requests
3. **Batch Processing**: Group similar requests to reduce API calls
4. **Model Selection**: Use appropriate models for different tasks (GPT-3.5-turbo vs GPT-4)

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your environment configuration
3. Test the OpenAI API key independently
4. Review the troubleshooting section above

