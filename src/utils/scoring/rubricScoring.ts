
import { AssessmentQuestion } from '../../types/assessment';

/**
 * Calculate score based on rubric criteria
 * @param userAnswers User's answers to the questions
 * @param questions Questions with their rubrics
 */
export const calculateRubricScore = (
  userAnswers: Record<string, any>,
  questions: AssessmentQuestion[]
): { score: number; criteriaScores: Record<string, number> } => {
  // Initialize scores object
  const criteriaScores: Record<string, number> = {};
  let totalAvailablePoints = 0;
  let totalEarnedPoints = 0;
  
  // Process each question with a rubric
  questions.forEach(question => {
    if (!question.rubric) return;
    
    const answer = userAnswers[question.id];
    if (!answer) return;
    
    // Evaluate each criterion in the rubric
    question.rubric.criteria.forEach(criterion => {
      // For this mock implementation, we assign a score between 1-5 based on pre-defined logic
      // In a real app, this would use AI or more complex evaluation
      const score = getScoreForCriterion(criterion, answer, question);
      
      // Add to criteria scores
      if (!criteriaScores[criterion]) {
        criteriaScores[criterion] = 0;
      }
      criteriaScores[criterion] += score;
      
      // Add to totals
      totalAvailablePoints += 5; // Maximum score per criterion is 5
      totalEarnedPoints += score;
    });
  });
  
  // Calculate percentage score (0-100)
  const score = totalAvailablePoints > 0 
    ? (totalEarnedPoints / totalAvailablePoints) * 100 
    : 0;
  
  return { score, criteriaScores };
};

/**
 * Mock function to calculate a score for a specific criterion
 * In a real app, this would use AI or more complex evaluation
 */
export const getScoreForCriterion = (
  criterionName: string, 
  userAnswer: any, 
  question: AssessmentQuestion
): number => {
  // Mock evaluation logic - in a real app, this would be more sophisticated
  if (typeof userAnswer === 'string') {
    // For text answers, evaluate based on length and complexity
    if (userAnswer.length > 100) return 4; // Good length
    if (userAnswer.length > 50) return 3; // Moderate length
    if (userAnswer.length > 20) return 2; // Short but acceptable
    return 1; // Too short
  }
  
  // For multiple choice or matching questions
  if (question.correctAnswer) {
    if (Array.isArray(question.correctAnswer)) {
      // For multiple correct answers
      if (Array.isArray(userAnswer)) {
        const correctCount = userAnswer.filter(ans => 
          question.correctAnswer!.includes(ans)
        ).length;
        const totalCorrect = question.correctAnswer.length;
        return Math.ceil((correctCount / totalCorrect) * 5);
      }
    } else {
      // Single correct answer
      return userAnswer === question.correctAnswer ? 5 : 1;
    }
  }
  
  // Default score for other types
  return 3;
};
