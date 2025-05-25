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
  'A003': {
    id: 'A003',
    name: 'Emma Johnson',
    date: '2024-03-18',
    assessmentType: 'quick',
    cefr: 'A2',
    totalScore: 55,
    scores: {
      fluency: 52,
      grammar: 58,
      vocabulary: 55,
      pronunciation: 60,
      prosody: 50,
      coherence: 48,
      structure: 52
    },
    feedback: {
      overall: 'Elementary level with steady progress, showing improvement in grammar and pronunciation.',
      fluency: 'Some hesitations but better flow than typical A2 level.',
      grammar: 'Good grasp of basic structures with occasional errors.',
      vocabulary: 'Adequate range for elementary level communication.',
      pronunciation: 'Clear pronunciation with good sound recognition.',
      prosody: 'Developing natural rhythm and stress patterns.',
      coherence: 'Basic idea connection with some logical gaps.',
      structure: 'Simple but effective organization of thoughts.'
    }
  },
  'A004': {
    id: 'A004',
    name: 'David Rodriguez',
    date: '2024-03-17',
    assessmentType: 'quick',
    cefr: 'B1',
    totalScore: 75,
    scores: {
      fluency: 72,
      grammar: 75,
      vocabulary: 78,
      pronunciation: 80,
      prosody: 70,
      coherence: 68,
      structure: 72
    },
    feedback: {
      overall: 'Strong intermediate level with excellent pronunciation and good vocabulary range.',
      fluency: 'Good flow with minimal hesitations affecting communication.',
      grammar: 'Solid control of intermediate structures with few errors.',
      vocabulary: 'Good range and appropriate word choices for level.',
      pronunciation: 'Excellent clarity and accuracy in sound production.',
      prosody: 'Natural stress patterns enhancing communication.',
      coherence: 'Ideas well-connected with logical progression.',
      structure: 'Clear organization with effective use of discourse markers.'
    }
  },
  'A005': {
    id: 'A005',
    name: 'James Wilson',
    date: '2024-03-19',
    assessmentType: 'quick',
    cefr: 'B2',
    totalScore: 82,
    scores: {
      fluency: 80,
      grammar: 85,
      vocabulary: 82,
      pronunciation: 85,
      prosody: 78,
      coherence: 80,
      structure: 84
    },
    feedback: {
      overall: 'Strong upper-intermediate level with excellent grammar control and clear communication.',
      fluency: 'Smooth delivery with natural pace and minimal hesitation.',
      grammar: 'Excellent control of complex structures with rare errors.',
      vocabulary: 'Wide range with precise and appropriate usage.',
      pronunciation: 'Very clear with native-like features in many areas.',
      prosody: 'Effective use of stress and intonation for meaning.',
      coherence: 'Well-organized ideas with clear logical connections.',
      structure: 'Sophisticated organization with varied discourse markers.'
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
  },
  'F003': {
    id: 'F003',
    name: 'Lisa Wang',
    date: '2024-03-12',
    assessmentType: 'full',
    overallCefr: 'C2',
    totalScore: 96,
    scores: {
      // Speaking skills
      fluency: 95,
      grammar: 96,
      vocabulary: 98,
      pronunciation: 94,
      prosody: 95,
      coherence: 97,
      structure: 95,
      // Other skills
      listening: 98,
      reading: 99,
      writing: 92
    },
    feedback: {
      overall: 'Outstanding C2 level performance demonstrating near-native proficiency across all skills.',
      speaking: 'Exceptional fluency and precision with sophisticated discourse management.',
      listening: 'Perfect comprehension of complex and nuanced spoken language.',
      reading: 'Excellent reading comprehension with full understanding of implicit meaning.',
      writing: 'Highly sophisticated writing with excellent coherence and style.',
      fluency: 'Effortless and natural delivery with perfect rhythm.',
      grammar: 'Flawless control of all grammatical structures.',
      vocabulary: 'Extensive and precise vocabulary with idiomatic usage.',
      pronunciation: 'Native-like pronunciation with perfect intelligibility.',
      prosody: 'Masterful use of stress, rhythm, and intonation.',
      coherence: 'Perfectly organized with seamless logical connections.',
      structure: 'Highly sophisticated organizational patterns and discourse management.'
    }
  }
};
