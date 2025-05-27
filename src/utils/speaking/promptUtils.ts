
import { SpeakingPrompt } from '../../types/assessment';
import { speakingPrompts } from '../../data/speaking/promptData';

/**
 * Export the prompts for backward compatibility
 * @deprecated Use speakingPrompts from data/speaking/promptData instead
 */
export const mockPrompts = speakingPrompts;

/**
 * Get prompts filtered by CEFR level
 * @param level CEFR level to filter by
 */
export const getPromptsByLevel = (level: string): SpeakingPrompt[] => {
  return speakingPrompts.filter(prompt => prompt.cefrLevel === level);
};

/**
 * Get random prompt from all available prompts or filtered by level
 * @param level Optional CEFR level to filter by
 */
export const getRandomPrompt = (level?: string): SpeakingPrompt => {
  const availablePrompts = level ? getPromptsByLevel(level) : speakingPrompts;
  const randomIndex = Math.floor(Math.random() * availablePrompts.length);
  return availablePrompts[randomIndex];
};

/**
 * Get prompt by ID
 * @param id Prompt ID
 */
export const getPromptById = (id: string): SpeakingPrompt | undefined => {
  return speakingPrompts.find(prompt => prompt.id === id);
};

/**
 * Get prompts by category
 * @param category Category to filter by
 */
export const getPromptsByCategory = (category: string): SpeakingPrompt[] => {
  return speakingPrompts.filter(prompt => prompt.category === category);
};

/**
 * Get prompts by difficulty
 * @param difficulty Difficulty level to filter by
 */
export const getPromptsByDifficulty = (difficulty: string): SpeakingPrompt[] => {
  return speakingPrompts.filter(prompt => prompt.difficulty === difficulty);
};

/**
 * Get prompts by topic
 * @param topic Topic to filter by
 */
export const getPromptsByTopic = (topic: string): SpeakingPrompt[] => {
  return speakingPrompts.filter(prompt => prompt.topic === topic);
};

/**
 * Get all unique CEFR levels from prompts
 */
export const getAvailableLevels = (): string[] => {
  const levels = speakingPrompts.map(prompt => prompt.cefrLevel).filter(Boolean);
  return [...new Set(levels)].sort();
};

/**
 * Get all unique topics from prompts
 */
export const getAvailableTopics = (): string[] => {
  const topics = speakingPrompts.map(prompt => prompt.topic).filter(Boolean);
  return [...new Set(topics)].sort();
};

/**
 * Get all unique categories from prompts
 */
export const getAvailableCategories = (): string[] => {
  const categories = speakingPrompts.map(prompt => prompt.category);
  return [...new Set(categories)].sort();
};
