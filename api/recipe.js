// For Vercel serverless function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.origin,
        'X-Title': 'Célestique AI'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content: `You are Célestique AI, a world-class culinary assistant from Sooban Talha Productions. 
            Create exquisite, detailed recipes with the following structure in JSON format:
            {
              "name": "Recipe Name",
              "cuisine": "Cuisine Type",
              "difficulty": "Difficulty Level",
              "prep_time": "Preparation Time",
              "ingredients": ["ingredient 1", "ingredient 2", ...],
              "instructions": ["step 1", "step 2", ...],
              "tips": ["tip 1", "tip 2", ...],
              "score": 95
            }
            Make the recipe luxurious, detailed, and include professional chef tips.
            Always respond with valid JSON only.`
          },
          { role: "user", content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const responseText = data.choices[0].message.content;
    
    try {
      // Try to parse the recipe from the response
      let recipeData;
      if (responseText.includes('```json')) {
        const jsonStr = responseText.split('```json')[1].split('```')[0].trim();
        recipeData = JSON.parse(jsonStr);
      } else if (responseText.includes('```')) {
        const jsonStr = responseText.split('```')[1].split('```')[0].trim();
        recipeData = JSON.parse(jsonStr);
      } else {
        recipeData = JSON.parse(responseText);
      }
      
      res.status(200).json(recipeData);
    } catch (e) {
      // If parsing fails, return the raw response
      res.status(200).json({ 
        name: "Custom Recipe",
        cuisine: "International",
        difficulty: "Moderate",
        prep_time: "Varies",
        ingredients: ["Ingredients based on your request"],
        instructions: [responseText],
        tips: ["Enjoy your culinary creation!"],
        score: 90
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}