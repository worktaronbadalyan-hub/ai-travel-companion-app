export default async function handler(req, res) {
    try {
      const { destination, days, style, interests } = req.body;
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: "You are a travel planner. Generate a structured itinerary."
            },
            {
              role: "user",
              content: `Plan a ${days}-day trip to ${destination}. Style: ${style}. Interests: ${interests.join(", ")}.`
            }
          ]
        }),
      });
  
      const data = await response.json();
  
      res.status(200).json({
        result: data.choices[0].message.content
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }