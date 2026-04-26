export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { destination, days, style, budget, language, interests } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are an expert AI travel planner. Return ONLY valid JSON. No markdown. No explanations.",
          },
          {
            role: "user",
            content: `
Create a ${days}-day travel itinerary for ${destination}.

Style: ${style}
Budget: ${budget}
Language: ${language}
Interests: ${interests.join(", ")}

Return ONLY this JSON format:
{
  "places": [
    {
      "day": 1,
      "title": "Place name",
      "placeName": "Exact searchable place name",
      "type": "Culture / Food / Viewpoint / Landmark",
      "duration": "60-90 min",
      "movement": "Walk / Metro / Taxi",
      "reason": "Why this stop is worth visiting",
      "photo": "Best photo or video idea",
      "query": "map search query"
    }
  ]
}

Make 2-4 places per day.
`
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    const text = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(text);

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}