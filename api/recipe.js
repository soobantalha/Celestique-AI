// Celestique AI Recipe Generator API - Advanced Version
// Uses OpenRouter AI models with robust error handling

module.exports = async (req, res) => {
  // Enhanced CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  try {
    const { 
      message, 
      userName = 'Valued Chef', 
      dietaryPreference = 'balanced', 
      cuisinePreference = 'international', 
      mealType = 'main', 
      cookingTime = 'moderate' 
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Recipe description required',
        message: 'Please provide a description of the recipe you want to create'
      });
    }

    console.log(`Generating recipe for: ${userName} - "${message.substring(0, 50)}..."`);

    let recipeData;
    let source = 'ai';
    
    try {
      // Try AI generation first
      recipeData = await generateAdvancedRecipe({
        message: message.trim(),
        userName,
        dietaryPreference,
        cuisinePreference,
        mealType,
        cookingTime
      });
    } catch (aiError) {
      console.error('AI generation failed:', aiError.message);
      console.log('Falling back to local generation');
      source = 'local';
      recipeData = generateLocalAdvancedRecipe({
        message: message.trim(),
        userName,
        cuisinePreference,
        dietaryPreference,
        mealType,
        cookingTime
      });
    }

    // Add metadata
    recipeData.generated_at = new Date().toISOString();
    recipeData.recipe_id = `celestique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    recipeData.source = source;
    recipeData.powered_by = source === 'ai' ? 'Celestique AI with OpenRouter' : 'Celestique AI Local Engine';

    res.status(200).json({
      success: true,
      recipe: recipeData,
      meta: {
        generated_for: userName,
        generation_source: source,
        timestamp: recipeData.generated_at
      }
    });

  } catch (error) {
    console.error('Unexpected server error:', error);
    
    // Ultimate fallback
    const fallbackRecipe = generateFallbackRecipe(
      req.body?.message || 'Delicious Meal', 
      req.body?.userName || 'Chef'
    );
    
    res.status(200).json({
      success: true,
      recipe: fallbackRecipe,
      meta: {
        generated_for: req.body?.userName || 'Chef',
        generation_source: 'fallback',
        timestamp: new Date().toISOString(),
        note: 'Server experienced an issue, but we created a recipe for you'
      }
    });
  }
};

// Advanced AI Recipe Generator
async function generateAdvancedRecipe(params) {
  const { message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime } = params;
  
  // Check for API key
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_api_key_here') {
    console.log('No API key found, using local generation');
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
}`;

  const models = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-32b-instruct:free'
  ];

  // Try models sequentially
  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      
      if (recipe && isValidRecipe(recipe)) {
        console.log(`✅ Success with model: ${model}`);
        return recipe;
      }
    } catch (error) {
      console.log(`❌ Model ${model} failed: ${error.message}`);
      // Continue to next model
    }
  }
  
  // If all models fail
  console.log('All AI models failed, using local generation');
  return generateLocalAdvancedRecipe(params);
}

// Try a specific AI model
async function tryRecipeModel(model, prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://celestiqueai.vercel.app',
        'X-Title': 'Celestique AI Recipe Generator'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'You are Celestique AI, an advanced recipe generator. Always return valid JSON. Do not include any markdown formatting, explanations, or additional text outside the JSON object.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 6000,
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from AI');
    }

    let content = data.choices[0].message.content;
    
    // Robust markdown and formatting cleanup
    content = content
      .replace(/```json\s*/g, '')  // Remove ```json
      .replace(/```\s*/g, '')      // Remove ```
      .replace(/^```|```$/g, '')   // Remove ``` at start/end
      .replace(/^\{/, '{')         // Ensure starts with {
      .replace(/\}$/, '}')         // Ensure ends with }
      .trim();
    
    // Extract JSON using regex
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const recipeData = JSON.parse(jsonMatch[0]);
    
    // Validate basic structure
    if (!recipeData.recipe_title || !recipeData.ingredients_list || !recipeData.step_by_step_instructions) {
      throw new Error('Recipe missing required fields');
    }
    
    return recipeData;
    
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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

// Local advanced recipe generator (comprehensive fallback)
function generateLocalAdvancedRecipe(params) {
  const { message, userName, cuisinePreference, dietaryPreference, mealType, cookingTime } = params;
  
  // Generate creative title based on input
  const adjectives = ['Hearty', 'Gourmet', 'Artisanal', 'Signature', 'Elevated', 'Comforting'];
  const cuisines = ['Fusion', 'Modern', 'Classic', 'Contemporary', 'Rustic'];
  const dishes = ['Bowl', 'Plate', 'Creation', 'Masterpiece', 'Experience'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const cui = cuisines[Math.floor(Math.random() * cuisines.length)];
  const dish = dishes[Math.floor(Math.random() * dishes.length)];
  
  const title = `${adj} ${cuisinePreference} ${cui} ${dish}`;
  
  return {
    recipe_title: title,
    emotional_introduction: `Dear ${userName}, I crafted this recipe with you in mind. Every ingredient was chosen to create not just a meal, but a memory. This ${mealType} reflects the care and attention you deserve in your kitchen.`,
    cuisine_origin: `${cuisinePreference} with modern influences`,
    cultural_background: "A celebration of global flavors meeting personal taste, this dish honors traditional techniques while embracing contemporary creativity.",
    preparation_time: cookingTime === 'quick' ? '15 minutes' : cookingTime === 'long' ? '40 minutes' : '25 minutes',
    cooking_time: cookingTime === 'quick' ? '20 minutes' : cookingTime === 'long' ? '60 minutes' : '35 minutes',
    difficulty_level: 'Intermediate with clear guidance',
    serving_size: '4 servings',
    calories_estimate: '450 per serving',
    nutrition_breakdown: {
      protein: '28g',
      carbohydrates: '42g',
      fat: '22g',
      fiber: '8g',
      sugar: '6g',
      sodium: '580mg',
      key_vitamins: 'Rich in Vitamins A, C, and Iron'
    },
    ingredients_list: [
      { amount: '1.5 lbs', name: 'Main Protein (chicken, tofu, or lentils)', emotional_note: 'The foundation of your meal' },
      { amount: '2 tbsp', name: 'Quality Olive Oil', emotional_note: 'For richness and depth' },
      { amount: '3 cloves', name: 'Fresh Garlic, minced', emotional_note: 'Adds soul-warming aroma' },
      { amount: '1', name: 'Large Onion, diced', emotional_note: 'Sweetness that builds complexity' },
      { amount: '2 cups', name: 'Seasonal Vegetables', emotional_note: 'Nature\'s colorful palette' },
      { amount: '1 cup', name: 'Grain (rice, quinoa, or pasta)', emotional_note: 'Comforting base' },
      { amount: '2 cups', name: 'Broth or Stock', emotional_note: 'Liquid gold that ties everything together' },
      { amount: '1 tsp', name: 'Sea Salt', emotional_note: 'Enhances natural flavors' },
      { amount: '½ tsp', name: 'Black Pepper', emotional_note: 'Warm, aromatic spice' },
      { amount: '1 tbsp', name: 'Fresh Herbs', emotional_note: 'A touch of freshness' }
    ],
    ingredient_substitutions: [
      { original: "Main Protein", substitution: "Any protein of choice", reason: "Flexibility for your preferences" },
      { original: "Olive Oil", substitution: "Avocado oil or butter", reason: "Similar cooking properties" },
      { original: "Seasonal Vegetables", substitution: "Frozen vegetables", reason: "Convenient and nutritious" }
    ],
    step_by_step_instructions: [
      { step: 1, instruction: 'Gather and prepare all ingredients.', sensory_cue: 'Enjoy the colors and textures', chef_note: 'Mise en place makes cooking joyful' },
      { step: 2, instruction: 'Heat oil in a large pan over medium heat.', sensory_cue: 'Oil should shimmer but not smoke', chef_note: 'Proper temperature prevents sticking' },
      { step: 3, instruction: 'Add aromatics (garlic, onion) and sauté until fragrant.', sensory_cue: 'Smell the wonderful aroma', chef_note: 'This builds flavor foundation' },
      { step: 4, instruction: 'Add main protein and cook until browned.', sensory_cue: 'Listen to the satisfying sizzle', chef_note: 'Browning adds depth of flavor' },
      { step: 5, instruction: 'Add vegetables and seasonings, stir to combine.', sensory_cue: 'Watch the colors brighten', chef_note: 'Season in layers' },
      { step: 6, instruction: 'Add grains and broth, bring to simmer.', sensory_cue: 'Bubbles should be gentle', chef_note: 'Simmering allows flavors to meld' },
      { step: 7, instruction: 'Cover and cook until everything is tender.', sensory_cue: 'Steam carries delicious smells', chef_note: 'Patience creates perfection' },
      { step: 8, instruction: 'Adjust seasoning, garnish, and serve warm.', sensory_cue: 'Taste and adjust to your liking', chef_note: 'Final touch makes it yours' }
    ],
    pro_chef_tips: [
      { tip: "Taste as you go", explanation: "Your palate is your best tool for perfect seasoning" },
      { tip: "Let it rest", explanation: "Allowing the dish to sit for 5 minutes before serving improves flavor distribution" }
    ],
    common_mistakes: [
      { mistake: "Overcrowding the pan", solution: "Cook in batches if needed", consequence: "Ingredients steam instead of brown" },
      { mistake: "Adding garlic too early", solution: "Add after onions soften", consequence: "Garlic can burn and turn bitter" }
    ],
    flavor_profile: {
      primary_tastes: "Savory with subtle sweetness",
      aroma_notes: "Herbal and comforting",
      texture_profile: "Satisfying and varied",
      aftertaste: "Warm and lingering"
    },
    side_dish_pairings: [
      { dish: "Crusty bread", rationale: "Perfect for soaking up delicious juices" },
      { dish: "Simple green salad", rationale: "Adds freshness and contrast" }
    ],
    wine_beverage_pairings: [
      { beverage: "Medium-bodied red wine", pairing_notes: "Complements the savory notes" },
      { beverage: "Sparkling water with lemon", pairing_notes: "Cleanses the palate between bites" }
    ],
    storage_guidance: {
      refrigerator: "Store in airtight container for up to 4 days",
      freezer: "Freeze for up to 3 months, thaw overnight in refrigerator",
      room_temperature: "Not recommended",
      best_consumed_within: "3 days for optimal freshness"
    },
    reheating_instructions: {
      oven_method: "Reheat at 350°F (175°C) for 15-20 minutes until warm",
      stovetop_method: "Reheat gently over medium-low heat with a splash of water",
      microwave_method: "Heat in 1-minute intervals, stirring between"
    },
    variations: [
      { variation_name: "Spicy Version", modifications: "Add chili flakes or fresh chilies", flavor_impact: "Adds warmth and complexity" },
      { variation_name: "Creamy Version", modifications: "Stir in ½ cup cream or coconut milk", flavor_impact: "Creates richer, smoother texture" }
    ],
    health_notes: {
      nutritional_benefits: "Balanced macronutrients, high in vitamins and fiber",
      dietary_considerations: "Can be adapted for gluten-free, dairy-free, or vegan diets",
      wellness_tips: "Enjoy mindfully, savor each bite"
    },
    seasonal_adaptations: {
      spring: "Add fresh peas and asparagus",
      summer: "Use zucchini and bell peppers",
      fall: "Incorporate squash and mushrooms",
      winter: "Add root vegetables and hearty greens"
    },
    emotional_closing: `${userName}, remember that the most important ingredient is always the love and care you put into your cooking. May this dish bring you joy and satisfaction.`,
    chef_secret: "The secret is to cook with gratitude - each ingredient is a gift from nature."
  };
}

// Simple fallback
function generateFallbackRecipe(message, userName) {
  return generateLocalAdvancedRecipe({ 
    message, 
    userName, 
    cuisinePreference: 'Global',
    dietaryPreference: 'balanced',
    mealType: 'main',
    cookingTime: 'moderate'
  });
}