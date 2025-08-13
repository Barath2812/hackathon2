# Learning Platform Issues - Fix Plan

## Issues Identified:

1. **Generate AI Lesson**: Only generating one quiz instead of modules and multiple quizzes
2. **Choose Roadmap**: Not working properly 
3. **Create Daily Roadmap**: Not working properly
4. **Create Learning Plan**: Not working properly
5. **Using Qwen 3 free API**: Need to optimize API calls and error handling

## Information Gathered:

### Current Implementation Analysis:
- **AI Lesson Generation** (`routes/ai.js`): 
  - Currently generates single lesson with questions array
  - Missing module-based structure
  - Not utilizing the ModuleSchema from Lesson model
  - API prompt doesn't request multiple modules
  - `formData.numQuestions` referenced but not defined in frontend

- **Learning Plans** (`routes/learning-plans.js`):
  - Has comprehensive roadmap generation logic
  - Uses fallback to roadmapService when AI fails
  - Frontend shows proper UI but backend may have API issues

- **Roadmap Service** (`utils/roadmapService.js`):
  - Has good fallback data structure
  - AI integration with OpenRouter
  - Proper error handling with fallbacks

- **Frontend Components**:
  - LessonGenerator.jsx: Basic form, doesn't support module/quiz count selection
  - LearningPlanDashboard.jsx: Comprehensive UI with proper error handling

### Root Causes:
1. **AI Lesson Generation**: Prompt doesn't request modular structure
2. **API Error Handling**: Insufficient error handling for Qwen API failures
3. **Frontend-Backend Mismatch**: Frontend doesn't send required parameters
4. **Missing Module Support**: Lesson generation doesn't use module-based structure

## Detailed Fix Plan:

### Phase 1: Fix AI Lesson Generation (Generate multiple modules and quizzes) ✅
- [x] Update AI prompt in `routes/ai.js` to request modular lesson structure
- [x] Modify lesson creation to use ModuleSchema with multiple modules
- [x] Add support for multiple quizzes per module
- [x] Update frontend to allow selection of module count and quiz count
- [x] Fix `formData.numQuestions` reference error
- [x] Add demo lesson generator with modules for fallback

### Phase 2: Fix Learning Plan Generation Issues ✅
- [x] Improve error handling in learning plan generation
- [x] Fix API timeout issues with Qwen API (increased timeout to 45s)
- [x] Enhance fallback mechanisms with retry logic
- [x] Add better user feedback for API failures

### Phase 3: Fix Roadmap Selection Issues ✅
- [x] Debug roadmap service API calls
- [x] Improve error handling in roadmap generation
- [x] Add better fallback for when AI generation fails
- [x] Fix frontend error display with detailed messages

### Phase 4: Optimize Qwen API Usage ✅
- [x] Add request timeout handling (45 seconds)
- [x] Implement retry logic for failed requests (2 retries)
- [x] Add better error messages for API failures
- [x] Optimize prompts for better responses

### Phase 5: Testing and Validation
- [ ] Test all lesson generation scenarios
- [ ] Test roadmap creation with different parameters
- [ ] Test learning plan generation
- [ ] Verify error handling works properly

## Files to be Modified:

### Backend Files:
1. `routes/ai.js` - Fix lesson generation with modules and multiple quizzes
2. `routes/learning-plans.js` - Improve error handling and API calls
3. `utils/roadmapService.js` - Enhance fallback mechanisms

### Frontend Files:
1. `client/src/components/ai/LessonGenerator.jsx` - Add module/quiz count options
2. `client/src/components/learning-plans/LearningPlanDashboard.jsx` - Improve error handling

### Follow-up Steps:
- [ ] Test with Qwen API to ensure proper responses
- [ ] Add logging for debugging API issues
- [ ] Create user-friendly error messages
- [ ] Add loading states for better UX
