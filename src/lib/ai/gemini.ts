import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getGeminiResponse = async (prompt: string, systemInstruction?: string) => {
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is missing or invalid. Please check your environment variables.");
  }

  try {
    const modelWithSystem = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    const result = await modelWithSystem.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI API Error:", error);
    if (error instanceof Error && error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API Key. Please verify it in Google AI Studio.");
    }
    throw error;
  }
};
