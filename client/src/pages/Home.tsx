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
          {/* Welcome message for new users */}
          {entries.length === 0 && !isLoading && (
            <div className="mt-8 text-center p-6 bg-neutral-50 dark:bg-gray-800 rounded-xl border border-neutral-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-2">Welcome to InnerThought</h2>
              <p className="text-neutral-600 dark:text-gray-300 mb-4">
                Your personal journal with emotional and thematic analysis.
              </p>
              <p className="text-neutral-500 dark:text-gray-400 mb-6">
                Create your first entry using the "New Entry" button and explore your insights in the Insights tab.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
