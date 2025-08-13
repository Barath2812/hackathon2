// utils/promptBuilder.js
function buildLessonPrompt(student, formData) {
    const {
      topic,
      subject,
      difficulty,
      learningStyle,
      duration,
      syllabusType,
      medium,
      degree,
      branch,
      interestTopics,
      prepareFor
    } = formData;
  
    let studentDetails = `
  Student Profile:
  - Type: ${student.studentType}
  - Age: ${student.age}
  - Current Level: ${student.currentLevel}
  - Learning Style: ${JSON.stringify(learningStyle || student.learningStyle || "Not specified")}
  - Preferred Subjects: ${student.preferredSubjects?.join(', ') || 'Not specified'}
  `;
  
    if (student.studentType === "school") {
      studentDetails += `- Class/Standard: ${formData.standard || 'Not specified'}
  - Syllabus Type: ${syllabusType || 'Not specified'}
  - Medium of Study: ${medium || 'Not specified'}
  - NEET/JEE Preparation: ${prepareFor || 'No'}
  `;
    } else if (student.studentType === "college") {
      studentDetails += `- Degree: ${degree || 'Not specified'}
  - Branch: ${branch || 'Not specified'}
  - Topics of Interest: ${interestTopics?.join(', ') || 'Not specified'}
  `;
    }
  
    return `
  Generate a personalized lesson based on the following details:
  
  ${studentDetails}
  
  Lesson Requirements:
  - Topic: ${topic}
  - Subject: ${subject}
  - Difficulty Level: ${difficulty}/10
  - Duration: ${duration} minutes
  
  Format output as valid JSON:
  {
    "title": "Lesson title",
    "content": "Detailed content",
    "summary": "Short summary",
    "exercises": ["ex1", "ex2"],
    "resources": ["res1", "res2"],
    "assessment": {
      "questions": [
        {
          "question": "Question text",
          "type": "multiple-choice",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "correctAnswer": "opt1",
          "explanation": "Detailed explanation",
          "difficulty": ${difficulty}
        }
      ]
    },
    "estimatedDuration": ${duration},
    "difficulty": ${difficulty}
  }`;
  }
  
  function buildLearningPlanPrompt(student, formData) {
    let studentDetails = `
  Student Profile:
  - Type: ${student.studentType}
  - Age: ${student.age}
  - Current Level: ${student.currentLevel}
  - Preferred Subjects: ${student.preferredSubjects?.join(', ') || 'Not specified'}
  `;
  
    if (student.studentType === "school") {
      studentDetails += `- Class: ${formData.standard || 'Not specified'}
  - Syllabus: ${formData.syllabusType || 'Not specified'}
  - Medium: ${formData.medium || 'Not specified'}
  `;
    } else {
      studentDetails += `- Degree: ${formData.degree || 'Not specified'}
  - Branch: ${formData.branch || 'Not specified'}
  - Interests: ${formData.interestTopics?.join(', ') || 'Not specified'}
  `;
    }
  
    return `
  Generate a weekly learning plan for the following student:
  
  ${studentDetails}
  
  Plan Requirements:
  - Include a weekly schedule with subjects, topics, and time allocation
  - Add gamification: milestones, challenges, rewards
  - Ensure it is adaptive and engaging
  
  Return only valid JSON.
  `;
  }
  
  module.exports = {
    buildLessonPrompt,
    buildLearningPlanPrompt
  };
  