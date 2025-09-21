// Enhanced recipe generator using DeepSeek AI via OpenRouter
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
    
    // Use fallback recipe instead of error response
    const fallbackRecipe = generateFallbackRecipe(message);
    res.status(200).json(fallbackRecipe);
  }
};

// Generate recipe using DeepSeek AI
async function generateRecipeWithDeepSeek(userInput) {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OpenRouter API key is not set');
    throw new Error('API service is temporarily unavailable. Using fallback recipe.');
  }

  // Construct the enhanced prompt for recipe generation
  const prompt = `As Célestique AI, a world-renowned culinary expert, create a sophisticated gourmet recipe based on: "${userInput}"

Respond with ONLY a valid JSON object in this exact structure:

{
  "name": "Elegant recipe name",
  "cuisine": "Cuisine type",
  "difficulty": "Easy/Medium/Hard",
  "prep_time": "X minutes",
  "cook_time": "X minutes", 
  "serves": "X people",
  "ingredients": [
    "precise measurement ingredient 1",
    "precise measurement ingredient 2"
  ],
  "instructions": [
    "Detailed step 1 with technique",
    "Detailed step 2 with technique"
  ],
  "chef_tips": [
    "Professional tip 1",
    "Professional tip 2"
  ],
  "nutritional_notes": "Brief nutritional information",
  "wine_pairing": "Suggested wine pairing",
  "score": 90
}

Make it restaurant-quality with precise measurements and professional techniques.`;

  try {
    console.log('Making API call to DeepSeek...');

    // Call OpenRouter API with DeepSeek model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'https://celestiqueai.vercel.app',
        'X-Title': 'Célestique AI Recipe Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'system',
            content: 'You are Célestique AI, a master chef. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`API service temporarily unavailable`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid API response');
    }

    const recipeText = data.choices[0].message.content.trim();
    console.log('Raw AI response:', recipeText.substring(0, 200) + '...');

    // Clean the response and extract JSON
    let jsonString = recipeText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Find JSON object in the response
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    try {
      const parsedRecipe = JSON.parse(jsonString);

      // Validate the required fields
      if (!parsedRecipe.name || !parsedRecipe.ingredients || !parsedRecipe.instructions) {
        throw new Error('Missing required recipe fields');
      }

      // Add metadata
      parsedRecipe.generated_at = new Date().toISOString();
      parsedRecipe.powered_by = 'DeepSeek AI';

      console.log('Successfully parsed recipe:', parsedRecipe.name);
      return parsedRecipe;

    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// Enhanced fallback recipe generator
function generateFallbackRecipe(input) {
  // ... (keep your existing fallback function as is)
}