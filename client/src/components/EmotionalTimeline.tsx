import { useRef, useEffect, useState } from "react";
import { EntryWithAnalysis } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmotionColor } from "@/lib/openai";

interface EmotionalTimelineProps {
  entries: EntryWithAnalysis[];
  isLoading?: boolean;
}

interface TimelinePoint {
  id: number;
  date: Date;
  position: { x: number; y: number };
  emotion: string;
  title: string;
}

export default function EmotionalTimeline({ entries, isLoading = false }: EmotionalTimelineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [timelinePoints, setTimelinePoints] = useState<TimelinePoint[]>([]);
  const [pathD, setPathD] = useState("");
  
  // Generate timeline points from entries
  useEffect(() => {
    if (!entries.length || !chartRef.current) return;
    
    const chartWidth = chartRef.current.clientWidth - 16; // Subtract padding
    const chartHeight = chartRef.current.clientHeight - 40; // Subtract height of labels
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Get date range
    const startDate = new Date(sortedEntries[0].createdAt).getTime();
    const endDate = new Date(sortedEntries[sortedEntries.length - 1].createdAt).getTime();
    const dateRange = Math.max(endDate - startDate, 86400000); // At least 1 day
    
    // Map entries to timeline points
    const points: TimelinePoint[] = [];
    let pathString = "";
    
    sortedEntries.forEach((entry, index) => {
      if (!entry.emotions || entry.emotions.length === 0) return;
      
      // Get primary emotion
      const primaryEmotion = [...entry.emotions].sort((a, b) => b.score - a.score)[0];
      
      // Calculate position
      const entryDate = new Date(entry.createdAt);
      const x = ((entryDate.getTime() - startDate) / dateRange) * chartWidth;
      
      // Map emotion to y-position (0 = excited, 100 = distressed)
      let y: number;
      const emotionLower = primaryEmotion.emotion.toLowerCase();
      
      if (emotionLower.includes('happy') || emotionLower.includes('excited') || emotionLower.includes('energetic')) {
        y = 0.2 * chartHeight; // Excited
      } else if (emotionLower.includes('positive') || emotionLower.includes('motivated')) {
        y = 0.3 * chartHeight; // Positive
      } else if (emotionLower.includes('neutral') || emotionLower.includes('calm') || emotionLower.includes('reflective')) {
        y = 0.5 * chartHeight; // Neutral
      } else if (emotionLower.includes('concerned') || emotionLower.includes('anxious')) {
        y = 0.7 * chartHeight; // Concerned
      } else if (emotionLower.includes('distressed') || emotionLower.includes('sad') || emotionLower.includes('negative')) {
        y = 0.8 * chartHeight; // Distressed
      } else {
        y = 0.5 * chartHeight; // Default to neutral
      }
      
      points.push({
        id: entry.id,
        date: entryDate,
        position: { x, y },
        emotion: primaryEmotion.emotion,
        title: entry.title
      });
      
      // Build SVG path
      if (index === 0) {
        pathString = `M ${x} ${y}`;
      } else {
        pathString += ` L ${x} ${y}`;
      }
    });
    
    setTimelinePoints(points);
    setPathD(pathString);
    
  }, [entries]);

  // Stats calculation
  const emotionStats = entries.reduce<Record<string, number>>((stats, entry) => {
    if (!entry.emotions || entry.emotions.length === 0) return stats;
    
    const primaryEmotion = [...entry.emotions].sort((a, b) => b.score - a.score)[0];
    stats[primaryEmotion.emotion] = (stats[primaryEmotion.emotion] || 0) + 1;
    
    return stats;
  }, {});
  
  const mostCommonEmotion = Object.entries(emotionStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
  const mostImprovedEmotion = "Curious"; // Would need more data to calculate this
  const trendingDownEmotion = "Anxiety"; // Would need more data to calculate this
  const emotionalRange = entries.length > 5 ? "Moderate" : "Low";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="emotional-timeline">
      <CardHeader>
        <CardTitle>Emotional Timeline</CardTitle>
        <CardDescription>Tracking your emotional patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length > 1 ? (
          <>
            {/* Timeline Visualization */}
            <div className="relative h-64 mb-6">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-neutral-400 dark:text-gray-500 pr-2">
                <span>Excited</span>
                <span>Positive</span>
                <span>Neutral</span>
                <span>Concerned</span>
                <span>Distressed</span>
              </div>
              
              {/* Chart area */}
              <div ref={chartRef} className="ml-16 h-full relative border-l border-b border-neutral-200 dark:border-gray-700">
                {/* Timeline points */}
                {timelinePoints.map((point) => (
                  <div 
                    key={point.id}
                    className="timeline-point absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${point.position.x}px`, top: `${point.position.y}px` }}
                    title={`${format(point.date, 'MMM d')}: ${point.title} - ${point.emotion}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-${getEmotionColor(point.emotion)} cursor-pointer`}></div>
                  </div>
                ))}
                
                {/* Line connecting the points */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  <path d={pathD} stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                
                {/* X-axis labels */}
                {timelinePoints.length > 0 && (
                  <div className="absolute left-0 right-0 bottom-0 translate-y-full flex justify-between text-xs text-neutral-400 dark:text-gray-500 pt-2">
                    <span>{format(timelinePoints[0].date, 'MMM d')}</span>
                    {timelinePoints.length > 2 && (
                      <span>{format(timelinePoints[Math.floor(timelinePoints.length / 2)].date, 'MMM d')}</span>
                    )}
                    <span>{format(timelinePoints[timelinePoints.length - 1].date, 'MMM d')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Emotional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-neutral-400 dark:text-gray-500 mb-1">Most Common</div>
                <div className={`font-medium text-${getEmotionColor(mostCommonEmotion)} flex items-center`}>
                  {mostCommonEmotion}
                </div>
              </div>
              <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-neutral-400 dark:text-gray-500 mb-1">Most Improved</div>
                <div className={`font-medium text-${getEmotionColor(mostImprovedEmotion)} flex items-center`}>
                  {mostImprovedEmotion}
                </div>
              </div>
              <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-neutral-400 dark:text-gray-500 mb-1">Trending Down</div>
                <div className={`font-medium text-${getEmotionColor(trendingDownEmotion)} flex items-center`}>
                  {trendingDownEmotion}
                </div>
              </div>
              <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="text-sm text-neutral-400 dark:text-gray-500 mb-1">Emotional Range</div>
                <div className="font-medium text-neutral-500 dark:text-gray-300">
                  {emotionalRange}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-neutral-400 dark:text-gray-500">
            <p className="mb-2">Not enough entries to generate a timeline.</p>
            <p className="text-sm">Write more journal entries to see your emotional patterns over time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
