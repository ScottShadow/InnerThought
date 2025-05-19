import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertEntrySchema,
  insertEmotionSchema,
  insertThemeSchema,
  analysisSchema,
} from "@shared/schema";
import { analyzeJournalEntry } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all entries (with analysis)
  app.get("/api/entries", async (req: Request, res: Response) => {
    try {
      // For now, use a default user ID (1)
      const userId = 1;
      const entries = await storage.getEntriesWithAnalysisByUserId(userId);
      res.json(entries);
      //console.log("Entries fetched:", entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Get a single entry with analysis
  app.get("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      const entry = await storage.getEntryWithAnalysis(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  // Create a new entry with analysis
  app.post("/api/entries", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertEntrySchema.parse({
        ...req.body,
        userId: 1, // default user
      });

      // Create the entry
      const entry = await storage.createEntry(validatedData);

      // Analyze the content using OpenAI
      const analysis = await analyzeJournalEntry(entry.content);

      // Add emotions to the entry
      const emotionsToInsert = analysis.emotions.map((emotion) => ({
        entryId: entry.id,
        emotion: emotion.name,
        score: emotion.score,
      }));
      await storage.addEmotions(emotionsToInsert);

      // Add themes to the entry
      const themesToInsert = analysis.themes.map((theme) => ({
        entryId: entry.id,
        theme,
      }));
      await storage.addThemes(themesToInsert);

      // Return the entry with analysis
      const entryWithAnalysis = await storage.getEntryWithAnalysis(entry.id);
      res.status(201).json(entryWithAnalysis);
    } catch (error) {
      console.error("Error creating entry:", error);
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  // Update an entry
  app.put("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Get existing entry to check if it exists
      const existingEntry = await storage.getEntryById(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Validate request body - partial for updates
      const validationSchema = insertEntrySchema.partial();
      const validatedData = validationSchema.parse(req.body);

      // If content was changed, re-analyze
      if (validatedData.content) {
        // Re-analyze the content
        const analysis = await analyzeJournalEntry(validatedData.content);

        // Delete existing emotions and themes
        await storage.deleteEmotionsByEntryId(id);
        await storage.deleteThemesByEntryId(id);

        // Add new emotions
        const emotionsToInsert = analysis.emotions.map((emotion) => ({
          entryId: id,
          emotion: emotion.name,
          score: emotion.score,
        }));
        await storage.addEmotions(emotionsToInsert);

        // Add new themes
        const themesToInsert = analysis.themes.map((theme) => ({
          entryId: id,
          theme,
        }));
        await storage.addThemes(themesToInsert);
      }

      // Update the entry
      await storage.updateEntry(id, validatedData);

      // Return the updated entry with analysis
      const updatedEntry = await storage.getEntryWithAnalysis(id);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating entry:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  // Delete an entry
  app.delete("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Check if entry exists
      const entry = await storage.getEntryById(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Delete the entry (this also deletes associated emotions and themes)
      await storage.deleteEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Get starred entries
  app.get("/api/entries/starred", async (req: Request, res: Response) => {
    try {
      // For now, use a default user ID (1)
      const userId = 1;
      const entries = await storage.getStarredEntriesWithAnalysis(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching starred entries:", error);
      res.status(500).json({ message: "Failed to fetch starred entries" });
    }
  });

  // Toggle star status
  app.patch("/api/entries/:id/star", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Get existing entry
      const entry = await storage.getEntryById(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Toggle star status
      const updatedEntry = await storage.updateEntry(id, {
        isStarred: !entry.isStarred,
      });

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error toggling star status:", error);
      res.status(500).json({ message: "Failed to update star status" });
    }
  });

  // Update clarity rating
  app.patch("/api/entries/:id/clarity", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Validate rating
      const ratingSchema = z.object({ rating: z.number().min(0).max(5) });
      const { rating } = ratingSchema.parse(req.body);

      // Update rating
      const updatedEntry = await storage.updateEntry(id, {
        clarityRating: rating,
      });

      if (!updatedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating clarity rating:", error);
      res.status(500).json({ message: "Failed to update clarity rating" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
