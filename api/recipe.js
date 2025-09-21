// Updated recipe generator using DeepSeek AI via OpenRouter
module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Call DeepSeek AI via OpenRouter
    const recipe = await generateRecipeWithDeepSeek(message);
    
    res.status(200).json(recipe);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate recipe using DeepSeek AI
async function generateRecipeWithDeepSeek(message) {
  // Construct the prompt for recipe generation
  const prompt = `Generate a detailed gourmet recipe based on the following request: "${message}".
  
  Please provide the response in JSON format with the following structure:
  {
    "name": "Recipe name",
    "cuisine": "Cuisine type",
    "difficulty": "Difficulty level",
    "prep_time": "Preparation time",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "tips": ["tip 1", "tip 2", ...],
    "score": 85
  }
  
  Make the recipe sound gourmet and professional. Include specific measurements and cooking techniques.`;

  try {
    // Call OpenRouter API with DeepSeek model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://celestiqueai.vercel.app',
        'X-Title': 'Célestique AI'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If JSON extraction fails, use fallback
    return generateFallbackRecipe(message);
    
  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Use fallback if API call fails
    return generateFallbackRecipe(message);
  }
}

// Fallback recipe generator (kept from original implementation)
function generateFallbackRecipe(message) {
  // ... (keep the original fallback recipe generation code)
  // This is the same as the original generateRecipeFromMessage function
}