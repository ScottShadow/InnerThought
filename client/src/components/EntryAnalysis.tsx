import { useState, useEffect } from "react";
import { EntryWithAnalysis } from "@shared/schema";
import { getEmotionColor } from "@/lib/openai";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface EntryAnalysisProps {
  entry?: EntryWithAnalysis;
  content: string;
  clarityRating: number;
  onRatingChange: (rating: number) => void;
}

export default function EntryAnalysis({ 
  entry, 
  content,
  clarityRating,
  onRatingChange
}: EntryAnalysisProps) {
  // Only run analysis query if we don't already have analysis and content is substantial
  const shouldFetchAnalysis = !entry?.emotions && content.length > 50;
  
  // Emotion and theme state
  const [emotions, setEmotions] = useState<{id: number; emotion: string; score: number}[]>([]);
  const [themes, setThemes] = useState<{id: number; theme: string}[]>([]);
  
  // Update local state when entry changes
  useEffect(() => {
    if (entry?.emotions) {
      setEmotions(entry.emotions);
    }
    
    if (entry?.themes) {
      setThemes(entry.themes);
    }
  }, [entry]);
  
  // Star rating
  function handleRatingClick(rating: number) {
    onRatingChange(rating);
  }
  
  return (
    <div>
      <h3 className="text-sm uppercase tracking-wider text-neutral-400 dark:text-gray-500 font-semibold mb-4">Entry Analysis</h3>
      
      {/* Emotional Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-500 dark:text-gray-300 mb-2">Emotional Tone</h4>
        
        {emotions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion, index) => {
              const colorClass = getEmotionColor(emotion.emotion);
              return (
                <div 
                  key={index} 
                  className={`emotion-tag px-3 py-1 rounded-full bg-${colorClass} bg-opacity-10 border border-${colorClass} text-${colorClass} text-sm flex items-center`}
                >
                  <span className="mr-1">{emotion.emotion}</span>
                  <span className="text-xs">{emotion.score}%</span>
                </div>
              );
            })}
          </div>
        ) : content.length > 50 ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        ) : (
          <p className="text-sm text-neutral-400 dark:text-gray-500">Write more content to see emotional analysis.</p>
        )}
      </div>
      
      {/* Theme Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-neutral-500 dark:text-gray-300 mb-2">Identified Themes</h4>
        
        {themes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, index) => (
              <Badge key={index} variant="outline" className="bg-neutral-100 dark:bg-gray-800 text-neutral-500 dark:text-gray-300">
                {theme.theme}
              </Badge>
            ))}
          </div>
        ) : content.length > 50 ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ) : (
          <p className="text-sm text-neutral-400 dark:text-gray-500">Write more content to see theme analysis.</p>
        )}
      </div>
      
      {/* Clarity Rating */}
      <div>
        <h4 className="text-sm font-medium text-neutral-500 dark:text-gray-300 mb-2">Rate this entry's clarity</h4>
        <div className="flex items-center">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button 
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                className={`text-${clarityRating >= rating ? 'yellow-400' : 'neutral-200 dark:text-gray-600'} text-xl focus:outline-none`}
              >
                <Star className={`h-6 w-6 ${clarityRating >= rating ? 'fill-yellow-400' : ''}`} />
              </button>
            ))}
          </div>
          <span className="ml-3 text-sm text-neutral-400 dark:text-gray-500">
            {clarityRating === 0 ? "Rate clarity" : 
             clarityRating === 1 ? "Unclear (1/5)" :
             clarityRating === 2 ? "Somewhat clear (2/5)" :
             clarityRating === 3 ? "Moderately clear (3/5)" :
             clarityRating === 4 ? "Good clarity (4/5)" :
             "Excellent clarity (5/5)"}
          </span>
        </div>
      </div>
    </div>
  );
}
