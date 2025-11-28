// api/recipe.js - SIMPLIFIED WORKING VERSION
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple test endpoint
  if (req.method === 'GET') {
    return res.json({ 
      status: 'OK', 
      message: 'Celestique AI API is working!',
      version: '5.0.0'
    });
  }

  // Handle recipe generation
  if (req.method === 'POST') {
    try {
      const { message, preferences = {} } = req.body;

      if (!message) {
        return res.status(400).json({ 
          success: false,
          error: 'Recipe request is required' 
        });
      }

      console.log('Generating recipe for:', message);

      // Try AI generation first
      let recipeData;
      try {
        recipeData = await generateUltraRecipe(message, preferences);
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        recipeData = generateFallbackRecipe(message, preferences);
      }

      // Return success response
      return res.status(200).json({
        success: true,
        data: recipeData
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      const fallbackRecipe = generateFallbackRecipe(
        req.body?.message || 'Delicious Recipe', 
        req.body?.preferences || {}
      );
      return res.status(200).json({
        success: true,
        data: fallbackRecipe
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// AI Recipe Generator
async function generateUltraRecipe(userInput, preferences = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('No API key, using fallback');
    throw new Error('API key not configured');
  }

  const recipePrompt = `Create a detailed recipe for: "${userInput}"

Provide response in this EXACT JSON format:

{
  "name": "Recipe Name",
  "description": "Recipe description",
  "cuisine": "Cuisine Type",
  "difficulty": "Easy/Medium/Hard",
  "prep_time": "XX mins",
  "cook_time": "XX mins", 
  "total_time": "XX mins",
  "servings": 4,
  "calories_per_serving": 450,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "quantity": "Measurement", 
      "notes": "Preparation notes"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "description": "Detailed instruction",
      "time": "XX mins",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "chef_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "nutritional_info": {
    "calories": 450,
    "protein": "XXg",
    "carbs": "XXg", 
    "fat": "XXg"
  }
}`;

  const models = [
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat-v3.1:free'
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      if (recipe) {
        console.log(`Success with model: ${model}`);
        
        return {
          ...recipe,
          powered_by: 'Celestique AI by Sooban Talha Technologies',
          generated_at: new Date().toISOString(),
          recipe_id: generateRecipeId(),
          version: '5.0.0'
        };
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
    }
  }
  throw new Error('All models failed');
}

async function tryRecipeModel(model, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://celestiqueai.vercel.app',
      'X-Title': 'Celestique AI Recipes'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('No JSON found in response');
}

// Fallback recipe generator
function generateFallbackRecipe(topic, preferences = {}) {
  return {
    name: `Delicious ${topic}`,
    description: `A wonderful recipe for ${topic} created with care and expertise.`,
    cuisine: "International",
    difficulty: "Medium",
    prep_time: "15 mins",
    cook_time: "30 mins",
    total_time: "45 mins",
    servings: 4,
    calories_per_serving: 400,
    ingredients: [
      { name: "Main ingredient", quantity: "500g", notes: "Fresh and high quality" },
      { name: "Vegetables", quantity: "2 cups", notes: "Seasonal varieties" },
      { name: "Spices", quantity: "1 tbsp", notes: "To taste" }
    ],
    instructions: [
      {
        step: 1,
        description: `Prepare your ingredients for ${topic}. Wash, chop, and measure everything needed.`,
        time: "10 mins",
        tips: ["Work carefully", "Use sharp tools"]
      },
      {
        step: 2,
        description: "Start cooking with the main ingredients. Build flavors gradually.",
        time: "15 mins",
        tips: ["Taste as you go", "Adjust heat as needed"]
      }
    ],
    chef_tips: [
      "Use fresh ingredients for best results",
      "Don't rush the cooking process", 
      "Taste and adjust seasoning throughout"
    ],
    nutritional_info: {
      calories: 400,
      protein: "25g",
      carbs: "45g",
      fat: "15g"
    },
    recipe_score: 85,
    powered_by: "Celestique AI by Sooban Talha Technologies",
    generated_at: new Date().toISOString(),
    recipe_id: generateRecipeId(),
    version: '5.0.0'
  };
}

function generateRecipeId() {
  return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}