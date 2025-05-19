import axios from "axios";
import { Analysis } from "@shared/schema";
import { z } from "zod";

// Schema for Requestly API response validation
const requestlyResponseSchema = z.object({
  emotions: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100)
  })),
  themes: z.array(z.string())
});

export async function analyzeJournalEntry(text: string): Promise<Analysis> {
  // Check if we have the Requestly API key
  if (!process.env.REQUESTLY_API_KEY) {
    console.log("Missing Requestly API key - please configure it in your environment");
    
    // Return error-state data
    return {
      emotions: [
        { name: "Error", score: 0 },
        { name: "API Key Required", score: 0 }
      ],
      themes: ["API Configuration Needed"]
    };
  }
  
  try {
    // Call Requestly API for journal analysis
    const response = await axios.post(
      'https://api.requestly.io/journal/analyze',
      { 
        text: text,
        analysisType: 'emotion-theme'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REQUESTLY_API_KEY}`
        }
      }
    );
    
    // Validate the response structure
    const validatedResult = requestlyResponseSchema.parse(response.data);
    return validatedResult;
  } catch (error) {
    console.error("Error analyzing journal entry with Requestly API:", error);
    
    // Return a clear error state rather than mock data
    if (axios.isAxiosError(error)) {
      return {
        emotions: [
          { name: "API Error", score: 0 },
          { name: error.message || "Unknown error", score: 0 }
        ],
        themes: ["Error Processing Entry"]
      };
    }
    
    return {
      emotions: [
        { name: "Unknown Error", score: 0 }
      ],
      themes: ["Error Processing Entry"]
    };
  }
}
