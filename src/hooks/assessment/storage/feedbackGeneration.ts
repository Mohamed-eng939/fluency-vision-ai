
import { AudioAnalysisResult, CEFRLevel } from '@/types/assessment';

/**
 * Generate smart feedback based on actual performance metrics
 */
export const generateSmartFeedback = (
  metrics: any, 
  audioAnalysis: AudioAnalysisResult, 
  cefrLevel: CEFRLevel, 
  taskCount: number
) => {
  const fluencyScore = metrics.fluency * 10;
  const grammarScore = metrics.grammar * 10;
  const vocabularyScore = metrics.vocabulary * 10;
  const pronunciationScore = metrics.pronunciation * 10;
  
  // Smart fluency feedback based on actual metrics
  let fluencyFeedback = "";
  if (audioAnalysis.wpm === 0 || audioAnalysis.wpm < 60) {
    fluencyFeedback = `Work on increasing speech tempo and reducing hesitation. Current speaking rate needs improvement for ${cefrLevel} level.`;
  } else if (fluencyScore > 70) {
    fluencyFeedback = `Excellent fluency for ${cefrLevel} level. Natural speaking rhythm with minimal hesitation.`;
  } else if (fluencyScore > 50) {
    fluencyFeedback = `Good fluency for ${cefrLevel} level, with some areas for improvement in speech flow.`;
  } else {
    fluencyFeedback = `Work on reducing hesitation and increasing speech tempo to reach ${cefrLevel} level standards.`;
  }

  // Smart grammar feedback
  let grammarFeedback = "";
  if (grammarScore > 70) {
    grammarFeedback = `Strong grammatical accuracy for ${cefrLevel} level with minimal errors.`;
  } else if (grammarScore > 50) {
    grammarFeedback = `Adequate grammar control for ${cefrLevel} level with some areas for improvement.`;
  } else {
    grammarFeedback = `Focus on improving grammatical accuracy to meet ${cefrLevel} level standards.`;
  }

  // Smart vocabulary feedback
  let vocabularyFeedback = "";
  if (vocabularyScore > 70) {
    vocabularyFeedback = `Strong vocabulary range appropriate for ${cefrLevel} level.`;
  } else if (vocabularyScore > 50) {
    vocabularyFeedback = `Good vocabulary usage for ${cefrLevel} level - consider expanding range.`;
  } else {
    vocabularyFeedback = `Work on expanding vocabulary range to meet ${cefrLevel} level expectations.`;
  }

  // Smart pronunciation feedback
  let pronunciationFeedback = "";
  if (pronunciationScore > 70) {
    pronunciationFeedback = `Clear pronunciation suitable for ${cefrLevel} level.`;
  } else if (pronunciationScore > 50) {
    pronunciationFeedback = `Generally clear pronunciation with some areas for improvement at ${cefrLevel} level.`;
  } else {
    pronunciationFeedback = `Focus on pronunciation clarity to improve comprehensibility at ${cefrLevel} level.`;
  }

  return {
    fluency: fluencyFeedback,
    grammar: grammarFeedback,
    vocabulary: vocabularyFeedback,
    pronunciation: pronunciationFeedback,
    prosody: `Prosody analysis ${audioAnalysis.prosodyAnalysis?.failureReason ? 
      `not available (${audioAnalysis.prosodyAnalysis.userFriendlyMessage || audioAnalysis.prosodyAnalysis.failureReason})` : 
      `completed successfully for ${cefrLevel} level`}`,
    coherence: `Coherence and organization appropriate for ${cefrLevel} level based on ${taskCount} speaking tasks.`,
    syntax: `Sentence complexity suitable for ${cefrLevel} level.`,
    overall: `Comprehensive assessment based on ${taskCount} speaking tasks demonstrates ${cefrLevel} level proficiency.`
  };
};
