// Advanced Celestique AI Recipe Generator API
// Uses multiple free AI models via OpenRouter for comprehensive recipe generation

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
    const { message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Recipe description is required' });
    }

    // Try to generate advanced recipe with AI
    let recipeData;
    try {
      recipeData = await generateAdvancedRecipe({
        message,
        userName: userName || 'Valued Chef',
        dietaryPreference: dietaryPreference || 'balanced',
        cuisinePreference: cuisinePreference || 'international',
        mealType: mealType || 'main',
        cookingTime: cookingTime || 'moderate'
      });
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipeData = generateFallbackRecipe(message, userName || 'Chef');
    }

    res.status(200).json(recipeData);

  } catch (error) {
    console.error('Unexpected error:', error);
    const fallbackRecipe = generateFallbackRecipe(req.body?.message || 'Delicious Meal', req.body?.userName || 'Chef');
    res.status(200).json(fallbackRecipe);
  }
};

// Ultra-detailed AI recipe generator with emotional connection
async function generateAdvancedRecipe(params) {
  const { message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime } = params;
  
  if (!process.env.OPENROUTER_API_KEY) {
    // Fallback to local generation if no API key
    return generateLocalAdvancedRecipe(params);
  }

  const recipePrompt = `As Celestique AI - World's Most Advanced Recipe Generator, create a DEEP, EMOTIONAL, and COMPREHENSIVE recipe for: "${message}".

IMPORTANT CONTEXT:
- User's name: ${userName}
- Dietary preference: ${dietaryPreference}
- Cuisine preference: ${cuisinePreference}
- Meal type: ${mealType}
- Cooking time preference: ${cookingTime}

ABOUT CELESTIQUE AI:
We believe food is memory, emotion, and connection. Every recipe should tell a story, evoke feelings, and create moments worth remembering. We're not just giving instructions - we're creating culinary experiences.

CRITICAL REQUIREMENTS:
1. EMOTIONAL CONNECTION: Write as if you're a personal chef who knows ${userName} intimately.
2. CULINARY STORYTELLING: Every recipe has a story.
3. PERSONALIZED TIPS: Include advice specifically tailored to ${userName}.
4. COMPREHENSIVE STRUCTURE: Include ALL sections listed below.

RESPONSE FORMAT:
Return ONLY valid JSON in this EXACT structure:

{
  "recipe_title": "Creative recipe title",
  "emotional_introduction": "Detailed personal introduction...",
  "cuisine_origin": "Origin description...",
  "cultural_background": "Cultural context...",
  "preparation_time": "XX minutes",
  "cooking_time": "XX minutes",
  "difficulty_level": "Level with explanation",
  "serving_size": "X servings",
  "calories_estimate": "XXX per serving",
  "nutrition_breakdown": {
    "protein": "XXg",
    "carbohydrates": "XXg",
    "fat": "XXg",
    "fiber": "XXg",
    "sugar": "XXg",
    "sodium": "XXmg",
    "key_vitamins": "Vitamin details"
  },
  "ingredients_list": [
    {"amount": "XX unit", "name": "Ingredient name", "emotional_note": "Why this ingredient matters"}
  ],
  "ingredient_substitutions": [
    {"original": "Ingredient", "substitution": "Alternative", "reason": "Why this works"}
  ],
  "step_by_step_instructions": [
    {"step": 1, "instruction": "Detailed instruction", "sensory_cue": "What to look/feel/smell for", "chef_note": "Pro tip for this step"}
  ],
  "pro_chef_tips": [
    {"tip": "Specific tip", "explanation": "Why this makes a difference"}
  ],
  "common_mistakes": [
    {"mistake": "Common error", "solution": "How to avoid it", "consequence": "What happens if you don't"}
  ],
  "flavor_profile": {
    "primary_tastes": "Description",
    "aroma_notes": "Scent description",
    "texture_profile": "Mouthfeel description",
    "aftertaste": "Finish description"
  },
  "side_dish_pairings": [
    {"dish": "Side dish", "rationale": "Why it pairs well"}
  ],
  "wine_beverage_pairings": [
    {"beverage": "Specific wine/drink", "pairing_notes": "Flavor harmony explanation"}
  ],
  "storage_guidance": {
    "refrigerator": "Instructions",
    "freezer": "Instructions",
    "room_temperature": "Instructions",
    "best_consumed_within": "Timeframe"
  },
  "reheating_instructions": {
    "oven_method": "Instructions",
    "stovetop_method": "Instructions",
    "microwave_method": "Instructions with caveats"
  },
  "variations": [
    {"variation_name": "e.g., Vegan Adaptation", "modifications": "Specific changes", "flavor_impact": "How it changes the dish"}
  ],
  "health_notes": {
    "nutritional_benefits": "Specific health benefits",
    "dietary_considerations": "Allergens/special diets",
    "wellness_tips": "How to maximize nutritional value"
  },
  "seasonal_adaptations": {
    "spring": "Adjustments",
    "summer": "Adjustments",
    "fall": "Adjustments",
    "winter": "Adjustments"
  },
  "emotional_closing": "Personal closing message to ${userName}",
  "chef_secret": "One special secret that elevates this recipe"
}
`;

  const models = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-32b-instruct:free'
  ];

  // No timeout - let models take as long as needed for quality
  for (const model of models) {
    try {
      console.log(`Trying recipe model: ${model} for ${userName}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      if (recipe && isValidRecipe(recipe)) {
        console.log(`Success with model: ${model}`);
        
        // Enhance with additional metadata
        recipe.powered_by = 'Celestique AI';
        recipe.generated_for = userName;
        recipe.generated_at = new Date().toISOString();
        recipe.recipe_id = `celestique_${Date.now()}`;
        
        return recipe;
      }
    } catch (error) {
      console.log(`Model ${model} failed:`, error.message);
      // Continue to next model
    }
  }
  
  // If all models fail, use local generation
  console.log('All AI models failed, using local generation');
  return generateLocalAdvancedRecipe(params);
}

// Try a specific AI model for recipe generation
async function tryRecipeModel(model, prompt) {
  const response = await fetch('[https://openrouter.ai/api/v1/chat/completions](https://openrouter.ai/api/v1/chat/completions)', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': '[https://celestiqueai.vercel.app](https://celestiqueai.vercel.app)',
      'X-Title': 'Celestique AI'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'You are Celestique AI. Return ONLY valid JSON. Do not use Markdown formatting like ```json.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 6000,
      temperature: 0.8,
      response_format: { type: "json_object" } // Force JSON
    })
  });

  if (!response.ok) {
    throw new Error(`Model ${model} failed with status: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // UPDATED: Clean Markdown before parsing
  content = content.replace(/```json\n?|```/g, '').trim();

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const recipeData = JSON.parse(jsonMatch[0]);
      return recipeData;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in response');
    }
  }
  
  throw new Error('No valid JSON found in response');
}

// Validate recipe structure
function isValidRecipe(recipe) {
  const requiredFields = [
    'recipe_title',
    'emotional_introduction',
    'ingredients_list',
    'step_by_step_instructions'
  ];
  
  return requiredFields.every(field => 
    recipe[field] && 
    (Array.isArray(recipe[field]) ? recipe[field].length > 0 : String(recipe[field]).trim().length > 0)
  );
}

// Local advanced recipe generator (fallback when no API key)
function generateLocalAdvancedRecipe(params) {
  const { message, userName, cuisinePreference } = params;
  
  // Simplified local fallback for stability
  return {
    recipe_title: `Hearty ${cuisinePreference} Comfort Bowl`,
    emotional_introduction: `Dear ${userName}, this recipe is a warm hug designed just for you.`,
    cuisine_origin: `${cuisinePreference} Fusion`,
    cultural_background: "A modern take on traditional comfort.",
    preparation_time: '25 minutes',
    cooking_time: '40 minutes',
    difficulty_level: 'Beginner-Friendly',
    serving_size: '4 servings',
    calories_estimate: '480 per serving',
    nutrition_breakdown: {
      protein: '28g', carbohydrates: '52g', fat: '18g', fiber: '12g', sugar: '8g', sodium: '620mg', key_vitamins: 'Vitamins A, C, K'
    },
    ingredients_list: [
      { amount: '1.5 lbs', name: 'Chicken or Tofu', emotional_note: 'The foundation' },
      { amount: '2 cups', name: 'Broth', emotional_note: 'Liquid warmth' },
      { amount: '1', name: 'Sweet potato', emotional_note: 'Natural sweetness' }
    ],
    ingredient_substitutions: [
        { original: "Chicken", substitution: "Chickpeas", reason: "Vegetarian option" }
    ],
    step_by_step_instructions: [
      { step: 1, instruction: 'Prep ingredients.', sensory_cue: 'Enjoy the colors', chef_note: 'Uniform cuts matter' },
      { step: 2, instruction: 'Simmer gently.', sensory_cue: 'Smell the aroma', chef_note: 'Low and slow' }
    ],
    pro_chef_tips: [
       { tip: "Taste as you go", explanation: "Adjust seasoning to your preference" }
    ],
    common_mistakes: [
       { mistake: "Rushing", solution: "Take your time", consequence: "Flavor won't develop" }
    ],
    flavor_profile: {
        primary_tastes: "Savory", aroma_notes: "Herbal", texture_profile: "Creamy", aftertaste: "Pleasant"
    },
    side_dish_pairings: [],
    wine_beverage_pairings: [],
    storage_guidance: { refrigerator: "3 days", freezer: "1 month", room_temperature: "No", best_consumed_within: "2 days" },
    reheating_instructions: { oven_method: "350F", stovetop_method: "Low heat", microwave_method: "2 mins" },
    variations: [],
    health_notes: { nutritional_benefits: "High protein", dietary_considerations: "None", wellness_tips: "Eat slowly" },
    seasonal_adaptations: { spring: "Add peas", summer: "Add corn", fall: "Add squash", winter: "Add root veggies" },
    emotional_closing: `Enjoy this meal, ${userName}.`,
    chef_secret: "Love is the secret ingredient."
  };
}

// Simple fallback
function generateFallbackRecipe(message, userName) {
  return generateLocalAdvancedRecipe({ message, userName, cuisinePreference: 'Global' });
}