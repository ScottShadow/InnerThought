import { useEffect, useState } from "react";
import { EntryWithAnalysis } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/dateUtils";
import { getEmotionColor, getPrimaryEmotion } from "@/lib/openai";
import { Star } from "lucide-react";
import { Link } from "wouter";

interface StarredIdeasProps {
  entries?: EntryWithAnalysis[];
  isLoading?: boolean;
  limit?: number;
  showViewAll?: boolean;
}

export default function StarredIdeas({ 
  entries, 
  isLoading = false,
  limit = 3,
  showViewAll = true 
}: StarredIdeasProps) {
  // If entries not provided, fetch starred entries
  const { data: fetchedEntries, isLoading: isFetching } = useQuery<EntryWithAnalysis[]>({
    queryKey: ['/api/entries'],
    enabled: !entries
  });
  
  // State for filtered starred entries
  const [starredEntries, setStarredEntries] = useState<EntryWithAnalysis[]>([]);
  
  // Filter starred entries when data changes
  useEffect(() => {
    const sourceEntries = entries || fetchedEntries || [];
    setStarredEntries(sourceEntries
      .filter(entry => entry.isStarred)
      .slice(0, limit)
    );
  }, [entries, fetchedEntries, limit]);
  
  const isDataLoading = isLoading || isFetching;
  const totalStarredCount = entries ? 
    entries.filter(e => e.isStarred).length : 
    fetchedEntries?.filter(e => e.isStarred).length || 0;

  if (isDataLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          
          <div className="mt-4 text-center">
            <Skeleton className="h-10 w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="starred-ideas">
      <CardHeader>
        <CardTitle>Starred Ideas</CardTitle>
        <CardDescription>Your marked actionable thoughts and ideas</CardDescription>
      </CardHeader>
      <CardContent>
        {starredEntries.length > 0 ? (
          <div className="space-y-4">
            {starredEntries.map(entry => {
              const primaryEmotion = getPrimaryEmotion(entry);
              
              return (
                <div 
                  key={entry.id}
                  className="border border-neutral-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary dark:hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-neutral-500 dark:text-gray-300">{entry.title}</h4>
                    <div className="flex items-center">
                      <span className="text-xs text-neutral-300 dark:text-gray-500 mr-2">
                        {formatDate(new Date(entry.createdAt))}
                      </span>
                      <Star className="fill-yellow-400 stroke-yellow-400 h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 dark:text-gray-500 mt-2 mb-3">{entry.content.substring(0, 150)}...</p>
                  <div className="flex flex-wrap gap-2">
                    {primaryEmotion && (
                      <Badge className={`bg-${primaryEmotion.color} text-white`}>
                        {primaryEmotion.emotion}
                      </Badge>
                    )}
                    {entry.themes?.slice(0, 2).map((theme, index) => (
                      <Badge key={index} variant="outline" className="bg-neutral-200 dark:bg-gray-800 text-neutral-500 dark:text-gray-300">
                        {theme.theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400 dark:text-gray-500">
            <p className="mb-2">No starred entries yet.</p>
            <p className="text-sm">Star your entries with actionable ideas to save them here.</p>
          </div>
        )}
        
        {showViewAll && totalStarredCount > limit && (
          <div className="mt-4 text-center">
            <Link href="/insights#starred-ideas">
              <Button variant="link" className="text-primary">
                View all starred ideas ({totalStarredCount})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
