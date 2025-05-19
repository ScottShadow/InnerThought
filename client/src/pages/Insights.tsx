import { useQuery } from "@tanstack/react-query";
import { EntryWithAnalysis } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import EmotionalTimeline from "@/components/EmotionalTimeline";
import ThemePatterns from "@/components/ThemePatterns";
import StarredIdeas from "@/components/StarredIdeas";
import { useLocation } from "wouter";

export default function Insights() {
  const [_, navigate] = useLocation();
  
  // Fetch all entries for insights
  const { data: entries = [], isLoading } = useQuery<EntryWithAnalysis[]>({
    queryKey: ['/api/entries'],
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar onNewEntry={() => navigate("/")} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <section id="insights" className="mt-2 md:mt-10">
            <h2 className="text-2xl font-bold text-neutral-500 dark:text-gray-200 mb-6">Your Insights</h2>
            
            {/* Emotional Timeline */}
            <div className="mb-8">
              <EmotionalTimeline entries={entries} isLoading={isLoading} />
            </div>
            
            {/* Theme Patterns */}
            <div className="mb-8">
              <ThemePatterns entries={entries} isLoading={isLoading} />
            </div>
            
            {/* Starred Ideas */}
            <div className="mb-8">
              <StarredIdeas 
                entries={entries} 
                isLoading={isLoading}
                limit={5}
                showViewAll={false}
              />
            </div>
            
            {/* Journal Image Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* A person writing in a journal */}
              <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-md">
                <svg viewBox="0 0 800 600" className="w-full h-full bg-primary bg-opacity-10">
                  <rect width="800" height="600" fill="#f8fafc" />
                  <circle cx="400" cy="300" r="200" fill="#e2e8f0" />
                  <g transform="translate(300, 200)">
                    <rect width="200" height="250" fill="#94a3b8" rx="10" />
                    <rect x="20" y="30" width="160" height="10" fill="#e2e8f0" />
                    <rect x="20" y="50" width="160" height="10" fill="#e2e8f0" />
                    <rect x="20" y="70" width="120" height="10" fill="#e2e8f0" />
                    <rect x="20" y="90" width="160" height="10" fill="#e2e8f0" />
                    <rect x="20" y="110" width="90" height="10" fill="#e2e8f0" />
                  </g>
                  <circle cx="500" cy="150" r="50" fill="#4A6FA5" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <p className="text-white p-4 font-medium">Capture your thoughts</p>
                </div>
              </div>
              
              {/* Emotional wellness visualization */}
              <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-md">
                <svg viewBox="0 0 800 600" className="w-full h-full bg-secondary bg-opacity-10">
                  <rect width="800" height="600" fill="#f8fafc" />
                  <circle cx="200" cy="300" r="150" fill="#E8896B" opacity="0.2" />
                  <circle cx="450" cy="350" r="100" fill="#5D9C59" opacity="0.2" />
                  <circle cx="600" cy="200" r="120" fill="#7B68EE" opacity="0.2" />
                  <path d="M100,400 Q400,100 700,300" stroke="#4A6FA5" strokeWidth="8" fill="none" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <p className="text-white p-4 font-medium">Understand your emotions</p>
                </div>
              </div>
              
              {/* Data visualization */}
              <div className="relative h-48 md:h-64 rounded-xl overflow-hidden shadow-md">
                <svg viewBox="0 0 800 600" className="w-full h-full bg-accent bg-opacity-10">
                  <rect width="800" height="600" fill="#f8fafc" />
                  <rect x="100" y="500" width="100" height="-100" fill="#4A6FA5" />
                  <rect x="250" y="500" width="100" height="-220" fill="#86B3D1" />
                  <rect x="400" y="500" width="100" height="-150" fill="#E8896B" />
                  <rect x="550" y="500" width="100" height="-280" fill="#5D9C59" />
                  <line x1="50" y1="500" x2="750" y2="500" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="100" y1="550" x2="100" y2="100" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <p className="text-white p-4 font-medium">Discover your patterns</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
