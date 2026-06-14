interface NvidiaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const getAiResponse = async (prompt: string, systemInstruction?: string) => {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey || apiKey === "your_nvidia_api_key_here") {
    throw new Error("Nvidia API key is missing. Please check your environment variables.");
  }

  const invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions";

  const messages: NvidiaMessage[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  // Try multiple models in sequence for maximum reliability
  const models = [
    "meta/llama-3.1-405b-instruct",
    "meta/llama-3.1-70b-instruct",
    "google/gemma-2-27b-it"
  ];

  for (const modelName of models) {
    try {
      console.log(`[Nvidia AI] Attempting call with model: ${modelName}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(invoke_url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.1,
          top_p: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Nvidia AI] Model ${modelName} failed (${response.status}):`, errorText);
        continue;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";

      if (content && content.length > 5) {
        return content;
      }

      console.warn(`[Nvidia AI] Model ${modelName} returned empty or too short response.`);
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      console.error(`[Nvidia AI] Error with model ${modelName}:`, err.name === 'AbortError' ? 'Timeout' : err.message);
      continue;
    }
  }

  throw new Error("All AI models failed to provide a reliable response. Please check your API quota or network connectivity.");
};
