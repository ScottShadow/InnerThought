import OpenAI from "openai";
import { Analysis, analysisSchema } from "@shared/schema";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "demo-api-key" });

// Schema for OpenAI response
const openAIResponseSchema = z.object({
  emotions: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100)
  })),
  themes: z.array(z.string())
});

export async function analyzeJournalEntry(text: string): Promise<Analysis> {
  if (process.env.NODE_ENV === 'development' && !process.env.OPENAI_API_KEY) {
    // Return mock data only during development and with no API key
    return {
      emotions: [
        { name: "Motivated", score: 75 },
        { name: "Anxious", score: 25 },
        { name: "Reflective", score: 40 }
      ],
      themes: ["Work", "Project Management", "Self-confidence", "Planning"]
    };
  }

  try {
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an emotional and thematic analysis expert for journal entries. " +
            "Analyze the text to identify emotions and themes. " +
            "Return your analysis as JSON with 'emotions' (array of emotion objects with 'name' and 'score' from 0-100) " +
            "and 'themes' (array of theme strings). " +
            "Identify 2-4 primary emotions and 2-5 themes. Be specific with emotion labels. " +
            "Example themes: Work, Relationships, Health, Creativity, Learning, etc."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const validatedResult = openAIResponseSchema.parse(result);
    return validatedResult;
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    throw new Error("Failed to analyze journal entry content");
  }
}
