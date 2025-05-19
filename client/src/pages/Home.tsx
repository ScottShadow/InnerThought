import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EntryWithAnalysis } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import EntryEditor from "@/components/EntryEditor";
import { useToast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";

export default function Home() {
  const { toast } = useToast();
  const { isMobile } = useWindowSize();
  const [showEditor, setShowEditor] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  
  // Fetch all entries
  const { data: entries = [], isLoading, isError } = useQuery<EntryWithAnalysis[]>({
    queryKey: ['/api/entries'],
  });
  
  // Get the selected entry if we have an ID
  const selectedEntry = selectedEntryId 
    ? entries.find(entry => entry.id === selectedEntryId)
    : undefined;
  
  // Create a new entry
  function handleNewEntry() {
    setSelectedEntryId(null);
    setShowEditor(true);
  }
  
  // After saving an entry
  function handleSaveEntry(entry: EntryWithAnalysis) {
    setSelectedEntryId(entry.id);
    toast({
      title: "Entry saved",
      description: "Your journal entry has been saved successfully."
    });
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar onNewEntry={handleNewEntry} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Show editor for new entry or selected entry */}
          {showEditor && (
            <EntryEditor 
              entry={selectedEntry}
              isNew={!selectedEntry}
              onSave={handleSaveEntry}
            />
          )}
          
          {/* Images section at the bottom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-12">
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
        </div>
      </main>
    </div>
  );
}
