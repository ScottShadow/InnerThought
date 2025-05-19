import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  displayName: text("display_name"),
  profilePicture: text("profile_picture"),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionExpiry: timestamp("subscription_expiry"),
  stripeCustomerId: text("stripe_customer_id").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  googleId: true,
  displayName: true,
  profilePicture: true,
  isSubscribed: true,
});

// Journal entries schema
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  clarityRating: integer("clarity_rating").default(0).notNull(),
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
  isStarred: z.boolean(),
  clarityRating: z.number(),
  emotions: z
    .array(
      z.object({
        id: z.number(),
        entryId: z.number(),
        emotion: z.string(),
        score: z.number(),
      }),
    )
    .optional(),
  themes: z
    .array(
      z.object({
        id: z.number(),
        entryId: z.number(),
        theme: z.string(),
      }),
    )
    .optional(),
});

// OpenAI Analysis schema for internal use
export const analysisSchema = z.object({
  emotions: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
    }),
  ),
  themes: z.array(z.string()),
});

export const InsightSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    suggestedColor: z.string(),
    derivedEntryCount: z.number().int().min(0),
  }),
);
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
export type Insight = z.infer<typeof InsightSchema>;
