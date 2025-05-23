import {
  users,
  themes,
  emotions,
  entries,
  type User,
  type InsertUser,
  type Entry,
  type InsertEntry,
  type Emotion,
  type InsertEmotion,
  type Theme,
  type InsertTheme,
  type Insight,
  InsightSchema,
  type EntryWithAnalysis,
} from "@shared/schema";

import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { geminiRequest } from "./openai";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, isSubscribed: boolean, expiryDate?: Date): Promise<User | undefined>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User | undefined>;

  // Entry methods
  createEntry(entry: InsertEntry): Promise<Entry>;
  getEntryById(id: number): Promise<Entry | undefined>;
  getEntriesByUserId(userId: number): Promise<Entry[]>;
  updateEntry(
    id: number,
    entry: Partial<InsertEntry>,
  ): Promise<Entry | undefined>;
  deleteEntry(id: number): Promise<boolean>;
  getStarredEntries(userId: number): Promise<Entry[]>;

  // Emotion methods
  addEmotions(emotions: InsertEmotion[]): Promise<Emotion[]>;
  getEmotionsByEntryId(entryId: number): Promise<Emotion[]>;
  deleteEmotionsByEntryId(entryId: number): Promise<boolean>;

  // Theme methods
  addThemes(themes: InsertTheme[]): Promise<Theme[]>;
  getThemesByEntryId(entryId: number): Promise<Theme[]>;
  deleteThemesByEntryId(entryId: number): Promise<boolean>;

  // Combined methods
  getEntryWithAnalysis(entryId: number): Promise<EntryWithAnalysis | undefined>;
  getEntriesWithAnalysisByUserId(
    userId: number,
  ): Promise<{ results: EntryWithAnalysis[]; insights: Insight[] }>;
  getStarredEntriesWithAnalysis(userId: number): Promise<EntryWithAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private entries: Map<number, Entry>;
  private emotions: Map<number, Emotion>;
  private themes: Map<number, Theme>;

  private userIdCounter: number;
  private entryIdCounter: number;
  private emotionIdCounter: number;
  private themeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.entries = new Map();
    this.emotions = new Map();
    this.themes = new Map();

    this.userIdCounter = 1;
    this.entryIdCounter = 1;
    this.emotionIdCounter = 1;
    this.themeIdCounter = 1;

    // Add a default user
    this.createUser({
      username: "demo",
      password: "password",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      password: insertUser.password || null,
      email: insertUser.email || null,
      googleId: insertUser.googleId || null,
      displayName: insertUser.displayName || null,
      profilePicture: insertUser.profilePicture || null,
      isSubscribed: insertUser.isSubscribed || false,
      subscriptionExpiry: null,
      stripeCustomerId: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserSubscription(userId: number, isSubscribed: boolean, expiryDate?: Date): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      isSubscribed,
      subscriptionExpiry: expiryDate || null
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: customerId
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Entry methods
  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    const id = this.entryIdCounter++;
    const now = new Date();
    const entry: Entry = {
      ...insertEntry,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(id, entry);
    return entry;
  }

  async getEntryById(id: number): Promise<Entry | undefined> {
    return this.entries.get(id);
  }

  async getEntriesByUserId(userId: number): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateEntry(
    id: number,
    partialEntry: Partial<InsertEntry>,
  ): Promise<Entry | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;

    const updatedEntry: Entry = {
      ...entry,
      ...partialEntry,
      updatedAt: new Date(),
    };
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(id: number): Promise<boolean> {
    // Delete associated emotions and themes first
    await this.deleteEmotionsByEntryId(id);
    await this.deleteThemesByEntryId(id);

    return this.entries.delete(id);
  }

  async getStarredEntries(userId: number): Promise<Entry[]> {
    return Array.from(this.entries.values())
      .filter((entry) => entry.userId === userId && entry.isStarred)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Emotion methods
  async addEmotions(insertEmotions: InsertEmotion[]): Promise<Emotion[]> {
    const results: Emotion[] = [];

    for (const insertEmotion of insertEmotions) {
      const id = this.emotionIdCounter++;
      const emotion: Emotion = { ...insertEmotion, id };
      this.emotions.set(id, emotion);
      results.push(emotion);
    }

    return results;
  }

  async getEmotionsByEntryId(entryId: number): Promise<Emotion[]> {
    return Array.from(this.emotions.values()).filter(
      (emotion) => emotion.entryId === entryId,
    );
  }

  async deleteEmotionsByEntryId(entryId: number): Promise<boolean> {
    const emotionsToDelete = Array.from(this.emotions.entries()).filter(
      ([_, emotion]) => emotion.entryId === entryId,
    );

    for (const [id] of emotionsToDelete) {
      this.emotions.delete(id);
    }

    return true;
  }

  // Theme methods
  async addThemes(insertThemes: InsertTheme[]): Promise<Theme[]> {
    const results: Theme[] = [];

    for (const insertTheme of insertThemes) {
      const id = this.themeIdCounter++;
      const theme: Theme = { ...insertTheme, id };
      this.themes.set(id, theme);
      results.push(theme);
    }

    return results;
  }

  async getThemesByEntryId(entryId: number): Promise<Theme[]> {
    return Array.from(this.themes.values()).filter(
      (theme) => theme.entryId === entryId,
    );
  }

  async deleteThemesByEntryId(entryId: number): Promise<boolean> {
    const themesToDelete = Array.from(this.themes.entries()).filter(
      ([_, theme]) => theme.entryId === entryId,
    );

    for (const [id] of themesToDelete) {
      this.themes.delete(id);
    }

    return true;
  }

  // Combined methods
  async getEntryWithAnalysis(
    entryId: number,
  ): Promise<EntryWithAnalysis | undefined> {
    const entry = await this.getEntryById(entryId);
    if (!entry) return undefined;

    const emotions = await this.getEmotionsByEntryId(entryId);
    const themes = await this.getThemesByEntryId(entryId);

    return {
      ...entry,
      emotions,
      themes,
    };
  }
  async getStarredEntriesWithAnalysis(
    userId: number,
  ): Promise<EntryWithAnalysis[]> {
    const entries = await this.getStarredEntries(userId);
    const results: EntryWithAnalysis[] = [];

    for (const entry of entries) {
      const emotions = await this.getEmotionsByEntryId(entry.id);
      const themes = await this.getThemesByEntryId(entry.id);
      results.push({
        ...entry,
        emotions,
        themes,
      });
    }

    return results;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserSubscription(userId: number, isSubscribed: boolean, expiryDate?: Date): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        isSubscribed,
        subscriptionExpiry: expiryDate || null,
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }
  
  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  // Entry methods
  async createEntry(insertEntry: InsertEntry): Promise<Entry> {
    // Ensure we have default values for nullable fields
    const entryData = {
      ...insertEntry,
      isStarred:
        insertEntry.isStarred !== undefined ? insertEntry.isStarred : false,
      clarityRating:
        insertEntry.clarityRating !== undefined ? insertEntry.clarityRating : 0,
    };

    const [entry] = await db.insert(entries).values(entryData).returning();
    return entry;
  }

  async getEntryById(id: number): Promise<Entry | undefined> {
    const [entry] = await db.select().from(entries).where(eq(entries.id, id));
    return entry || undefined;
  }

  async getEntriesByUserId(userId: number): Promise<Entry[]> {
    return await db
      .select()
      .from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.createdAt));
  }

  async updateEntry(
    id: number,
    partialEntry: Partial<InsertEntry>,
  ): Promise<Entry | undefined> {
    const [updatedEntry] = await db
      .update(entries)
      .set({
        ...partialEntry,
        updatedAt: new Date(),
      })
      .where(eq(entries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async deleteEntry(id: number): Promise<boolean> {
    // Delete associated emotions and themes first
    await this.deleteEmotionsByEntryId(id);
    await this.deleteThemesByEntryId(id);

    // Delete the entry
    await db.delete(entries).where(eq(entries.id, id));

    return true;
  }

  async getStarredEntries(userId: number): Promise<Entry[]> {
    return await db
      .select()
      .from(entries)
      .where(and(eq(entries.userId, userId), eq(entries.isStarred, true)))
      .orderBy(desc(entries.createdAt));
  }

  // Emotion methods
  async addEmotions(insertEmotions: InsertEmotion[]): Promise<Emotion[]> {
    if (insertEmotions.length === 0) return [];

    const createdEmotions = await db
      .insert(emotions)
      .values(insertEmotions)
      .returning();

    return createdEmotions;
  }

  async getEmotionsByEntryId(entryId: number): Promise<Emotion[]> {
    return await db
      .select()
      .from(emotions)
      .where(eq(emotions.entryId, entryId));
  }

  async deleteEmotionsByEntryId(entryId: number): Promise<boolean> {
    await db.delete(emotions).where(eq(emotions.entryId, entryId));

    return true;
  }

  // Theme methods
  async addThemes(insertThemes: InsertTheme[]): Promise<Theme[]> {
    if (insertThemes.length === 0) return [];

    const createdThemes = await db
      .insert(themes)
      .values(insertThemes)
      .returning();

    return createdThemes;
  }

  async getThemesByEntryId(entryId: number): Promise<Theme[]> {
    return await db.select().from(themes).where(eq(themes.entryId, entryId));
  }

  async deleteThemesByEntryId(entryId: number): Promise<boolean> {
    await db.delete(themes).where(eq(themes.entryId, entryId));

    return true;
  }

  // Combined methods
  async getEntryWithAnalysis(
    entryId: number,
  ): Promise<EntryWithAnalysis | undefined> {
    const entry = await this.getEntryById(entryId);
    if (!entry) return undefined;

    const entryEmotions = await this.getEmotionsByEntryId(entryId);
    const entryThemes = await this.getThemesByEntryId(entryId);

    return {
      ...entry,
      // Ensure boolean values are always defined
      isStarred: entry.isStarred === null ? false : entry.isStarred,
      clarityRating: entry.clarityRating === null ? 0 : entry.clarityRating,
      emotions: entryEmotions,
      themes: entryThemes,
    };
  }

  async getEntriesWithAnalysisByUserId(
    userId: number,
  ): Promise<{ results: EntryWithAnalysis[]; insights: Insight[] }> {
    const userEntries = await this.getEntriesByUserId(userId);
    const results: EntryWithAnalysis[] = [];
    const themeCounts: { [theme: string]: number } = {};

    for (const entry of userEntries) {
      const entryEmotions = await this.getEmotionsByEntryId(entry.id);
      const entryThemes = await this.getThemesByEntryId(entry.id);
      for (const theme of entryThemes) {
        themeCounts[theme.theme] = (themeCounts[theme.theme] || 0) + 1;
      }
      results.push({
        ...entry,
        isStarred: entry.isStarred === null ? false : entry.isStarred,
        clarityRating: entry.clarityRating === null ? 0 : entry.clarityRating,
        emotions: entryEmotions,
        themes: entryThemes,
      });
    }

    // Convert to: "Work (10), Learning (5), Stress (8), Family (6)"
    const themeSummary = Object.entries(themeCounts)
      .map(([theme, count]) => `${theme} (${count})`)
      .join(", ");

    const prompt = `
    You are a personal journaling assistant trained to detect meaningful psychological and emotional patterns using recurring theme summaries from journal entries.

You will be given a list of recurring themes with the number of times each theme appeared across multiple journal entries : ${themeSummary}

Using this limited but insightful data, generate 2 to 3 personalized insights that reflect potential life patterns, inner conflicts, emotional states, or growth opportunities.

 Each insight should feel emotionally intelligent and reflective — like something a thoughtful therapist or coach might observe. Don’t just repeat the themes — interpret them. Make thoughtful guesses about the "why" behind the pattern.

 For each insight, return:

"title": A compelling, human-readable title (e.g., “Driven but Drained” or “Relationships on the Back Burner”)

"description": A short, meaningful paragraph (2-4 sentences) explaining what this pattern could reveal about the person's mindset, values, habits, or emotional state. Offer depth, not just surface-level repetition.

"suggestedColor": A thematic color capturing the emotional tone (e.g., "blue" = introspection, "red" = urgency/intensity, "green" = growth/healing, "yellow" = optimism/curiosity, "purple" = complexity/transformation)

"derivedEntryCount": Your best guess at how many journal entries contributed to this pattern. This should reflect the combined weight of the themes involved, even if approximate.

 Return ONLY a valid JSON array, like this:
[
  {
    "title": "Driven but Drained",
    "description": "There is a strong emphasis on work and projects, often accompanied by high stress and anxiety. This suggests an intense focus on achievement, possibly at the expense of mental well-being. You may be pushing hard without taking time to recharge.",
    "suggestedColor": "red",
    "derivedEntryCount": 22
  },
  {
    "title": "Emotional Undercurrents",
    "description": "While relationships aren't the dominant theme, their presence combined with anxiety hints at unresolved emotional tension or social stress. These entries may reflect moments of emotional processing that bubble up between tasks.",
    "suggestedColor": "blue",
    "derivedEntryCount": 6
  }
]
 Your goal is to help the journal writer understand patterns in who they are becoming — not just what they're doing.
        `;
    let insights: Insight[] = [];
    try {
      insights = await geminiRequest(prompt, InsightSchema);
      //console.log(insights);
    } catch (err) {
      console.warn("Failed to fetch insights:", err);
      insights = [
        {
          title: "Work-Life Balance",
          description:
            "Your work-related entries show increasing concern about balance. Consider setting boundaries.",
          suggestedColor: "blue",
          derivedEntryCount: entries.filter((e) =>
            e.themes?.some((t) =>
              ["Work", "Balance", "Time Management"].includes(t.theme),
            ),
          ).length,
        },
      ]; // fallback mock
    }
    return {
      results,
      insights,
    };
  }

  async getStarredEntriesWithAnalysis(
    userId: number,
  ): Promise<EntryWithAnalysis[]> {
    const starredEntries = await this.getStarredEntries(userId);
    const results: EntryWithAnalysis[] = [];

    for (const entry of starredEntries) {
      const entryEmotions = await this.getEmotionsByEntryId(entry.id);
      const entryThemes = await this.getThemesByEntryId(entry.id);
      results.push({
        ...entry,
        isStarred: entry.isStarred === null ? false : entry.isStarred,
        clarityRating: entry.clarityRating === null ? 0 : entry.clarityRating,
        emotions: entryEmotions,
        themes: entryThemes,
      });
    }

    return results;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
