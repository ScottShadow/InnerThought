import { EntryWithAnalysis } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ThemePatternsProps {
  entries: EntryWithAnalysis[];
  insights: ThemeInsight[];
  isLoading?: boolean;
}

interface ThemeCount {
  theme: string;
  count: number;
  percentage: number;
}

interface ThemeInsight {
  title: string;
  description: string;
  suggestedColor: string;
  derivedEntryCount: number;
}

export default function ThemePatterns({
  entries,
  insights = [],
  isLoading = false,
}: ThemePatternsProps) {
  // Count theme occurrences
  const themeCounts: Record<string, number> = {};
  let totalThemes = 0;

  entries.forEach((entry) => {
    if (!entry.themes) return;

    entry.themes.forEach((theme) => {
      themeCounts[theme.theme] = (themeCounts[theme.theme] || 0) + 1;
      totalThemes += 1;
    });
  });

  // Convert to sorted array
  const sortedThemes: ThemeCount[] = Object.entries(themeCounts)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / Math.max(totalThemes, 1)) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Generate theme insights
  const themeInsights: ThemeInsight[] = insights;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 mb-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="theme-patterns">
      <CardHeader>
        <CardTitle>Theme Patterns</CardTitle>
        <CardDescription>
          Recurring themes in your journal entries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <>
            {/* Theme Heatmap */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-neutral-500 dark:text-gray-300 mb-3">
                Theme Frequency
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
                {sortedThemes.slice(0, 8).map((themeData, index) => (
                  <div
                    key={index}
                    className={`heatmap-cell aspect-square rounded flex items-center justify-center text-white text-xs p-2 cursor-pointer overflow-hidden`}
                    style={{
                      backgroundColor: `hsl(${(index * 30) % 360}, 70%, 50%)`,
                      opacity: Math.max(
                        0.5,
                        Math.min(0.95, themeData.percentage / 100),
                      ),
                    }}
                    title={`${themeData.theme}: ${themeData.count} mentions (${themeData.percentage}%)`}
                  >
                    <span className="line-clamp-2 text-center">
                      {themeData.theme}
                    </span>
                  </div>
                ))}

                {/* Fill empty slots if less than 8 themes */}
                {Array.from({
                  length: Math.max(0, 8 - sortedThemes.length),
                }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square bg-neutral-100 dark:bg-gray-800 rounded flex items-center justify-center text-neutral-300 dark:text-gray-600 text-xs p-2"
                  >
                    {i === 0 && sortedThemes.length === 0
                      ? "No themes yet"
                      : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Insights */}
            <div>
              <h4 className="text-sm font-medium text-neutral-500 dark:text-gray-300 mb-3">
                Theme Insights
              </h4>
              <div className="space-y-4">
                {themeInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 dark:bg-gray-900 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{insight.title}</h5>
                      <span className="text-xs text-neutral-400 dark:text-gray-500">
                        Based on {insight.entryCount} entries
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 dark:text-gray-500 mb-2">
                      {insight.description}
                    </p>
                    <div className="relative w-full h-2 bg-neutral-200 dark:bg-gray-700 rounded overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-${insight.color} insight-value`}
                        style={{ width: `${insight.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-neutral-400 dark:text-gray-500">
            <p className="mb-2">No entries to analyze themes from.</p>
            <p className="text-sm">
              Start writing journal entries to discover your recurring themes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
