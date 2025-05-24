export const reportData: Record<string, any> = {
  'A001': {
    id: 'A001',
    name: 'Alex Chen',
    date: '2024-03-15',
    assessmentType: 'quick',
    cefr: 'B1',
    totalScore: 67,
    scores: {
      fluency: 65,
      grammar: 70,
      vocabulary: 68,
      pronunciation: 72,
      prosody: 66,
      coherence: 63,
      structure: 65
    },
    feedback: {
      overall: 'Good intermediate level performance with room for improvement in coherence and structure.',
      fluency: 'Shows good rhythm and pace with occasional hesitations.',
      grammar: 'Generally accurate with some complex structure errors.',
      vocabulary: 'Appropriate range for level with some imprecision.',
      pronunciation: 'Clear and generally accurate pronunciation.',
      prosody: 'Natural stress and intonation patterns.',
      coherence: 'Ideas connect but could be more logically organized.',
      structure: 'Basic organization present but needs development.'
    }
  },
  'A002': {
    id: 'A002',
    name: 'Maria Rodriguez',
    date: '2024-03-16',
    assessmentType: 'quick',
    cefr: 'A2',
    totalScore: 45,
    scores: {
      fluency: 42,
      grammar: 48,
      vocabulary: 45,
      pronunciation: 50,
      prosody: 40,
      coherence: 38,
      structure: 42
    },
    feedback: {
      overall: 'Elementary level with good pronunciation but needs work on fluency and coherence.',
      fluency: 'Frequent pauses and hesitations affect flow.',
      grammar: 'Basic structures used with some accuracy.',
      vocabulary: 'Limited range but appropriate for level.',
      pronunciation: 'Good individual sound production.',
      prosody: 'Somewhat flat intonation patterns.',
      coherence: 'Struggles to connect ideas effectively.',
      structure: 'Very basic organization of responses.'
    }
  },
  'F001': {
    id: 'F001',
    name: 'John Smith',
    date: '2024-03-14',
    assessmentType: 'full',
    overallCefr: 'B2',
    totalScore: 78,
    scores: {
      // Speaking skills
      fluency: 75,
      grammar: 78,
      vocabulary: 76,
      pronunciation: 80,
      prosody: 74,
      coherence: 72,
      structure: 73,
      // Other skills
      listening: 82,
      reading: 85,
      writing: 70
    },
    feedback: {
      overall: 'Strong B2 level performance across all skills with particular strength in receptive skills.',
      speaking: 'Confident and fluent speaking with good range of vocabulary and structures.',
      listening: 'Excellent comprehension of complex spoken texts.',
      reading: 'Strong reading skills with good inference abilities.',
      writing: 'Good writing ability but needs work on complex argumentation.',
      fluency: 'Smooth and natural delivery with minimal hesitation.',
      grammar: 'Good control of complex structures with minor errors.',
      vocabulary: 'Wide range appropriate for level and context.',
      pronunciation: 'Very clear with good stress and rhythm.',
      prosody: 'Natural intonation enhancing communication.',
      coherence: 'Well-organized ideas with good logical flow.',
      structure: 'Clear organization with effective paragraphing.'
    }
  },
  'F002': {
    id: 'F002',
    name: 'Sarah Johnson',
    date: '2024-03-13',
    assessmentType: 'full',
    overallCefr: 'C1',
    totalScore: 88,
    scores: {
      // Speaking skills
      fluency: 85,
      grammar: 88,
      vocabulary: 90,
      pronunciation: 87,
      prosody: 85,
      coherence: 89,
      structure: 86,
      // Other skills
      listening: 92,
      reading: 94,
      writing: 82
    },
    feedback: {
      overall: 'Excellent C1 level performance demonstrating advanced language proficiency.',
      speaking: 'Highly fluent and articulate with sophisticated language use.',
      listening: 'Outstanding comprehension even with complex academic content.',
      reading: 'Excellent reading comprehension with nuanced understanding.',
      writing: 'Good writing skills but occasional minor structural issues.',
      fluency: 'Very smooth delivery with natural pace and rhythm.',
      grammar: 'Excellent control of complex grammatical structures.',
      vocabulary: 'Sophisticated and precise vocabulary choices.',
      pronunciation: 'Native-like pronunciation with excellent clarity.',
      prosody: 'Highly effective use of stress and intonation.',
      coherence: 'Exceptionally well-organized and logical presentation.',
      structure: 'Sophisticated organizational patterns.'
    }
  }
};
