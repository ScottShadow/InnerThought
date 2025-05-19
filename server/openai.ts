import axios from "axios";
// Assuming Analysis type might come from a shared schema, or use the Zod inferred type.
// For this example, we'll use the locally defined Analysis type which matches the Zod schema.
// import { Analysis } from "@shared/schema";
import { z } from "zod";

// Schema for the expected API response structure (from Gemini, in our case)
const geminiResponseSchemaEmoTheme = z.object({
  emotions: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100), // Score representing intensity/confidence
    }),
  ),
  themes: z.array(z.string()),
});

// Type definitions
type Emotion = { name: string; score: number };
type Analysis = { emotions: Emotion[]; themes: string[] };
// Alternatively, for stricter typing based on the schema:
// type Analysis = z.infer<typeof geminiResponseSchemaEmoTheme>;

// Your existing mock analysis function (good for fallback or testing)
function generateMockAnalysis(text: string): Analysis {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/); // Simple tokenizer

  const emotionKeywords: Record<string, { keyword: string; weight: number }[]> =
    {
      Happy: [
        { keyword: "happy", weight: 1.0 },
        { keyword: "joy", weight: 0.9 },
        { keyword: "cheerful", weight: 0.8 },
        { keyword: "content", weight: 0.7 },
        { keyword: "grateful", weight: 0.6 },
        { keyword: "glad", weight: 0.5 },
        { keyword: "fine", weight: 0.5 },
        { keyword: "pleased", weight: 0.4 },
        { keyword: "satisfied", weight: 0.3 },
        { keyword: "laugh", weight: 0.5 },
        { keyword: "laughing", weight: 0.6 },
        { keyword: "smile", weight: 0.4 },
        { keyword: "smiling", weight: 0.6 },
      ],
      Excited: [
        { keyword: "excited", weight: 1.0 },
        { keyword: "thrilled", weight: 0.9 },
        { keyword: "eager", weight: 0.8 },
        { keyword: "buzzing", weight: 0.7 },
      ],
      Sad: [
        { keyword: "sad", weight: 1.0 },
        { keyword: "depressed", weight: 0.9 },
        { keyword: "down", weight: 0.7 },
        { keyword: "blue", weight: 0.6 },
        { keyword: "heartbroken", weight: 0.8 },
        { keyword: "tearful", weight: 0.7 },
        { keyword: "tears", weight: 0.6 },
        { keyword: "cry", weight: 0.8 },
      ],
      Angry: [
        { keyword: "angry", weight: 1.0 },
        { keyword: "furious", weight: 0.9 },
        { keyword: "irritated", weight: 0.7 },
        { keyword: "mad", weight: 0.8 },
      ],
      Reflective: [
        { keyword: "reflective", weight: 1.0 },
        { keyword: "introspective", weight: 0.9 },
        { keyword: "contemplative", weight: 0.8 },
      ],
      Curious: [
        { keyword: "curious", weight: 1.0 },
        { keyword: "inquisitive", weight: 0.9 },
        { keyword: "interested", weight: 0.8 },
      ],
      Motivated: [
        { keyword: "motivated", weight: 1.0 },
        { keyword: "driven", weight: 0.9 },
        { keyword: "focused", weight: 0.8 },
      ],
      Anxious: [
        { keyword: "anxious", weight: 1.0 },
        { keyword: "worried", weight: 0.9 },
        { keyword: "nervous", weight: 0.8 },
        { keyword: "scared", weight: 0.7 },
      ],
    };

  const themeKeywords: Record<string, { keyword: string; weight: number }[]> = {
    Work: [
      { keyword: "job", weight: 1.0 },
      { keyword: "career", weight: 0.9 },
      { keyword: "boss", weight: 0.7 },
      { keyword: "work", weight: 1.0 },
      { keyword: "promotion", weight: 0.8 },
      { keyword: "interview", weight: 0.9 },
      { keyword: "salary", weight: 0.8 },
      { keyword: "office", weight: 0.7 },
      { keyword: "overtime", weight: 0.7 },
    ],
    Learning: [
      { keyword: "learn", weight: 1.0 },
      { keyword: "study", weight: 0.9 },
      { keyword: "course", weight: 0.8 },
      { keyword: "training", weight: 0.8 },
      { keyword: "education", weight: 0.7 },
      { keyword: "school", weight: 0.6 },
      { keyword: "university", weight: 0.5 },
      { keyword: "college", weight: 0.4 },
      { keyword: "graduation", weight: 0.3 },
      { keyword: "certificate", weight: 0.2 },
      { keyword: "teach", weight: 0.2 },
      { keyword: "teacher", weight: 0.1 },
    ],
    Relationships: [
      { keyword: "friend", weight: 1.0 },
      { keyword: "family", weight: 1.0 },
      { keyword: "partner", weight: 0.9 },
      { keyword: "relationship", weight: 0.9 },
      { keyword: "date", weight: 0.8 },
      { keyword: "romance", weight: 0.7 },
      { keyword: "man", weight: 0.5 },
      { keyword: "woman", weight: 0.5 },
      { keyword: "dating", weight: 0.4 },
      { keyword: "marriage", weight: 0.3 },
      { keyword: "love", weight: 1 },
      { keyword: "mom", weight: 0.2 },
      { keyword: "dad", weight: 0.1 },
      { keyword: "sister", weight: 0.1 },
      { keyword: "brother", weight: 0.1 },
      { keyword: "daughter", weight: 0.1 },
      { keyword: "son", weight: 0.1 },
      { keyword: "grandma", weight: 0.1 },
      { keyword: "grandpa", weight: 0.1 },
      { keyword: "granddaughter", weight: 0.1 },
      { keyword: "grandson", weight: 0.1 },
      { keyword: "aunt", weight: 0.1 },
      { keyword: "uncle", weight: 0.1 },
      { keyword: "cousin", weight: 0.1 },
    ],
    Health: [
      { keyword: "exercise", weight: 1.0 },
      { keyword: "diet", weight: 0.9 },
      { keyword: "sleep", weight: 0.8 },
      { keyword: "wellness", weight: 0.7 },
      { keyword: "healthy", weight: 0.6 },
      { keyword: "workout", weight: 1 },
      { keyword: "pushups", weight: 0.5 },
      { keyword: "run", weight: 0.6 },
      { keyword: "jog", weight: 0.6 },
      { keyword: "vacation", weight: 0.6 },
      { keyword: "meditation", weight: 0.6 },
      { keyword: "journal", weight: 0.6 },
    ],
    Finance: [
      { keyword: "money", weight: 1.0 },
      { keyword: "budget", weight: 0.9 },
      { keyword: "salary", weight: 0.8 },
      { keyword: "investment", weight: 0.7 },
      { keyword: "income", weight: 1 },
      { keyword: "spend", weight: 0.5 },
      { keyword: "expense", weight: 0.6 },
      { keyword: "pay", weight: 0.5 },
      { keyword: "credit", weight: 0.5 },
      { keyword: "borrow", weight: 0.5 },
      { keyword: "debt", weight: 0.6 },
    ],
    Creativity: [
      { keyword: "create", weight: 1.0 },
      { keyword: "paint", weight: 0.9 },
      { keyword: "write", weight: 0.8 },
      { keyword: "build", weight: 0.7 },
      { keyword: "design", weight: 0.6 },
      { keyword: "art", weight: 0.5 },
      { keyword: "music", weight: 0.4 },
      { keyword: "dance", weight: 0.3 },
      { keyword: "poetry", weight: 0.2 },
      { keyword: "poem", weight: 0.1 },
      { keyword: "song", weight: 0.1 },
      { keyword: "story", weight: 0.1 },
    ],
  };

  function computeScores<
    T extends Record<string, { keyword: string; weight: number }[]>,
  >(categories: T): Record<keyof T, number> {
    const scores: Partial<Record<keyof T, number>> = {};
    for (const category in categories) {
      let score = 0;
      for (const { keyword, weight } of categories[category]) {
        const count = words.filter((w) => w === keyword).length;
        score += count * weight;
      }
      scores[category] = score;
    }
    return scores as Record<keyof T, number>;
  }

  const emotionScores = computeScores(emotionKeywords);
  const themeScores = computeScores(themeKeywords);

  const sortedEmotions = Object.entries(emotionScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => ({
      name,
      score: Math.min(Math.round(score * 30 + 20), 100),
    })) // Adjusted scoring for mock
    .slice(0, 3); // Limit to top 3 mock emotions

  const sortedThemes = Object.entries(themeScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, _]) => name)
    .slice(0, 3); // Limit to top 3 mock themes

  const fallbackEmotion = [{ name: "Neutral", score: 50 }];
  const fallbackTheme = ["General"];

  return {
    emotions: sortedEmotions.length > 0 ? sortedEmotions : fallbackEmotion,
    themes: sortedThemes.length > 0 ? sortedThemes : fallbackTheme,
  };
}

export async function analyzeJournalEntry(text: string): Promise<Analysis> {
  // Carefully crafted prompt to instruct Gemini
  const prompt = `
You are an expert text analysis AI. Your task is to analyze the provided journal entry for its dominant emotions and key themes.
You MUST respond ONLY with a valid JSON object. Do NOT include any text, comments, or markdown formatting like \`\`\`json before or after the JSON object.
The JSON object must strictly follow this structure:
{
  "emotions": [
    { "name": "EmotionName1", "score": Score1 },
    { "name": "EmotionName2", "score": Score2 }
  ],
  "themes": [
    "Theme1",
    "Theme2",
    "Theme3"
  ]
}

- "emotions": An array of objects. Each object must have a "name" (string) and a "score" (number between 0 and 100 representing intensity/confidence). Include 1 to 3 dominant emotions. If no strong emotion is detected, you can use "Neutral".
- "themes": An array of strings. Include 1 to 3 key themes. If no specific theme is clear, you can use "General".

Example 1:
User input: "I felt so happy and joyful today after getting the promotion at work! It's a dream come true."
Your JSON response:
{
  "emotions": [
    { "name": "Happy", "score": 95 },
    { "name": "Excited", "score": 90 }
  ],
  "themes": [
    "Work",
    "Achievement",
    "Happiness"
  ]
}

Example 2:
User input: "Feeling a bit down and sad. Missed an important deadline and my boss was not pleased. I need to focus better."
Your JSON response:
{
  "emotions": [
    { "name": "Sad", "score": 80 },
    { "name": "Anxious", "score": 60 },
    { "name": "Disappointed", "score": 70 }
  ],
  "themes": [
    "Work",
    "Stress",
    "Self-improvement"
  ]
}

Example 3:
User input: "Just a regular day, nothing much happened. Did some chores, read a book."
Your JSON response:
{
  "emotions": [
    { "name": "Neutral", "score": 70 }
  ],
  "themes": [
    "Daily Life",
    "Routine"
  ]
}

Now, analyze the following journal entry:
---
${text}
---
`;
  let results = await geminiRequest(prompt, geminiResponseSchemaEmoTheme);
  return results;
}
export async function geminiRequest(prompt: string, validator: ZodObject<any>) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure this is set in your .env file

    // If API key is missing, fall back to mock analysis or throw an error
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Falling back to mock analysis.");
      return generateMockAnalysis(text);
    }
    // You can change the model if needed, e.g., to "gemini-pro" or a specific version like "gemini-2.0-flash" if available to you
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    //console.log("Sending request to Gemini API...");
    const geminiResponse = await axios.post(
      API_URL,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          // Optional: Helps guide the model
          responseMimeType: "application/json", // Request JSON output
          temperature: 0.4, // Lower temperature for more deterministic/factual JSON
          maxOutputTokens: 800, // Adjust as needed for expected JSON size
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    //console.log("Received response from Gemini API.");

    // Extract the JSON string from Gemini's response
    let rawJsonString;
    if (
      geminiResponse.data.candidates &&
      geminiResponse.data.candidates[0].content &&
      geminiResponse.data.candidates[0].content.parts &&
      geminiResponse.data.candidates[0].content.parts[0].text
    ) {
      rawJsonString = geminiResponse.data.candidates[0].content.parts[0].text;
    } else if (
      geminiResponse.data.promptFeedback &&
      geminiResponse.data.promptFeedback.blockReason
    ) {
      // Handle cases where the prompt was blocked by Gemini's safety filters
      const blockReason = geminiResponse.data.promptFeedback.blockReason;
      console.error("Gemini API prompt was blocked:", blockReason);
      throw new Error(
        `Gemini API prompt blocked due to: ${blockReason.reason || "Unknown safety concern"}`,
      );
    } else {
      console.error(
        "Unexpected Gemini API response structure:",
        geminiResponse.data,
      );
      throw new Error(
        "Unexpected Gemini API response structure. Check API documentation or response payload.",
      );
    }

    // The model should ideally return clean JSON if responseMimeType is set and prompt is clear.
    // This cleaning step is a fallback for robustness.
    const cleanedJsonString = rawJsonString
      .replace(/^```json\s*([\s\S]*?)\s*```$/, "$1")
      .trim();

    let analysisData;
    try {
      analysisData = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      console.error("Raw response string from Gemini:", cleanedJsonString);
      throw new Error("Invalid JSON response from Gemini API.");
    }

    // Validate the response structure using Zod
    const validatedResult = validator.parse(analysisData);
    //console.log("Successfully validated Gemini response:", validatedResult);
    return validatedResult;
  } catch (error) {
    console.error("Error analyzing journal entry with Gemini API:", error);

    // Provide a clear error state in the Analysis object
    let errorMessage = "Unknown error processing entry";
    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Axios request failed";
      console.error("Axios error details:", error.response?.data);
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Fallback to mock data or a specific error structure
    // For a better user experience, you might want to return a more specific error structure
    // than falling back to mock data in case of a real API failure.
    console.warn(
      "Gemini API call failed. Falling back to mock analysis for now.",
    );
    // return generateMockAnalysis(text); // Option 1: Fallback to mock

    // Option 2: Return an error structure
    return {
      emotions: [{ name: "API Error", score: 0 }],
      themes: [`Error: ${errorMessage}`],
    };
  }
}
// Example usage (for testing purposes, ensure GEMINI_API_KEY is in your environment):
// async function testAnalysis() {
//   // Ensure you have a .env file with GEMINI_API_KEY="YOUR_API_KEY"
//   // and you are using a library like dotenv (npm install dotenv) and configuring it:
//   // require('dotenv').config();
//
//   const sampleText1 = "I had a wonderful day! I met my friends and we laughed a lot. Feeling grateful.";
//   const sampleText2 = "This project is so stressful. I'm worried I won't finish it on time.";
//   const sampleText3 = "Just watched a movie. It was okay.";
//
//   console.log("\nAnalyzing Sample 1:");
//   const analysis1 = await analyzeJournalEntry(sampleText1);
//   console.log(JSON.stringify(analysis1, null, 2));
//
//   // console.log("\nAnalyzing Sample 2:");
//   // const analysis2 = await analyzeJournalEntry(sampleText2);
//   // console.log(JSON.stringify(analysis2, null, 2));
//
//   // console.log("\nAnalyzing Sample 3 (API key missing to test fallback):");
//   // const oldApiKey = process.env.GEMINI_API_KEY;
//   // delete process.env.GEMINI_API_KEY; // Temporarily remove for testing fallback
//   // const analysis3 = await analyzeJournalEntry(sampleText3);
//   // console.log(JSON.stringify(analysis3, null, 2));
//   // process.env.GEMINI_API_KEY = oldApiKey; // Restore
// }

// testAnalysis();
