export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { destination, days, style, interests } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a travel planner. Generate a structured itinerary.",
          },
          {
            role: "user",
            content: `Plan a ${days}-day trip to ${destination}. Style: ${style}. Interests: ${interests.join(", ")}.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log("OPENAI RAW:", data);

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: "No result from AI" });
    }

    res.status(200).json({ result });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}