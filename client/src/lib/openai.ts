import { EntryWithAnalysis } from "@shared/schema";

// This file is a client-side wrapper for OpenAI calls
// The actual OpenAI integration happens server-side

export type EmotionWithColor = {
  emotion: string;
  score: number;
  color: string;
}

// Map emotions to color classes
export function getEmotionColor(emotion: string): string {
  const emotionLower = emotion.toLowerCase();
  
  // Positive emotions
  if (emotionLower.includes('happy') || 
      emotionLower.includes('joy') || 
      emotionLower.includes('excited') ||
      emotionLower.includes('positive') ||
      emotionLower.includes('motivated') ||
      emotionLower.includes('energetic')) {
    return 'emotion-positive';
  }
  
  // Negative emotions
  if (emotionLower.includes('sad') || 
      emotionLower.includes('angry') || 
      emotionLower.includes('frustrated') ||
      emotionLower.includes('anxious') ||
      emotionLower.includes('concerned') ||
      emotionLower.includes('negative')) {
    return 'emotion-negative';
  }
  
  // Curious emotions
  if (emotionLower.includes('curious') || 
      emotionLower.includes('reflective') || 
      emotionLower.includes('thoughtful') ||
      emotionLower.includes('interested') ||
      emotionLower.includes('inquisitive')) {
    return 'emotion-curious';
  }
  
  // Energetic emotions
  if (emotionLower.includes('motivated') || 
      emotionLower.includes('energetic') || 
      emotionLower.includes('enthusiastic') ||
      emotionLower.includes('passionate')) {
    return 'emotion-energetic';
  }
  
  // Default to neutral
  return 'neutral-300';
}

// Format emotions with colors
export function getFormattedEmotions(entry: EntryWithAnalysis): EmotionWithColor[] {
  if (!entry.emotions) return [];
  
  return entry.emotions.map(emotion => ({
    emotion: emotion.emotion,
    score: emotion.score,
    color: getEmotionColor(emotion.emotion)
  }));
}

// Get primary emotion (highest score)
export function getPrimaryEmotion(entry: EntryWithAnalysis): EmotionWithColor | null {
  if (!entry.emotions || entry.emotions.length === 0) return null;
  
  const sortedEmotions = [...entry.emotions].sort((a, b) => b.score - a.score);
  return {
    emotion: sortedEmotions[0].emotion,
    score: sortedEmotions[0].score,
    color: getEmotionColor(sortedEmotions[0].emotion)
  };
}
