import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  EntryWithAnalysis,
  Insight,
} from "@shared/schema";
import { formatRelativeTime } from "@/lib/dateUtils";
import { getPrimaryEmotion } from "@/lib/openai";
import useWindowSize from "@/hooks/useWindowSize";
import {
  Search,
  Star,
  Settings,
  LineChart,
  ChartBarStacked,
  StarIcon,
  Plus,
  MenuIcon,
  X,
} from "lucide-react";

interface SidebarProps {
  onNewEntry: () => void;
}

export default function Sidebar({ onNewEntry }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { isMobile } = useWindowSize();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [searchText, setSearchText] = useState("");

  // Update sidebar state when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  // Fetch entries
  const { data: entriesData = { results: [], insights: [] } } = useQuery<{
    results: EntryWithAnalysis[];
    insights: Insight[];
  }>({
    queryKey: ["/api/entries"],
  });
  
  // Get user data
  const { data: userData } = useQuery<{
    id: number;
    username: string;
    displayName?: string;
    isSubscribed?: boolean;
  }>({
    queryKey: ["/api/auth/user"],
  });
  // Extract entries and insights
  const entries = entriesData.results || [];
  const insights = entriesData.insights || [];
  const filteredEntries = entries.filter(
    (entry) =>
      searchText === "" ||
      entry.title.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Display only the latest 5 entries
  const recentEntries = filteredEntries.slice(0, 5);

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }

  function handleEntryClick(id: number) {
    navigate(`/entries/${id}`);
    if (isMobile) {
      setIsOpen(false);
    }
  }
  function handleNewEntryClick() {
    setSearchText(""); // clear the input
    onNewEntry(); // then fire your existing new-entry logic
  }

  // Mobile header
  if (isMobile && !isOpen) {
    return (
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <svg
            className="text-primary h-6 w-6 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
          </svg>
          <h1 className="text-xl font-bold text-primary">InnerThought</h1>
        </div>
        <button onClick={toggleSidebar} className="text-neutral-400 p-2">
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>
    );
  }

  // Sidebar content
  return (
    <aside
      className={`${isMobile ? "fixed inset-0 z-50" : "sticky top-0"} flex flex-col w-full md:w-80 bg-white dark:bg-gray-800 border-r border-neutral-200 dark:border-gray-700 h-screen overflow-y-auto transition-all duration-300 ease-in-out`}
    >
      <div className="p-6 border-b border-neutral-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <svg
              className="text-primary h-6 w-6 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
            <h1 className="text-xl font-bold text-primary">InnerThought</h1>
          </div>
          {isMobile && (
            <button onClick={toggleSidebar} className="text-neutral-400 p-2">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button className="w-full" onClick={handleNewEntryClick}>
          <Plus className="h-4 w-4 mr-2" />
          <span>New Entry</span>
        </Button>
      </div>

      {/* Entries List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 dark:text-gray-400 font-semibold">
            Recent Entries
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search entries..."
              className="pl-9 pr-4 py-1 h-8 text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Entry list */}
        {recentEntries.length > 0 ? (
          recentEntries.map((entry) => {
            const primaryEmotion = getPrimaryEmotion(entry);

            return (
              <div
                key={entry.id}
                className="entry-card bg-neutral-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 p-3 rounded-lg mb-3 cursor-pointer border border-neutral-200 dark:border-gray-700"
                onClick={() => handleEntryClick(entry.id)}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-neutral-500 dark:text-gray-300">
                    {entry.title}
                  </p>
                  <span className="text-xs text-neutral-300 dark:text-gray-500">
                    {formatRelativeTime(new Date(entry.createdAt))}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 dark:text-gray-400 mt-1 line-clamp-2">
                  {entry.content.substring(0, 100)}...
                </p>
                <div className="flex mt-2 items-center">
                  {primaryEmotion && (
                    <span
                      className={`text-xs py-0.5 px-2 rounded-full bg-${primaryEmotion.color} text-white mr-1`}
                    >
                      {primaryEmotion.emotion}
                    </span>
                  )}
                  {entry.themes && entry.themes.length > 0 && (
                    <span className="text-xs py-0.5 px-2 rounded-full bg-neutral-200 dark:bg-gray-700 text-neutral-500 dark:text-gray-300 mr-1">
                      {entry.themes[0].theme}
                    </span>
                  )}
                  {entry.isStarred && (
                    <div className="ml-auto flex items-center">
                      <Star className="fill-yellow-400 stroke-yellow-400 h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-neutral-400 dark:text-gray-500">
            {searchText
              ? "No matching entries found"
              : "No entries yet. Create your first journal entry!"}
          </div>
        )}

        {entries.length > 5 && (
          <Button
            variant="link"
            className="text-primary w-full text-center"
            onClick={() => navigate("/entries")}
          >
            View all entries
          </Button>
        )}
      </div>

      {/* Insights Navigation */}
      <div className="mt-auto p-4 border-t border-neutral-200 dark:border-gray-700">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400 dark:text-gray-400 font-semibold mb-4">
          Insights
        </h2>
        <ul className="space-y-2">
          <li>
            <div
              onClick={() => navigate("/insights#emotional-timeline")}
              className="flex items-center p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <LineChart className="mr-3 h-5 w-5" />
              <span>Emotional Timeline</span>
            </div>
          </li>
          <li>
            <div
              onClick={() => navigate("/insights#theme-patterns")}
              className="flex items-center p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <ChartBarStacked className="mr-3 h-5 w-5" />
              <span>Theme Patterns</span>
            </div>
          </li>
          <li>
            <div
              onClick={() => navigate("/insights#starred-ideas")}
              className="flex items-center p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 text-neutral-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <StarIcon className="mr-3 h-5 w-5" />
              <span>Starred Ideas</span>
            </div>
          </li>
        </ul>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200 dark:border-gray-700 flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
          <span className="text-sm font-medium">
            {userData?.displayName 
              ? userData.displayName.substring(0, 2).toUpperCase() 
              : userData?.username 
                ? userData.username.substring(0, 2).toUpperCase()
                : "U"}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium">
            {userData?.displayName || userData?.username || "InnerThought User"}
          </p>
          <p className="text-xs text-neutral-400 dark:text-gray-500">
            {userData?.isSubscribed ? "Premium Plan" : "Free Plan"}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          <button 
            onClick={() => navigate("/subscribe")}
            className="text-neutral-400 dark:text-gray-500 hover:text-neutral-500 dark:hover:text-gray-400"
          >
            <Star className="h-4 w-4" />
          </button>
          <button 
            className="text-neutral-400 dark:text-gray-500 hover:text-neutral-500 dark:hover:text-gray-400"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button 
            onClick={() => {
              fetch("/api/auth/logout");
              window.location.href = "/landing";
            }}
            className="text-neutral-400 dark:text-gray-500 hover:text-neutral-500 dark:hover:text-gray-400"
            title="Logout"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
