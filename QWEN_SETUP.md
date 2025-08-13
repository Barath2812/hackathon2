# Qwen AI Setup Guide

## Overview
This application uses Qwen AI (from Alibaba Cloud) for generating personalized lessons and educational content.

## Prerequisites
1. Node.js (version 18 or higher)
2. MongoDB database
3. Qwen API key from Alibaba Cloud DashScope

## Setup Instructions

### 1. Get Qwen API Key

1. Visit [Alibaba Cloud DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up or log in to your Alibaba Cloud account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key (it should start with `sk-`)

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# Qwen AI API Configuration
QWEN_API_KEY=sk-your_actual_qwen_api_key_here

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

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

## Qwen AI Features Available

### 1. Generate Lessons
- **Route**: `POST /api/ai/generate-lesson`
- **Purpose**: Create personalized lessons with questions and explanations
- **Input**: topic, subject, difficulty, learningStyle, duration

### 2. Generate Micro-Quizzes
- **Route**: `POST /api/ai/generate-micro-quiz`
- **Purpose**: Create targeted practice based on student mistakes
- **Input**: mistake, topic, difficulty, studentAnswer

### 3. Get Personalized Explanations
- **Route**: `POST /api/ai/get-personalized-explanation`
- **Purpose**: Provide tailored explanations for questions
- **Input**: question, studentAnswer, isCorrect, topic

### 4. Adjust Difficulty
- **Route**: `POST /api/ai/adjust-difficulty`
- **Purpose**: AI-powered difficulty adjustment based on performance
- **Input**: currentDifficulty, performance, timeSpent, mistakes

### 5. Get Encouragement
- **Route**: `POST /api/ai/get-encouragement`
- **Purpose**: Provide personalized motivational messages
- **Input**: performance, streak, topic

### 6. Learning Insights
- **Route**: `GET /api/ai/learning-insights`
- **Purpose**: Generate AI-powered learning analytics and recommendations
- **Input**: None (uses student data)

### 7. Generate Subjects
- **Route**: `POST /api/ai/generate-subjects`
- **Purpose**: Generate personalized subject recommendations
- **Input**: interests, currentLevel, learningGoals

### 8. Generate All Subjects
- **Route**: `POST /api/ai/generate-all-subjects`
- **Purpose**: Generate comprehensive subject information
- **Input**: None (uses student profile)

## Troubleshooting

### Common Issues

1. **"Qwen API key not configured"**
   - Check if `QWEN_API_KEY` is set in your `.env` file
   - Verify the API key starts with `sk-`
   - Ensure the API key is valid and has sufficient credits

2. **"Invalid API-key provided"**
   - Your API key is invalid or expired
   - Generate a new API key from DashScope console
   - Check if your account has sufficient balance

3. **"API request timed out"**
   - Network connectivity issues
   - Qwen API service might be slow
   - Try again after a few minutes

4. **"Failed to generate lesson"**
   - Check server logs for detailed error messages
   - Ensure MongoDB is running and accessible
   - Verify the student is authenticated

5. **JSON parsing errors**
   - The AI response might not be properly formatted
   - Check the Qwen API response format
   - Ensure the prompt is generating valid JSON

### Debug Mode

To enable detailed error messages, set:
```env
NODE_ENV=development
```

This will show full error details in API responses.

### Testing Qwen AI Features

1. **Test with Demo Mode**: When AI is not configured, the app provides demo responses
2. **Check API Key**: Verify your Qwen API key is working with a simple test
3. **Monitor Logs**: Check server console for detailed error messages
4. **Test Individual Routes**: Use tools like Postman to test API endpoints directly

## Qwen API Models Used

- **qwen-turbo**: Fast and efficient model for general text generation
- **qwen-plus**: More capable model for complex tasks (if needed)

## Cost Optimization

1. **Token Usage**: Monitor your Qwen API usage to control costs
2. **Caching**: Consider caching AI responses for similar requests
3. **Batch Processing**: Group similar requests to reduce API calls
4. **Model Selection**: Use appropriate models for different tasks

## Security Considerations

1. **API Key Security**: Never commit your `.env` file to version control
2. **Rate Limiting**: Implement proper rate limiting to prevent abuse
3. **Input Validation**: Validate all user inputs before sending to AI APIs
4. **Error Handling**: Don't expose sensitive information in error messages

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your environment configuration
3. Test the Qwen API key independently
4. Review the troubleshooting section above
5. Check [Qwen API Documentation](https://help.aliyun.com/zh/dashscope/)

## Demo Mode

When the Qwen API key is not configured, the application will:
- Create demo lessons with sample content
- Provide placeholder responses for AI features
- Allow testing of the application structure without API costs



