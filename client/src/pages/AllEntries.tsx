import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EntryWithAnalysis } from "@shared/schema";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateAndTime } from "@/lib/dateUtils";
import { getFormattedEmotions } from "@/lib/openai";
import { Search, Star, Plus, Calendar } from "lucide-react";

export default function AllEntries() {
  const [_, navigate] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterEmotion, setFilterEmotion] = useState("all");

  // Fetch all entries
  const { data = { entries: [], insights: [] }, isLoading } = useQuery<{
    results: EntryWithAnalysis[];
    insights: Insight[];
  }>({
    queryKey: ["/api/entries"],
    select: (data) => ({
      entries: data.results,
      insights: data.insights, // grab both
    }),
  });
  const { entries, insights } = data as {
    entries: EntryWithAnalysis[];
    insights: Insight[];
  };

  // Get unique emotions from all entries
  const uniqueEmotions = new Set<string>();
  entries.forEach((entry) => {
    entry.emotions?.forEach((emotion) => {
      uniqueEmotions.add(emotion.emotion);
    });
  });

  // Filter and sort entries
  const filteredEntries = entries
    .filter((entry) => {
      // Text search filter
      const matchesSearch =
        searchText === "" ||
        entry.title.toLowerCase().includes(searchText.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchText.toLowerCase());

      // Emotion filter
      const matchesEmotion =
        filterEmotion === "all" ||
        entry.emotions?.some(
          (e) => e.emotion.toLowerCase() === filterEmotion.toLowerCase(),
        );

      return matchesSearch && matchesEmotion;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  function handleCreateNew() {
    navigate("/");
  }

  function handleEntryClick(id: number) {
    navigate(`/entries/${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar onNewEntry={handleCreateNew} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-500 dark:text-gray-200 mb-4 sm:mb-0">
              All Journal Entries
            </h1>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              <span>New Entry</span>
            </Button>
          </div>

          {/* Search and filters */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search entries..."
                    className="pl-9"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All emotions</SelectItem>
                    {Array.from(uniqueEmotions).map((emotion) => (
                      <SelectItem key={emotion} value={emotion}>
                        {emotion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Entry list */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const formattedEmotions = getFormattedEmotions(entry);

                return (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleEntryClick(entry.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-neutral-600 dark:text-gray-200">
                            {entry.title}
                          </h2>
                          <p className="text-sm text-neutral-400 dark:text-gray-400 mt-1">
                            {formatDateAndTime(new Date(entry.createdAt))}
                          </p>
                        </div>
                        {entry.isStarred && (
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>

                      <p className="text-neutral-500 dark:text-gray-300 mt-4 line-clamp-2">
                        {entry.content.substring(0, 200)}...
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {formattedEmotions.map((emotion, i) => (
                          <Badge
                            key={i}
                            className={`bg-${emotion.color} text-white`}
                          >
                            {emotion.emotion}
                          </Badge>
                        ))}

                        {entry.themes?.map((theme, i) => (
                          <Badge key={i} variant="outline">
                            {theme.theme}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 dark:text-gray-500">
              <p className="text-lg mb-2">No entries found</p>
              <p>
                Try adjusting your search or filters, or create a new entry.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create new entry
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
