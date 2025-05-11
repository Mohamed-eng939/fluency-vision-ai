
import { AssessmentMetrics } from "../../types/assessment";

export const generateRecommendations = (metrics: AssessmentMetrics, count: number = 2) => {
  // Convert metrics to array for sorting
  const metricsArray = [
    { name: 'Fluency', value: metrics.fluency * 10 },
    { name: 'Grammar', value: metrics.grammar * 10 },
    { name: 'Pronunciation', value: metrics.pronunciation * 10 },
    { name: 'Prosody', value: metrics.prosody * 10 },
    { name: 'Vocabulary', value: metrics.vocabulary * 10 },
    { name: 'Syntax', value: metrics.syntax * 10 },
    { name: 'Coherence', value: metrics.coherence * 10 },
  ];
  
  // Find the lowest scoring areas
  const sortedMetrics = [...metricsArray].sort((a, b) => a.value - b.value);
  const lowestAreas = sortedMetrics.slice(0, count);
  
  const recommendations = {
    'Fluency': [
      'Practice speaking aloud for 10 minutes daily',
      'Record yourself speaking and listen back to identify hesitations',
      'Join a language exchange or conversation club'
    ],
    'Grammar': [
      'Review verb tenses that you find challenging',
      'Work through targeted grammar exercises on your weak points',
      'Use a grammar checker tool when writing'
    ],
    'Pronunciation': [
      'Focus on specific sounds you find difficult',
      'Practice minimal pairs (words that differ by one sound)',
      'Shadow native speakers\' speech from videos or podcasts'
    ],
    'Prosody': [
      'Practice sentence stress and intonation patterns',
      'Read aloud texts with clear emotional content',
      'Listen and repeat techniques with audio materials'
    ],
    'Vocabulary': [
      'Create flashcards for new words in your field',
      'Read extensively in topics of interest',
      'Practice using new vocabulary in sentences'
    ],
    'Syntax': [
      'Practice sentence combining exercises',
      'Analyze complex sentences from academic texts',
      'Write daily and focus on varying your sentence structures'
    ],
    'Coherence': [
      'Practice using transition words and phrases',
      'Create outlines before speaking or writing',
      'Record yourself explaining a complex topic and review for clarity'
    ]
  };

  return lowestAreas.map(area => ({
    area: area.name,
    tips: recommendations[area.name as keyof typeof recommendations]
  }));
};
