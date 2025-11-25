/**
 * Celestique AI - ULTRA Recipe Generator (Study.js Logic)
 * Same structure as study.js but for recipes
 * @version 5.0.0
 * @author Sooban Talha Technologies
 */

module.exports = async (req, res) => {
  // Handle CORS - Same as study.js
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request - Same as study.js
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, preferences = {}, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Recipe request is required' });
    }

    // Try to generate recipe with AI (no time limit) - Same logic as study.js
    let recipeData;
    try {
      recipeData = await generateUltraRecipe(message, preferences, context);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipeData = generateFallbackRecipe(message, preferences);
    }

    res.status(200).json(recipeData);

  } catch (error) {
    console.error('Unexpected error:', error);
    const fallbackRecipe = generateFallbackRecipe(req.body?.message || 'Delicious Recipe', req.body?.preferences || {});
    res.status(200).json(fallbackRecipe);
  }
};

// Ultra-detailed AI recipe generator with unlimited time - Same structure as study.js
async function generateUltraRecipe(userInput, preferences = {}, context = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  const recipePrompt = `As Celestique AI Master Chef - provide ULTRA DETAILED, COMPREHENSIVE restaurant-quality recipe for: "${userInput}"

IMPORTANT: Provide HIGH-QUALITY responses with:
- 1500-2000 words detailed instructions
- 8-10 ingredients with precise measurements
- 6-8 detailed cooking steps
- 5 professional chef tips
- Comprehensive nutrition analysis
- Advanced flavor profiling
- Focus on quality and detail

Provide response in this EXACT JSON format:

{
  "name": "Creative Recipe Name",
  "description": "Detailed description with flavor science",
  "cuisine": "Specific Cuisine Type",
  "difficulty": "Easy/Medium/Hard/Expert",
  "prep_time": "XX mins",
  "cook_time": "XX mins", 
  "total_time": "XX mins",
  "servings": 4,
  "calories_per_serving": 450,
  "ingredients": [
    {
      "name": "Ingredient Name",
      "quantity": "Precise Measurement", 
      "notes": "Preparation notes or alternatives",
      "category": "produce/protein/dairy"
    }
  ],
  "equipment": ["Equipment 1", "Equipment 2", "Equipment 3"],
  "instructions": [
    {
      "step": 1,
      "description": "Detailed, actionable instruction with science",
      "time": "XX mins",
      "temperature": "XXX°F/°C if applicable",
      "tips": ["Professional tip 1", "Tip 2"],
      "visual_cues": ["What to look for at this stage"]
    }
  ],
  "chef_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "nutritional_info": {
    "calories": 450,
    "protein": "XXg",
    "carbs": "XXg", 
    "fat": "XXg",
    "fiber": "XXg",
    "sugar": "XXg",
    "sodium": "XXmg"
  },
  "flavor_profile": {
    "savory": 8,
    "sweet": 4,
    "spicy": 3,
    "umami": 7,
    "bitter": 2,
    "sour": 5,
    "richness": 6
  },
  "pairings": {
    "wine": ["Wine pairing 1", "Wine pairing 2"],
    "beer": ["Beer pairing 1", "Beer pairing 2"],
    "non_alcoholic": ["Non-alcoholic pairing 1", "Non-alcoholic pairing 2"]
  },
  "dietary_tags": ["Tag1", "Tag2", "Tag3"],
  "presentation_tips": ["Presentation tip 1", "Presentation tip 2"],
  "storage_instructions": "Detailed storage guidance",
  "recipe_score": 95
}

Make it COMPREHENSIVE, DETAILED, and PROFESSIONAL. Focus on restaurant-quality results.`;

  const models = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'deepseek/deepseek-chat-v3.1:free',
    'deepseek/deepseek-r1-0528:free'
  ];

  // No timeout - let models take as long as needed - Same as study.js
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      if (recipe) {
        console.log(`Success with model: ${model}`);
        // Add metadata like study.js
        recipe.powered_by = 'Celestique AI by Sooban Talha Technologies';
        recipe.generated_at = new Date().toISOString();
        recipe.recipe_id = generateRecipeId();
        return recipe;
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
    }
  }
  throw new Error('All models failed');
}

// Same structure as tryStudyModel
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
      max_tokens: 8000, // Increased for detailed recipes
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`Model failed: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Same JSON extraction logic as study.js
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const recipeData = JSON.parse(jsonMatch[0]);
    return recipeData;
  }
  throw new Error('No JSON found in response');
}

// Enhanced fallback with detailed content - Same structure as study.js fallback
function generateFallbackRecipe(topic, preferences = {}) {
  return {
    name: `Chef's Special ${topic}`,
    description: `A masterfully crafted ${topic} featuring premium ingredients, sophisticated techniques, and balanced flavors that showcase professional culinary artistry.`,
    cuisine: "International Fusion",
    difficulty: "Medium",
    prep_time: "25 mins",
    cook_time: "40 mins",
    total_time: "65 mins",
    servings: 4,
    calories_per_serving: 450,
    ingredients: [
      {
        name: "Premium protein selection",
        quantity: "600g", 
        notes: "chicken thigh, salmon fillet, or firm tofu",
        category: "protein"
      },
      {
        name: "Seasonal vegetables",
        quantity: "4 cups",
        notes: "colorful variety, chopped uniformly", 
        category: "produce"
      },
      {
        name: "Aromatic base",
        quantity: "1 large",
        notes: "onion, garlic, ginger finely minced",
        category: "aromatics"
      },
      {
        name: "Quality cooking oil",
        quantity: "3 tbsp",
        notes: "extra virgin olive oil or avocado oil",
        category: "fat"
      },
      {
        name: "Fresh herbs",
        quantity: "1/4 cup",
        notes: "basil, cilantro, or parsley chopped",
        category: "herbs"
      },
      {
        name: "Acid component", 
        quantity: "2 tbsp",
        notes: "lemon juice, vinegar, or wine",
        category: "acid"
      },
      {
        name: "Flavor enhancers",
        quantity: "2 tsp",
        notes: "soy sauce, fish sauce, or miso paste",
        category: "seasoning"
      },
      {
        name: "Texture element",
        quantity: "1/2 cup",
        notes: "toasted nuts, seeds, or crispy elements",
        category: "garnish"
      }
    ],
    equipment: ["Chef's knife 8-inch", "Cutting board", "Large skillet or wok", "Mixing bowls", "Measuring tools"],
    instructions: [
      {
        step: 1,
        description: "Prepare all ingredients using professional mise en place technique. Chop vegetables to uniform sizes, measure seasonings precisely, and organize workstation for efficient workflow.",
        time: "15 mins",
        temperature: "Room temperature",
        tips: ["Keep ingredients organized in small bowls", "Clean as you go for efficient workflow"],
        visual_cues: ["All ingredients measured and prepared", "Workstation clean and organized"]
      },
      {
        step: 2,
        description: "Build flavor foundation by sautéing aromatic base in quality oil until fragrant and lightly golden. Develop complex flavors through proper caramelization without burning.",
        time: "8 mins", 
        temperature: "Medium heat",
        tips: ["Don't rush this step - flavor development is crucial", "Adjust heat to prevent burning"],
        visual_cues: ["Aromatics are translucent and fragrant", "Light golden color achieved"]
      },
      {
        step: 3,
        description: "Cook main ingredients in stages, starting with proteins to develop sear and texture, then adding vegetables based on cooking times. Maintain proper heat control throughout.",
        time: "15 mins",
        temperature: "Medium-high heat", 
        tips: ["Don't overcrowd the pan - cook in batches if needed", "Season each layer as you cook"],
        visual_cues: ["Protein is properly seared", "Vegetables are tender-crisp"]
      },
      {
        step: 4,
        description: "Combine all elements, deglaze pan with acid component, and simmer to integrate flavors. Adjust seasoning with precision and finish with fresh herbs and texture elements.",
        time: "7 mins",
        temperature: "Low heat",
        tips: ["Taste and adjust seasoning multiple times", "Let dish rest 2-3 minutes before serving"],
        visual_cues: ["Sauce is properly reduced", "Herbs are bright and fresh"]
      }
    ],
    chef_tips: [
      "Use a digital thermometer for perfect protein cooking every time",
      "Let ingredients come to room temperature before cooking for even results",
      "Develop layers of flavor by adding ingredients at optimal times",
      "Balance flavors systematically - add acid at the end to brighten",
      "Rest proteins before slicing to retain juices for maximum flavor"
    ],
    nutritional_info: {
      calories: 450,
      protein: "35g",
      carbs: "32g",
      fat: "22g", 
      fiber: "8g",
      sugar: "12g",
      sodium: "680mg"
    },
    flavor_profile: {
      savory: 8,
      sweet: 4,
      spicy: 3,
      umami: 7,
      bitter: 2,
      sour: 5,
      richness: 6
    },
    pairings: {
      wine: ["Sauvignon Blanc - crisp acidity complements fresh herbs", "Pinot Noir - light body matches without overwhelming"],
      beer: ["Pale Ale - hoppy notes cut through richness", "Wheat Beer - refreshing contrast"],
      non_alcoholic: ["Sparkling water with cucumber and mint", "Ginger beer with lime"]
    },
    dietary_tags: ["High-Protein", "Customizable", "Chef-Approved"],
    presentation_tips: [
      "Plate with height and negative space for restaurant appeal",
      "Garnish with fresh herb sprigs and texture elements at the last moment"
    ],
    storage_instructions: "Store in airtight container in refrigerator for up to 3 days. Reheat gently in skillet over medium heat with splash of water or broth to refresh.",
    recipe_score: 92,
    powered_by: "Celestique AI by Sooban Talha Technologies",
    generated_at: new Date().toISOString(),
    recipe_id: generateRecipeId()
  };
}

// Helper function like study.js
function generateRecipeId() {
  return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}