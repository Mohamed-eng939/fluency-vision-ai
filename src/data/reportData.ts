
// Enhanced dummy data with both quick and full assessment types
export const reportData: Record<string, any> = {
  "A001": {
    id: "A001",
    name: "Sarah Martinez",
    email: "sarah.martinez@email.com",
    date: "2025-05-24",
    testType: "Full Assessment",
    assessmentType: "quick",
    prompt: "Describe your ideal workplace environment and explain why it would help you be more productive. Include details about the physical space, team dynamics, and work culture.",
    transcript: "My ideal workplace would be somewhere that has natural light and plants because I think that makes people feel more relaxed and creative. I would like to work with people who are collaborative and supportive, not competitive in a bad way. The culture should encourage learning and trying new things without being afraid of making mistakes. I believe when people feel comfortable, they can do their best work and be more innovative.",
    cefr: "B2",
    totalScore: 85,
    scores: {
      Fluency: 82,
      Grammar: 78,
      Vocabulary: 88,
      Pronunciation: 90,
      Prosody: 85,
      Coherence: 87,
      Structure: 80
    },
    feedback: "Excellent communication with clear ideas and good vocabulary range. Your pronunciation is very strong, and you maintain good coherence throughout your response. To improve further, focus on using more complex grammatical structures and varying your sentence patterns for enhanced fluency."
  },
  "A002": {
    id: "A002", 
    name: "Michael Chen",
    email: "m.chen@company.com",
    date: "2025-05-24",
    testType: "Quick Assessment",
    assessmentType: "quick",
    prompt: "Tell me about a challenge you overcame recently and what you learned from the experience.",
    transcript: "Recently I had to present to senior management about our quarterly results. I was very nervous because it was my first time presenting to such high-level executives. I prepared extensively, practiced my presentation multiple times, and asked my colleague for feedback. During the presentation, I spoke clearly and answered their questions confidently. I learned that preparation is key to success and that I'm more capable than I initially thought.",
    cefr: "C1",
    totalScore: 92,
    scores: {
      Fluency: 95,
      Grammar: 88,
      Vocabulary: 92,
      Pronunciation: 94,
      Prosody: 90,
      Coherence: 96,
      Structure: 89
    },
    feedback: "Outstanding performance with sophisticated vocabulary and excellent coherence. Your fluency is near-native level, and you demonstrate strong command of complex grammatical structures. Continue to challenge yourself with advanced topics to maintain this high level."
  },
  "A003": {
    id: "A003",
    name: "Emma Johnson", 
    email: "emma.j@school.edu",
    date: "2025-05-23",
    testType: "Full Assessment",
    assessmentType: "full",
    prompt: "Discuss the impact of technology on education. What are the benefits and drawbacks?",
    transcript: "Technology has changed education a lot. Students can learn online now and use computers for research. This is good because they can study at home and find information quickly. But sometimes students spend too much time on screens and don't talk to other students enough. Teachers also need to learn new technology which can be difficult for some.",
    cefr: "A2", 
    totalScore: 68,
    overallCefr: "A2",
    scores: {
      Speaking: 65,
      Listening: 72,
      Reading: 70,
      Writing: 64
    },
    speakingSkills: {
      Fluency: 65,
      Grammar: 60,
      Vocabulary: 70,
      Pronunciation: 75,
      Prosody: 68,
      Coherence: 72,
      Structure: 66
    },
    feedback: "Good basic communication with clear pronunciation. You express your ideas well, but try to use more complex sentence structures and expand your vocabulary. Practice connecting your ideas with transition words to improve coherence.",
    taskDetails: [
      {
        taskType: "speaking",
        prompt: "Discuss the impact of technology on education",
        response: "Technology has changed education a lot...",
        score: 65
      },
      {
        taskType: "listening",
        prompt: "Listen to a lecture about climate change",
        score: 72
      },
      {
        taskType: "reading",
        prompt: "Read an article about urban planning",
        score: 70
      },
      {
        taskType: "writing",
        prompt: "Write an essay about renewable energy",
        response: "Renewable energy is important for our future...",
        score: 64
      }
    ]
  },
  "A004": {
    id: "A004",
    name: "Lisa Wang",
    email: "lisa.wang@tech.com",
    date: "2025-05-22",
    testType: "Full Assessment",
    assessmentType: "full",
    overallCefr: "C2",
    totalScore: 96,
    scores: {
      Speaking: 98,
      Listening: 95,
      Reading: 97,
      Writing: 94
    },
    speakingSkills: {
      Fluency: 98,
      Grammar: 96,
      Vocabulary: 99,
      Pronunciation: 97,
      Prosody: 95,
      Coherence: 99,
      Structure: 94
    },
    feedback: "Exceptional performance across all skills. Near-native proficiency with sophisticated language use and excellent task completion. Maintain this level through continued exposure to complex materials.",
    taskDetails: [
      {
        taskType: "speaking",
        prompt: "Present an argument about artificial intelligence in healthcare",
        response: "The integration of artificial intelligence in healthcare represents a paradigm shift...",
        score: 98
      },
      {
        taskType: "listening",
        prompt: "Academic lecture on quantum computing",
        score: 95
      },
      {
        taskType: "reading",
        prompt: "Complex academic text on biotechnology",
        score: 97
      },
      {
        taskType: "writing",
        prompt: "Academic essay on sustainable development",
        response: "Sustainable development encompasses a multifaceted approach...",
        score: 94
      }
    ]
  }
};
