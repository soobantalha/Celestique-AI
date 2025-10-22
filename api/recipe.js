// Ultra-advanced recipe generator with unlimited time
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
    const { message, preferences = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Recipe request is required' });
    }

    // Try to generate recipe with AI (no time limit)
    let recipeData;
    try {
      recipeData = await generateRecipe(message, preferences);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipeData = generateFallbackRecipe(message);
    }

    res.status(200).json(recipeData);

  } catch (error) {
    console.error('Unexpected error:', error);
    const fallbackRecipe = generateFallbackRecipe(req.body?.message || 'Delicious Recipe');
    res.status(200).json(fallbackRecipe);
  }
};

// Ultra-detailed AI recipe generator with unlimited time
async function generateRecipe(userInput, preferences) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  const recipePrompt = `As Celestique AI Master Chef - provide COMPREHENSIVE, DETAILED recipe for: "${userInput}".

  USER PREFERENCES: ${JSON.stringify(preferences)}

  IMPORTANT: Provide RESTAURANT-QUALITY responses with:
  - Detailed recipe name and description
  - Exact cooking times and servings
  - Comprehensive ingredient list with quantities
  - Step-by-step cooking instructions
  - 5 professional chef tips
  - Nutritional information
  - Flavor profile analysis
  - Wine/ beverage pairings
  - Dietary information
  - Equipment needed

  Provide response in this EXACT JSON format:

  {
    "name": "Professional Recipe Name",
    "description": "Detailed description of the dish",
    "cuisine": "Cuisine Type",
    "difficulty": "Easy/Medium/Hard",
    "prep_time": "15 mins",
    "cook_time": "30 mins",
    "total_time": "45 mins",
    "servings": 4,
    "calories_per_serving": 350,
    "ingredients": [
      {"name": "Ingredient 1", "quantity": "200g", "notes": "optional notes"},
      {"name": "Ingredient 2", "quantity": "2 tbsp", "notes": ""}
    ],
    "equipment": ["Equipment 1", "Equipment 2"],
    "instructions": [
      {"step": 1, "description": "Detailed step 1", "time": "5 mins", "tips": ["tip1"]},
      {"step": 2, "description": "Detailed step 2", "time": "10 mins", "tips": []}
    ],
    "chef_tips": [
      "Professional tip 1 with detailed explanation",
      "Professional tip 2 with detailed explanation",
      "Professional tip 3 with detailed explanation",
      "Professional tip 4 with detailed explanation",
      "Professional tip 5 with detailed explanation"
    ],
    "nutritional_info": {
      "calories": 350,
      "protein": "25g",
      "carbs": "45g",
      "fat": "12g",
      "fiber": "8g"
    },
    "flavor_profile": {
      "savory": 8,
      "sweet": 3,
      "spicy": 2,
      "umami": 7
    },
    "pairings": ["Wine: Chardonnay", "Beer: IPA", "Non-alcoholic: Sparkling water with lemon"],
    "dietary_tags": ["Gluten-Free", "High-Protein"],
    "recipe_score": 94
  }

  Make it RESTAURANT-QUALITY, DETAILED, and PRACTICAL. Focus on professional cooking techniques.`;

  const models = [
    
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'deepseek/deepseek-chat-v3.1:free',
    'deepseek/deepseek-r1-0528:free'
  ];

  // No timeout - let models take as long as needed
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      if (recipe) {
        console.log(`Success with model: ${model}`);
        return recipe;
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
      max_tokens: 5000, // Increased for detailed recipes
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`Model failed: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const recipeData = JSON.parse(jsonMatch[0]);
    recipeData.powered_by = 'Celestique AI - Sooban Talha Technologies';
    recipeData.generated_at = new Date().toISOString();
    recipeData.recipe_id = generateRecipeId();
    return recipeData;
  }
  throw new Error('No JSON found in response');
}

function generateRecipeId() {
  return 'rec_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Enhanced fallback with professional recipe structure
function generateFallbackRecipe(request) {
  return {
    name: `Professional ${request} Recipe`,
    description: `A masterfully crafted ${request} recipe featuring premium ingredients and professional cooking techniques.`,
    cuisine: "International Fusion",
    difficulty: "Medium",
    prep_time: "20 mins",
    cook_time: "35 mins",
    total_time: "55 mins",
    servings: 4,
    calories_per_serving: 420,
    ingredients: [
      {name: "Premium protein", quantity: "500g", notes: "chicken, fish, or tofu"},
      {name: "Fresh vegetables", quantity: "3 cups", notes: "seasonal selection"},
      {name: "Aromatic herbs", quantity: "2 tbsp", notes: "fresh chopped"},
      {name: "Quality oil", quantity: "3 tbsp", notes: "olive or avocado"},
      {name: "Flavor base", quantity: "1 medium", notes: "onion and garlic"},
      {name: "Liquid component", quantity: "1 cup", notes: "broth or cream"},
      {name: "Seasoning blend", quantity: "2 tsp", notes: "house-made mix"}
    ],
    equipment: ["Chef's knife", "Cutting board", "Large skillet", "Mixing bowls", "Measuring tools"],
    instructions: [
      {step: 1, description: "Prepare all ingredients using professional mise en place techniques. Chop vegetables uniformly, measure seasonings, and organize workstation.", time: "15 mins", tips: ["Keep ingredients organized for efficient cooking"]},
      {step: 2, description: "Build flavor foundation by sautéing aromatics until fragrant and golden. Develop deep flavors through proper caramelization.", time: "8 mins", tips: ["Don't rush this step - flavor development is crucial"]},
      {step: 3, description: "Cook main ingredients to perfection, adjusting heat and timing for optimal texture and flavor integration.", time: "12 mins", tips: ["Monitor cooking progress closely"]},
      {step: 4, description: "Combine all elements, adjust seasoning with precision, and finish with professional plating techniques.", time: "5 mins", tips: ["Taste and adjust seasoning before serving"]}
    ],
    chef_tips: [
      "Use a digital thermometer for perfect protein cooking every time",
      "Let ingredients come to room temperature before cooking for even results",
      "Develop layers of flavor by adding ingredients at optimal times",
      "Balance flavors with acid (lemon/vinegar) at the end of cooking",
      "Rest proteins before slicing to retain juices and maximize flavor"
    ],
    nutritional_info: {
      calories: 420,
      protein: "35g",
      carbs: "28g",
      fat: "18g",
      fiber: "6g"
    },
    flavor_profile: {
      savory: 9,
      sweet: 4,
      spicy: 3,
      umami: 8
    },
    pairings: ["Medium-bodied red wine", "Craft lager beer", "Sparkling water with citrus"],
    dietary_tags: ["High-Protein", "Customizable"],
    recipe_score: 92,
    powered_by: "Celestique AI - Sooban Talha Technologies",
    generated_at: new Date().toISOString(),
    recipe_id: generateRecipeId()
  };
}