import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Entry, EntryWithAnalysis } from "@shared/schema";
import { formatDateAndTime } from "@/lib/dateUtils";
import RichTextEditor from "./RichTextEditor";
import EntryAnalysis from "./EntryAnalysis";
import { Star, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EntryEditorProps {
  entry?: EntryWithAnalysis;
  isNew?: boolean;
  onSave?: (entry: EntryWithAnalysis) => void;
  onCancel?: () => void;
}

export default function EntryEditor({ entry, isNew = false, onSave, onCancel }: EntryEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize state from entry or with defaults
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [isStarred, setIsStarred] = useState(entry?.isStarred || false);
  const [clarityRating, setClarityRating] = useState(entry?.clarityRating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setIsStarred(entry.isStarred);
      setClarityRating(entry.clarityRating);
    }
  }, [entry]);

  // Create new entry mutation
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; isStarred: boolean; clarityRating: number }) => {
      const response = await apiRequest("POST", "/api/entries", data);
      return await response.json();
    },
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      toast({
        title: "Entry created",
        description: "Your journal entry has been saved.",
      });
      if (onSave) onSave(newEntry);
    },
    onError: (error) => {
      console.error("Error creating entry:", error);
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update entry mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; title: string; content: string; isStarred: boolean; clarityRating: number }) => {
      const { id, ...entryData } = data;
      const response = await apiRequest("PUT", `/api/entries/${id}`, entryData);
      return await response.json();
    },
    onSuccess: (updatedEntry) => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${updatedEntry.id}`] });
      toast({
        title: "Entry updated",
        description: "Your journal entry has been updated.",
      });
      if (onSave) onSave(updatedEntry);
    },
    onError: (error) => {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Star/unstar mutation
  const starMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/entries/${id}/star`, {});
      return await response.json();
    },
    onSuccess: () => {
      setIsStarred(!isStarred);
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      if (entry) {
        queryClient.invalidateQueries({ queryKey: [`/api/entries/${entry.id}`] });
      }
    },
    onError: (error) => {
      console.error("Error toggling star:", error);
      toast({
        title: "Error",
        description: "Failed to star/unstar this entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/entries/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted.",
      });
      if (onCancel) onCancel();
    },
    onError: (error) => {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle clarity rating change
  const updateClarityRating = useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      const response = await apiRequest("PATCH", `/api/entries/${id}/clarity`, { rating });
      return await response.json();
    },
    onSuccess: (updatedEntry) => {
      setClarityRating(updatedEntry.clarityRating);
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${updatedEntry.id}`] });
    },
    onError: (error) => {
      console.error("Error updating clarity rating:", error);
      toast({
        title: "Error",
        description: "Failed to update clarity rating. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your journal entry.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please write some content for your journal entry.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNew) {
        await createMutation.mutateAsync({ title, content, isStarred, clarityRating });
      } else if (entry) {
        await updateMutation.mutateAsync({ id: entry.id, title, content, isStarred, clarityRating });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStarToggle() {
    if (entry) {
      starMutation.mutate(entry.id);
    } else {
      setIsStarred(!isStarred);
    }
  }

  function handleDelete() {
    if (!entry) return;

    if (window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      deleteMutation.mutate(entry.id);
    }
  }

  function handleClarityRating(rating: number) {
    if (entry) {
      updateClarityRating.mutate({ id: entry.id, rating });
    } else {
      setClarityRating(rating);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-neutral-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="w-full mr-4">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-neutral-500 dark:text-gray-200 border-none focus:outline-none focus:ring-0 p-0 bg-transparent w-full"
            placeholder="Entry Title..."
          />
          <div className="flex items-center mt-2 text-sm text-neutral-300 dark:text-gray-500">
            <span>{entry ? formatDateAndTime(new Date(entry.createdAt)) : formatDateAndTime(new Date())}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleStarToggle}
            title={isStarred ? "Unstar this entry" : "Star this entry"}
          >
            <Star className={`h-5 w-5 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </Button>

          {!isNew && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              title="Delete this entry"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Rich Text Editor */}
      <RichTextEditor 
        value={content}
        onChange={setContent}
      />

      {/* Analysis Section */}
      {(!isNew || content.length > 50) && (
        <div className="border-t border-neutral-200 dark:border-gray-700 pt-6 mt-6">
          <EntryAnalysis 
            entry={entry} 
            content={content}
            clarityRating={clarityRating}
            onRatingChange={handleClarityRating}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
