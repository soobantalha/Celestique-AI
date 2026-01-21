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
1. EMOTIONAL CONNECTION: Write as if you're a personal chef who knows ${userName} intimately. Use warm, personal language that makes them feel seen and understood.
2. CULINARY STORYTELLING: Every recipe has a story - connect it to memories, seasons, or cultural traditions.
3. SENSORY DETAIL: Describe flavors, aromas, textures, and visuals in vivid detail.
4. PERSONALIZED TIPS: Include advice specifically tailored to ${userName}'s preferences and cooking style.
5. COMPREHENSIVE STRUCTURE: Include ALL sections listed below.

MANDATORY SECTIONS (be extremely detailed in each):

1. recipe_title: Creative, evocative title that captures the essence
2. emotional_introduction: 150-200 words addressing ${userName} personally, connecting the recipe to emotions/memories
3. cuisine_origin: Detailed origin story with cultural/historical context
4. cultural_background: 100-150 words about the cultural significance
5. preparation_time: Specific timing with breakdown
6. cooking_time: Specific timing with breakdown
7. difficulty_level: Beginner/Intermediate/Advanced with explanation
8. serving_size: Number with portion description
9. calories_estimate: Per serving with breakdown
10. nutrition_breakdown: Detailed macros and micronutrients
11. ingredients_list: 8-15 ingredients with precise measurements AND emotional descriptions of key ingredients
12. ingredient_substitutions: 3-5 thoughtful substitutions with explanations
13. step_by_step_instructions: 6-10 detailed steps with sensory cues and emotional encouragement
14. pro_chef_tips: 3-5 advanced techniques with "why they work" explanations
15. common_mistakes: 3-4 common errors and how to avoid them
16. flavor_profile: Detailed sensory description (sweet, salty, sour, bitter, umami, aroma, mouthfeel)
17. side_dish_pairings: 3 complementary dishes with pairing rationale
18. wine_beverage_pairings: 2-3 specific pairing recommendations
19. storage_guidance: Detailed storage instructions for different timeframes
20. reheating_instructions: Multiple methods with quality preservation tips
21. variations: 3 creative variations (vegan, keto, gluten-free, regional, seasonal)
22. health_notes: Nutritional benefits and dietary considerations
23. seasonal_adaptations: How to adjust for different seasons
24. emotional_closing: Personal message to ${userName} about the joy of cooking and sharing
25. chef_secret: One special "chef's secret" that makes this recipe extraordinary

QUALITY STANDARDS:
- Write 1200-1800 words total
- Be SPECIFIC with measurements, temperatures, and timing
- Include sensory language that evokes taste, smell, texture
- Balance technical precision with emotional warmth
- Make ${userName} feel like this recipe was created JUST for them

SPECIAL NOTE FOR ${userName}:
I know you love ${cuisinePreference} cuisine and prefer ${dietaryPreference} options. I've crafted this recipe with your tastes in mind, balancing familiar comforts with delightful surprises.

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

Make it DEEP, EMOTIONAL, TECHNICALLY PRECISE, and PERSONAL. Create a recipe that ${userName} will remember forever.`;

  const models = [
    'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'deepseek/deepseek-chat-v3.1:free',
    'deepseek/deepseek-r1-0528:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'qwen/qwen-2.5-32b-instruct:free',
    'microsoft/phi-3.5-mini-instruct:free'
  ];

  // No timeout - let models take as long as needed for quality
  for (const model of models) {
    try {
      console.log(`Trying recipe model: ${model} for ${userName}`);
      const recipe = await tryRecipeModel(model, recipePrompt);
      if (recipe && isValidRecipe(recipe)) {
        console.log(`Success with model: ${model}`);
        
        // Enhance with additional metadata
        recipe.powered_by = 'Celestique AI by Sooban Talha Technologies';
        recipe.generated_for = userName;
        recipe.generated_at = new Date().toISOString();
        recipe.recipe_id = `celestique_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        recipe.emotional_score = calculateEmotionalScore(recipe);
        recipe.culinary_complexity = calculateCulinaryComplexity(recipe);
        
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
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://celestiqueai.vercel.app',
      'X-Title': 'Celestique AI'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'You are Celestique AI, the world\'s most advanced recipe generator. You create deeply emotional, personalized recipes that tell stories and create lasting memories. You balance technical culinary precision with warm, personal connection.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 6000, // Large for comprehensive recipes
      temperature: 0.8, // Creative but consistent
      top_p: 0.95,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Model ${model} failed with status: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const recipeData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!recipeData.recipe_title || !recipeData.ingredients_list || !recipeData.step_by_step_instructions) {
        throw new Error('Missing required recipe fields');
      }
      
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
    'step_by_step_instructions',
    'preparation_time',
    'cooking_time'
  ];
  
  return requiredFields.every(field => 
    recipe[field] && 
    (Array.isArray(recipe[field]) ? recipe[field].length > 0 : String(recipe[field]).trim().length > 0)
  );
}

// Calculate emotional score based on recipe content
function calculateEmotionalScore(recipe) {
  let score = 70; // Base score
  
  // Check for emotional language
  const emotionalWords = ['love', 'memory', 'heart', 'soul', 'joy', 'comfort', 'warm', 'special', 'personal', 'treasure'];
  const text = JSON.stringify(recipe).toLowerCase();
  
  emotionalWords.forEach(word => {
    if (text.includes(word)) score += 2;
  });
  
  // Bonus for personalization
  if (recipe.emotional_introduction && recipe.emotional_introduction.length > 200) score += 10;
  if (recipe.emotional_closing) score += 5;
  
  return Math.min(score, 100);
}

// Calculate culinary complexity
function calculateCulinaryComplexity(recipe) {
  let complexity = 50; // Base complexity
  
  if (recipe.ingredients_list && recipe.ingredients_list.length > 10) complexity += 10;
  if (recipe.step_by_step_instructions && recipe.step_by_step_instructions.length > 8) complexity += 10;
  if (recipe.difficulty_level && recipe.difficulty_level.toLowerCase().includes('advanced')) complexity += 15;
  if (recipe.difficulty_level && recipe.difficulty_level.toLowerCase().includes('intermediate')) complexity += 10;
  
  // Check for advanced techniques
  const advancedTerms = ['sous vide', 'temper', 'emulsify', 'deglaze', 'brunoise', 'chiffonade', 'confit'];
  const text = JSON.stringify(recipe).toLowerCase();
  advancedTerms.forEach(term => {
    if (text.includes(term)) complexity += 5;
  });
  
  return Math.min(complexity, 100);
}

// Local advanced recipe generator (fallback when no API key)
function generateLocalAdvancedRecipe(params) {
  const { message, userName, dietaryPreference, cuisinePreference, mealType } = params;
  
  // Enhanced local recipe database
  const recipeTemplates = {
    'comfort': {
      title: `Hearty ${cuisinePreference} Comfort Bowl for ${userName}`,
      intro: `Dear ${userName}, on days when you need a warm hug from the inside out, this recipe is my gift to you. I remember how you love ${cuisinePreference} flavors, so I've woven them into every layer of this comforting creation.`,
      cuisine: `${cuisinePreference.charAt(0).toUpperCase() + cuisinePreference.slice(1)} Fusion`,
      cultural: `This dish draws inspiration from traditional ${cuisinePreference} comfort foods, reimagined for modern sensibilities while keeping the soul intact.`,
      prep: '25 minutes',
      cook: '40 minutes',
      difficulty: 'Beginner-Friendly',
      servings: '4 generous bowls',
      calories: 480,
      nutrition: {
        protein: '28g',
        carbohydrates: '52g',
        fat: '18g',
        fiber: '12g',
        sugar: '8g',
        sodium: '620mg',
        key_vitamins: 'Vitamins A, C, K, Iron, Potassium'
      },
      ingredients: [
        { amount: '1.5 lbs', name: 'Chicken thighs or tofu', emotional_note: 'The foundation - choose what feels right for your soul today' },
        { amount: '2 cups', name: 'Vegetable or chicken broth', emotional_note: 'Liquid warmth that carries flavor deep into every ingredient' },
        { amount: '1 large', name: 'Sweet potato', emotional_note: 'Nature\'s candy - adds natural sweetness and comforting texture' },
        { amount: '1 bunch', name: 'Kale or spinach', emotional_note: 'A vibrant green hug packed with nourishment' },
        { amount: '1', name: 'Red onion', emotional_note: 'Adds depth and a hint of sharpness to balance the sweetness' },
        { amount: '3 cloves', name: 'Garlic', emotional_note: 'The soul of the kitchen - minced with love' },
        { amount: '1 tbsp', name: 'Grated ginger', emotional_note: 'Warmth that travels from your tongue to your heart' },
        { amount: '2 tbsp', name: 'Coconut oil or olive oil', emotional_note: 'The gentle medium that coaxes out flavors' },
        { amount: '1 tsp', name: 'Smoked paprika', emotional_note: 'Whisper of campfire memories' },
        { amount: '½ tsp', name: 'Cinnamon', emotional_note: 'Unexpected warmth that makes this dish special' },
        { amount: 'Sea salt and pepper', name: 'to taste', emotional_note: 'The basic poetry of seasoning' }
      ],
      substitutions: [
        { original: 'Chicken', substitution: 'Extra-firm tofu or chickpeas', reason: 'Maintains protein while making it vegetarian' },
        { original: 'Sweet potato', substitution: 'Butternut squash', reason: 'Similar sweetness and texture profile' },
        { original: 'Coconut oil', substitution: 'Ghee or butter', reason: 'Adds rich, nutty flavor' }
      ],
      instructions: [
        { 
          step: 1, 
          instruction: 'Cube the protein and vegetables into bite-sized pieces.', 
          sensory_cue: 'Listen to the crisp sound of the knife through fresh vegetables', 
          chef_note: 'Uniform pieces ensure even cooking'
        },
        { 
          step: 2, 
          instruction: 'Heat oil in a large pot over medium heat. Add onions and cook until translucent.', 
          sensory_cue: 'Watch the onions turn from opaque to glassy, smelling sweet and savory', 
          chef_note: 'This builds the flavor foundation'
        },
        { 
          step: 3, 
          instruction: 'Add garlic and ginger, stirring until fragrant (about 1 minute).', 
          sensory_cue: 'Inhale deeply - the aroma should make your mouth water', 
          chef_note: 'Don\'t let garlic brown or it becomes bitter'
        },
        { 
          step: 4, 
          instruction: 'Add protein and brown on all sides.', 
          sensory_cue: 'Listen for the sizzle and watch for golden edges', 
          chef_note: 'This creates flavor through Maillard reaction'
        },
        { 
          step: 5, 
          instruction: 'Add sweet potatoes and spices, stirring to coat everything.', 
          sensory_cue: 'Watch the paprika turn everything a warm, sunset orange', 
          chef_note: 'Toasting spices in oil releases their essential oils'
        },
        { 
          step: 6, 
          instruction: 'Pour in broth and bring to a gentle simmer.', 
          sensory_cue: 'Listen for the first bubbles breaking the surface', 
          chef_note: 'Gentle heat preserves tenderness'
        },
        { 
          step: 7, 
          instruction: 'Cover and simmer for 25 minutes, until sweet potatoes are tender.', 
          sensory_cue: 'The lid will dance slightly from the simmer below', 
          chef_note: 'Resist the urge to stir too much'
        },
        { 
          step: 8, 
          instruction: 'Add greens and cook just until wilted (2-3 minutes).', 
          sensory_cue: 'Watch the vibrant greens soften and darken slightly', 
          chef_note: 'Overcooked greens lose their nutritional value'
        },
        { 
          step: 9, 
          instruction: 'Season with salt and pepper. Let rest for 5 minutes before serving.', 
          sensory_cue: 'Taste and adjust - it should sing on your tongue', 
          chef_note: 'Resting allows flavors to marry'
        }
      ],
      pro_tips: [
        { tip: 'Brown the protein in batches', explanation: 'Prevents steaming and ensures proper caramelization' },
        { tip: 'Save some fresh herbs for garnish', explanation: 'Brightens the dish both visually and flavor-wise' },
        { tip: 'Make a double batch', explanation: 'This freezes beautifully for future comfort needs' }
      ],
      common_mistakes: [
        { mistake: 'Overcrowding the pot', solution: 'Cook in batches if needed', consequence: 'Ingredients steam instead of brown' },
        { mistake: 'Underseasoning', solution: 'Season in layers', consequence: 'Flat, one-dimensional flavor' },
        { mistake: 'Skipping the rest time', solution: 'Be patient', consequence: 'Flavors won\'t fully develop' }
      ],
      flavor_profile: {
        primary_tastes: 'Savory umami with sweet undertones and warm spice',
        aroma_notes: 'Toasted spices, caramelized vegetables, aromatic ginger',
        texture_profile: 'Tender protein, creamy sweet potatoes, slight bite from greens',
        aftertaste: 'Warm, lingering spice with subtle sweetness'
      },
      side_dish_pairings: [
        { dish: 'Crusty artisan bread', rationale: 'Perfect for soaking up every last drop of broth' },
        { dish: 'Simple green salad with lemon vinaigrette', rationale: 'Adds freshness and cuts through the richness' },
        { dish: 'Roasted cauliflower', rationale: 'Echoes the comforting, caramelized flavors' }
      ],
      wine_beverage_pairings: [
        { beverage: 'Pinot Noir', pairing_notes: 'Light enough not to overwhelm, fruity enough to complement the sweetness' },
        { beverage: 'Ginger tea', pairing_notes: 'Echoes the ginger in the dish, aids digestion' }
      ],
      storage_guidance: {
        refrigerator: 'Store in airtight container for up to 4 days',
        freezer: 'Freeze in portion-sized containers for up to 3 months',
        room_temperature: 'Not recommended',
        best_consumed_within: '3 days for optimal flavor'
      },
      reheating_instructions: {
        oven_method: 'Reheat at 350°F in covered oven-safe dish for 15-20 minutes',
        stovetop_method: 'Gently reheat in saucepan over low heat, stirring occasionally',
        microwave_method: 'Heat in microwave-safe bowl, covered, stirring every minute'
      },
      variations: [
        { variation_name: 'Coconut Cream Dream', modifications: 'Add 1 cup coconut milk with broth', flavor_impact: 'Creamier, tropical notes' },
        { variation_name: 'Spicy Adventure', modifications: 'Add 1 chopped chili or 1 tsp chili flakes', flavor_impact: 'Warm heat that builds slowly' },
        { variation_name: 'Harvest Version', modifications: 'Use squash instead of sweet potato, apples instead of onions', flavor_impact: 'Autumnal, slightly sweeter' }
      ],
      health_notes: {
        nutritional_benefits: 'High in protein, fiber, vitamins A and C, anti-inflammatory from ginger and turmeric',
        dietary_considerations: 'Gluten-free, dairy-free option available, easily made vegan',
        wellness_tips: 'The ginger aids digestion, while the variety of colors ensures phytonutrient diversity'
      },
      seasonal_adaptations: {
        spring: 'Use asparagus and peas instead of sweet potatoes',
        summer: 'Add fresh corn and cherry tomatoes at the end',
        fall: 'Add roasted pumpkin and sage',
        winter: 'Increase spices and use root vegetables'
      },
      emotional_closing: `${userName}, cooking is how we turn ingredients into memories. As you make this dish, know that every stir is an act of self-care, every smell a memory in the making. Share it with someone you love, or savor it quietly - both are beautiful.`,
      chef_secret: 'Add a teaspoon of cocoa powder with the spices - it won\'t make it chocolatey, but adds incredible depth and richness that people can\'t quite place.'
    }
    // Additional recipe templates would be defined here
  };
  
  // Select template based on meal type and preferences
  const templateKey = mealType === 'breakfast' ? 'breakfast' : 
                     dietaryPreference.includes('vegan') ? 'vegan' : 
                     'comfort';
  
  const template = recipeTemplates[templateKey] || recipeTemplates.comfort;
  
  // Personalize template
  const recipe = JSON.parse(JSON.stringify(template)); // Deep clone
  
  // Further personalization
  recipe.recipe_title = recipe.title.replace('${cuisinePreference}', cuisinePreference);
  recipe.emotional_introduction = recipe.intro;
  recipe.cuisine_origin = recipe.cuisine;
  recipe.cultural_background = recipe.cultural;
  recipe.preparation_time = recipe.prep;
  recipe.cooking_time = recipe.cook;
  recipe.difficulty_level = recipe.difficulty;
  recipe.serving_size = recipe.servings;
  recipe.calories_estimate = `${recipe.calories} per serving`;
  recipe.nutrition_breakdown = recipe.nutrition;
  recipe.ingredients_list = recipe.ingredients;
  recipe.ingredient_substitutions = recipe.substitutions;
  recipe.step_by_step_instructions = recipe.instructions;
  recipe.pro_chef_tips = recipe.pro_tips;
  recipe.common_mistakes = recipe.common_mistakes;
  recipe.flavor_profile = recipe.flavor_profile;
  recipe.side_dish_pairings = recipe.side_dish_pairings;
  recipe.wine_beverage_pairings = recipe.wine_beverage_pairings;
  recipe.storage_guidance = recipe.storage_guidance;
  recipe.reheating_instructions = recipe.reheating_instructions;
  recipe.variations = recipe.variations;
  recipe.health_notes = recipe.health_notes;
  recipe.seasonal_adaptations = recipe.seasonal_adaptations;
  recipe.emotional_closing = recipe.emotional_closing;
  recipe.chef_secret = recipe.chef_secret;
  
  // Add metadata
  recipe.powered_by = 'Celestique AI by Sooban Talha Technologies';
  recipe.generated_for = userName;
  recipe.generated_at = new Date().toISOString();
  recipe.recipe_id = `celestique_local_${Date.now()}`;
  recipe.emotional_score = 85;
  recipe.culinary_complexity = 65;
  recipe.inspired_by = message;
  
  return recipe;
}

// Enhanced fallback recipe generator
function generateFallbackRecipe(message, userName) {
  return {
    recipe_title: `"Memory Lane" ${message.split(' ').slice(0, 3).join(' ')} Creation`,
    emotional_introduction: `Dear ${userName}, sometimes the best recipes aren't about perfect technique, but about the stories they tell and the people they nourish. This recipe, inspired by your request for "${message}", is my attempt to capture that essence for you.`,
    cuisine_origin: 'Global comfort fusion',
    cultural_background: 'Drawing from culinary traditions that prioritize nourishment, connection, and the simple joy of sharing a meal.',
    preparation_time: '20-30 minutes (depending on your pace)',
    cooking_time: '30-45 minutes',
    difficulty_level: 'Approachable for all skill levels',
    serving_size: '4-6 servings (or 2 with leftovers for tomorrow)',
    calories_estimate: '350-450 per serving',
    nutrition_breakdown: {
      protein: '20-25g',
      carbohydrates: '35-45g',
      fat: '12-18g',
      fiber: '6-10g',
      sugar: '5-8g',
      sodium: '400-600mg',
      key_vitamins: 'Vitamins A, C, B-complex, Iron, Potassium'
    },
    ingredients_list: [
      { amount: 'Protein of choice', name: '(chicken, tofu, beans, or fish)', emotional_note: 'The heart of your meal' },
      { amount: '2-3 cups', name: 'Seasonal vegetables', emotional_note: 'Nature\'s colorful gifts' },
      { amount: '1', name: 'Aromatics (onion, garlic, ginger)', emotional_note: 'The soul of flavor' },
      { amount: 'Herbs and spices', name: 'to taste', emotional_note: 'Your personal signature' },
      { amount: 'Cooking fat', name: '(oil, butter, ghee)', emotional_note: 'The medium of transformation' },
      { amount: 'Liquid', name: '(broth, wine, coconut milk)', emotional_note: 'The unifying element' },
      { amount: 'Salt and pepper', name: '', emotional_note: 'The basic poetry' },
      { amount: 'Something unexpected', name: '(honey, citrus zest, nuts)', emotional_note: 'The delightful surprise' }
    ],
    ingredient_substitutions: [
      { original: 'Any ingredient', substitution: 'What you have and love', reason: 'Cooking is adaptation' },
      { original: 'Fresh herbs', substitution: 'Dried herbs (use 1/3 amount)', reason: 'Still delicious' },
      { original: 'Animal protein', substitution: 'Plant protein', reason: 'Your choice matters' }
    ],
    step_by_step_instructions: [
      { step: 1, instruction: 'Prepare your ingredients with intention.', sensory_cue: 'Notice colors, textures, aromas', chef_note: 'This mindful start sets the tone' },
      { step: 2, instruction: 'Build flavors from the pan up.', sensory_cue: 'Listen to the sizzle, watch colors develop', chef_note: 'Patience here pays dividends' },
      { step: 3, instruction: 'Add your protein and let it develop color.', sensory_cue: 'Golden edges mean flavor', chef_note: 'Don\'t crowd the pan' },
      { step: 4, instruction: 'Incorporate vegetables based on cooking time.', sensory_cue: 'Softer vegetables first, crunchy ones later', chef_note: 'Respect each ingredient\'s nature' },
      { step: 5, instruction: 'Add liquids and bring to a gentle simmer.', sensory_cue: 'First bubbles signal transformation', chef_note: 'Gentle heat preserves texture' },
      { step: 6, instruction: 'Season thoughtfully throughout.', sensory_cue: 'Taste, adjust, repeat', chef_note: 'Seasoning is conversation, not monologue' },
      { step: 7, instruction: 'Let the dish rest before serving.', sensory_cue: 'Watch the steam rise gently', chef_note: 'Flavors marry during this rest' },
      { step: 8, instruction: 'Garnish with something fresh.', sensory_cue: 'A pop of color, a burst of aroma', chef_note: 'The final flourish' }
    ],
    pro_chef_tips: [
      { tip: 'Taste as you go', explanation: 'Your palate is your best guide' },
      { tip: 'Clean as you cook', explanation: 'A clear space makes for a clear mind' },
      { tip: 'Trust your instincts', explanation: 'Recipes are maps, not railroads' }
    ],
    common_mistakes: [
      { mistake: 'Rushing the process', solution: 'Set aside generous time', consequence: 'Missed flavor development' },
      { mistake: 'Following rigidly', solution: 'Adapt to your taste', consequence: 'Less personal connection' },
      { mistake: 'Serving immediately', solution: 'Allow 5-10 minutes rest', consequence: 'Uneven flavors' }
    ],
    flavor_profile: {
      primary_tastes: 'Balanced savory with subtle sweet and acidic notes',
      aroma_notes: 'Warm, inviting, slightly complex',
      texture_profile: 'Satisfying combination of tender and crisp',
      aftertaste: 'Clean, pleasant, makes you want another bite'
    },
    side_dish_pairings: [
      { dish: 'Simple grain (rice, quinoa, couscous)', rationale: 'Soaks up flavors, adds substance' },
      { dish: 'Bright salad or slaw', rationale: 'Adds freshness and crunch' },
      { dish: 'Crusty bread', rationale: 'For savoring every last bit' }
    ],
    wine_beverage_pairings: [
      { beverage: 'What you enjoy', pairing_notes: 'The best pairing is what brings you joy' },
      { beverage: 'Sparkling water with citrus', pairing_notes: 'Cleanses the palate, refreshes' }
    ],
    storage_guidance: {
      refrigerator: 'Store in airtight container, consume within 4 days',
      freezer: 'Freeze in portion sizes, label with date',
      room_temperature: 'Not recommended for food safety',
      best_consumed_within: '3 days for optimal quality'
    },
    reheating_instructions: {
      oven_method: 'Reheat covered at 325°F until warmed through',
      stovetop_method: 'Gentle heat with splash of liquid if needed',
      microwave_method: 'Cover, use medium power, stir halfway'
    },
    variations: [
      { variation_name: 'Quick Weeknight', modifications: 'Use pre-cut vegetables, simpler seasoning', flavor_impact: 'Faster, still delicious' },
      { variation_name: 'Special Occasion', modifications: 'Add special ingredients, more complex techniques', flavor_impact: 'More layers, more celebration' },
      { variation_name: 'Your Personal Twist', modifications: 'Add what speaks to you', flavor_impact: 'Uniquely yours' }
    ],
    health_notes: {
      nutritional_benefits: 'Whole foods, balanced macros, vegetable-forward',
      dietary_considerations: 'Adaptable to most dietary needs',
      wellness_tips: 'Eating mindfully enhances both enjoyment and digestion'
    },
    seasonal_adaptations: {
      spring: 'Lighter vegetables, fresh herbs',
      summer: 'More raw elements, bright acidity',
      fall: 'Root vegetables, warming spices',
      winter: 'Heartier portions, longer cooking'
    },
    emotional_closing: `${userName}, remember that the most important ingredient in any recipe is the love and attention you put into it. Whether you\'re cooking for one or for many, this act of creation matters. Thank you for inviting me into your kitchen journey.`,
    chef_secret: 'A pinch of gratitude makes everything taste better. Pause before eating to appreciate the journey from ingredients to meal.',
    powered_by: 'Celestique AI by Sooban Talha Technologies',
    generated_for: userName,
    generated_at: new Date().toISOString(),
    recipe_id: `celestique_fallback_${Date.now()}`,
    emotional_score: 90,
    culinary_complexity: 60,
    inspired_by: message,
    note: 'This recipe emphasizes adaptability and personal connection over rigid instructions. Make it yours.'
  };
}