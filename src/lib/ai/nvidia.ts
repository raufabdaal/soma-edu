export const getAiResponse = async (prompt: string, systemInstruction?: string) => {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey || apiKey === "your_nvidia_api_key_here") {
    throw new Error("Nvidia API key is missing. Please check your environment variables.");
  }

  const invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions";

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch(invoke_url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-405b-instruct", // High-quality default, user suggested google/diffusiongemma but llama is often better for text tasks
        messages: messages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Nvidia API Error Detail:", errorData);
      throw new Error(`Nvidia API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Nvidia AI API Error:", error);
    throw error;
  }
};
