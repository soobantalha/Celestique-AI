// Enhanced recipe generator with user preferences and multiple AI models
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
    const { message, model = 'deepseek', userPreferences = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try to generate recipe with AI
    let recipe;
    try {
      recipe = await generateRecipeWithAI(message, model, userPreferences);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipe = generateFallbackRecipe(message, userPreferences);
    }

    res.status(200).json(recipe);

  } catch (error) {
    console.error('Unexpected error:', error);
    const fallbackRecipe = generateFallbackRecipe(req.body?.message || 'recipe', req.body?.userPreferences || []);
    res.status(200).json(fallbackRecipe);
  }
};

// Enhanced AI recipe generation with user preferences
async function generateRecipeWithAI(userInput, model, userPreferences) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  // Build preference context
  const preferenceContext = userPreferences.length > 0 
    ? `User preferences: ${userPreferences.join(', ')}. Please consider these in the recipe.`
    : '';

  const prompt = `Create a detailed gourmet recipe for: "${userInput}".
  ${preferenceContext}
  
  Respond with JSON in this exact format:
  {
    "name": "Creative recipe name",
    "cuisine": "Type of cuisine",
    "difficulty": "Easy/Medium/Hard",
    "prep_time": "X minutes",
    "cook_time": "X minutes", 
    "serves": "X people",
    "ingredients": ["ingredient with quantities", "another ingredient"],
    "instructions": ["step 1", "step 2", "step 3"],
    "chef_tips": ["professional tip 1", "tip 2"],
    "score": 85
  }

  Make the recipe creative, detailed, and professional. Include exact measurements and clear instructions.`;

  try {
    const models = {
      deepseek: 'deepseek/deepseek-chat-v3.1:free',
      gemini: 'google/gemini-2.0-flash-exp:free',
      claude: 'anthropic/claude-3-haiku:free'
    };

    const selectedModel = models[model] || models.deepseek;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://celestiqueai.vercel.app',
        'X-Title': 'Célestique AI Recipe Generator'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Model ${model} failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recipe = JSON.parse(jsonMatch[0]);
      recipe.powered_by = 'Célestique AI - Sooban Talha Productions';
      recipe.generated_at = new Date().toISOString();
      recipe.model = model;
      return recipe;
    }

    throw new Error('No JSON found in response');

  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Enhanced fallback recipe generator with user preferences
function generateFallbackRecipe(input, userPreferences) {
  const recipes = {
    'chocolate': {
      name: 'Decadent Chocolate Lava Cake',
      cuisine: 'French',
      difficulty: 'Medium',
      prep_time: '20 minutes',
      cook_time: '12 minutes',
      serves: '4 people',
      ingredients: [
        '200g dark chocolate (70% cocoa)',
        '200g unsalted butter',
        '4 large eggs',
        '150g granulated sugar',
        '80g all-purpose flour',
        '1 tsp vanilla extract',
        'Pinch of salt'
      ],
      instructions: [
        'Preheat oven to 220°C (425°F). Butter 4 ramekins and dust with cocoa powder',
        'Melt chocolate and butter in double boiler, stirring until smooth',
        'In separate bowl, whisk eggs and sugar until pale and thick',
        'Fold melted chocolate into egg mixture, then sift in flour and salt',
        'Divide batter among ramekins and bake for 10-12 minutes until edges are set but center is soft',
        'Let rest for 1 minute, then invert onto plates and serve immediately with ice cream'
      ],
      chef_tips: [
        'Do not overbake - the center should be molten',
        'Serve immediately for best texture',
        'Use high-quality chocolate for superior flavor'
      ],
      score: 92
    },
    'pasta': {
      name: 'Creamy Chicken Alfredo Pasta',
      cuisine: 'Italian',
      difficulty: 'Easy',
      prep_time: '15 minutes',
      cook_time: '20 minutes',
      serves: '4 people',
      ingredients: [
        '400g fettuccine pasta',
        '2 chicken breasts, sliced',
        '2 cups heavy cream',
        '1 cup grated Parmesan cheese',
        '4 cloves garlic, minced',
        '2 tbsp butter',
        '1 tbsp olive oil',
        'Salt and black pepper to taste',
        'Fresh parsley, chopped'
      ],
      instructions: [
        'Cook pasta in salted boiling water until al dente, reserve 1 cup pasta water',
        'Season chicken with salt and pepper, cook in olive oil until golden',
        'In same pan, melt butter and sauté garlic until fragrant',
        'Pour in cream, bring to simmer, then stir in Parmesan until melted',
        'Add cooked pasta and chicken to sauce, toss to combine',
        'Season with salt, and pepper. Garnish with parsley'
      ],
      chef_tips: [
        'Use freshly grated Parmesan for best melting',
        'Save pasta water to adjust sauce consistency',
        'Do not boil the cream sauce after adding cheese'
      ],
      score: 88
    }
  };

  // Adjust recipe based on user preferences
  const adjustRecipeForPreferences = (recipe, preferences) => {
    if (preferences.includes('vegetarian') && recipe.name.toLowerCase().includes('chicken')) {
      recipe.name = recipe.name.replace('Chicken', 'Mushroom');
      recipe.ingredients = recipe.ingredients.filter(ing => !ing.toLowerCase().includes('chicken'));
      recipe.ingredients.push('400g mixed mushrooms, sliced');
      recipe.chef_tips.push('For richer flavor, use a mix of wild mushrooms');
    }
    
    if (preferences.includes('vegan')) {
      recipe.ingredients = recipe.ingredients.map(ing => 
        ing.replace('heavy cream', 'coconut cream')
           .replace('Parmesan cheese', 'nutritional yeast')
           .replace('butter', 'vegan butter')
           .replace('eggs', 'flax eggs (2 tbsp ground flax + 6 tbsp water)')
      );
    }
    
    return recipe;
  };

  // Find matching recipe
  const lowerInput = input.toLowerCase();
  let recipe = null;

  for (const [key, recipeData] of Object.entries(recipes)) {
    if (lowerInput.includes(key)) {
      recipe = { ...recipeData };
      break;
    }
  }

  // Create custom recipe if no match found
  if (!recipe) {
    recipe = {
      name: 'Gourmet ' + input.charAt(0).toUpperCase() + input.slice(1),
      cuisine: 'International',
      difficulty: 'Medium',
      prep_time: '25 minutes',
      cook_time: '30 minutes',
      serves: '4 people',
      ingredients: [
        'Fresh ingredients based on your request',
        'Herbs and spices for flavor',
        'Quality proteins and vegetables',
        'Specialty ingredients for authenticity'
      ],
      instructions: [
        'Prepare all ingredients according to standard culinary practices',
        'Follow traditional cooking methods for best results',
        'Adjust seasoning to taste before serving',
        'Garnish beautifully for presentation'
      ],
      chef_tips: [
        'Use the freshest ingredients available',
        'Taste and adjust seasoning throughout cooking',
        'Let the main ingredients shine without overpowering'
      ],
      score: 87
    };
  }

  // Apply user preferences
  recipe = adjustRecipeForPreferences(recipe, userPreferences);
  
  recipe.powered_by = 'Célestique AI - Sooban Talha Productions';
  recipe.generated_at = new Date().toISOString();
  recipe.model = 'fallback';

  return recipe;
}