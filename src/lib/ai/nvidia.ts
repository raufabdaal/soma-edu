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

  console.log("Calling Nvidia NIM API with model: google/diffusiongemma-26b-a4b-it");

  try {
    const response = await fetch(invoke_url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "google/diffusiongemma-26b-a4b-it",
        messages: messages,
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nvidia API Error Status:", response.status, response.statusText);
      console.error("Nvidia API Error Body:", errorText);
      throw new Error(`Nvidia API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    if (!content) {
      console.warn("Nvidia NIM returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error("Nvidia AI API Exception:", error);
    throw error;
  }
};
