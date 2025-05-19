import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Journal entries schema
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isStarred: boolean("is_starred").default(false),
  clarityRating: integer("clarity_rating").default(0),
});

export const insertEntrySchema = createInsertSchema(entries).pick({
  userId: true,
  title: true,
  content: true,
  isStarred: true,
  clarityRating: true,
});

// Emotional analysis schema
export const emotions = pgTable("emotions", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  emotion: text("emotion").notNull(),
  score: integer("score").notNull(), // 0-100
});

export const insertEmotionSchema = createInsertSchema(emotions).pick({
  entryId: true,
  emotion: true,
  score: true,
});

// Theme tagging schema
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  theme: text("theme").notNull(),
});

export const insertThemeSchema = createInsertSchema(themes).pick({
  entryId: true,
  theme: true,
});

// Journal entry with analysis - for returning composed data
export const entryWithAnalysisSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isStarred: z.boolean().nullable().transform(val => val === null ? false : val),
  clarityRating: z.number().nullable().transform(val => val === null ? 0 : val),
  emotions: z.array(z.object({
    id: z.number(),
    entryId: z.number(),
    emotion: z.string(),
    score: z.number(),
  })).optional(),
  themes: z.array(z.object({
    id: z.number(),
    entryId: z.number(),
    theme: z.string(),
  })).optional(),
});

// OpenAI Analysis schema for internal use
export const analysisSchema = z.object({
  emotions: z.array(z.object({
    name: z.string(),
    score: z.number()
  })),
  themes: z.array(z.string()),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;

export type Emotion = typeof emotions.$inferSelect;
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

export type EntryWithAnalysis = z.infer<typeof entryWithAnalysisSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
