export const getAiResponse = async (prompt: string, systemInstruction?: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is missing. Please check your environment variables.");
  }

  // Official Gemini API generateContent endpoint structure
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Build request body matching the Gemini API schema structure
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    // System instruction parameter for Gemini API content customization
    ...(systemInstruction && {
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      }
    }),
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 2048,
    }
  };

  try {
    console.log("[Gemini AI] Invoking model: gemini-1.5-flash");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini AI] API Call failed with status ${response.status}:`, errorText);
      throw new Error(`Gemini API returned error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract reply text from standard Gemini response tree
    const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (contentText.trim().length > 0) {
      return contentText;
    }

    throw new Error("Gemini API returned an empty candidate text.");
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    console.error("[Gemini AI] Connection Exception:", err.name === 'AbortError' ? 'Timeout' : err.message);
    throw error;
  }
};
