import { useQuery } from "@tanstack/react-query";
import { EntryWithAnalysis } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import EntryEditor from "@/components/EntryEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EntryDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const entryId = parseInt(id);
  
  // Fetch the entry by ID
  const { data: entry, isLoading, isError } = useQuery<EntryWithAnalysis>({
    queryKey: [`/api/entries/${entryId}`],
    enabled: !isNaN(entryId)
  });
  
  function handleBack() {
    navigate("/entries");
  }
  
  function handleSave() {
    navigate("/entries");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar onNewEntry={() => navigate("/")} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all entries
          </Button>
          
          {isLoading ? (
            <Skeleton className="h-[600px] w-full" />
          ) : isError || !entry ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load the entry. It may have been deleted or you don't have permission to view it.
              </AlertDescription>
            </Alert>
          ) : (
            <EntryEditor
              entry={entry}
              onSave={handleSave}
              onCancel={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
}
