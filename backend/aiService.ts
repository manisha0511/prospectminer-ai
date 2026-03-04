import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI, Type } from "@google/genai";

// 🔎 Debug logs
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// ⚠️ Don't remove this
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function enrichLeadWithAI(lead: any, websiteText: string) {
  try {
    const prompt = `
Analyze the following business information and website content.

Business Name: ${lead.name}
Website: ${lead.website}

Website Content:
${websiteText}

Extract structured JSON with:
- category
- services
- ownerName
- emailGuess
- score

Return ONLY valid JSON.
`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const text = result.text;
    if (!text) throw new Error("Empty AI response");

    return JSON.parse(text);

  } catch (error) {
    console.error("AI Enrichment Error:", error);
    return {
      category: "",
      services: "",
      ownerName: "",
      emailGuess: "",
      score: "Low",
    };
  }
}