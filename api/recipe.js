
// Recipe generator API endpoint
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

    // Try to generate recipe with AI
    let recipe;
    try {
      recipe = await generateRecipeWithAI(message);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipe = generateFallbackRecipe(message);
    }

    res.status(200).json(recipe);

  } catch (error) {
    console.error('Unexpected error:', error);
    // Use fallback recipe
    const fallbackRecipe = generateFallbackRecipe(req.body?.message || 'recipe');
    res.status(200).json(fallbackRecipe);
  }
};

// Generate recipe using AI
async function generateRecipeWithAI(userInput) {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  // Enhanced prompt for better recipe generation
  const prompt = `Create a detailed gourmet recipe for: "${userInput}".
  
  Respond with JSON in this exact format:
  {
    "name": "Creative recipe name",
    "cuisine": "Type of cuisine (e.g., Italian, Asian, Mediterranean)",
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
    // Try multiple models in sequence
    const models = [
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-chat-v3.1:free',
      'deepseek/deepseek-r1-0528:free'
    ];

    for (const model of models) {
      try {
        const recipe = await tryModel(model, prompt);
        if (recipe) return recipe;
      } catch (error) {
        console.log(`Model ${model} failed, trying next`);
      }
    }

    throw new Error('All models failed');

  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Try a specific model
async function tryModel(model, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://celestiqueai.vercel.app',
      'X-Title': 'Célestique AI Recipe Generator'
    },
    body: JSON.stringify({
      model: model,
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
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const recipe = JSON.parse(jsonMatch[0]);
    recipe.powered_by = 'Célestique AI - Sooban Talha Productions';
    recipe.generated_at = new Date().toISOString();
    return recipe;
  }

  throw new Error('No JSON found in response');
}

// Enhanced fallback recipe generator with more options
function generateFallbackRecipe(input) {
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
        'Pinch of salt',
        'Butter for ramekins',
        'Cocoa powder for dusting'
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
      score: 92,
      powered_by: 'Célestique AI - Sooban Talha Productions'
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
        'Fresh parsley, chopped',
        'Nutmeg, freshly grated'
      ],
      instructions: [
        'Cook pasta in salted boiling water until al dente, reserve 1 cup pasta water',
        'Season chicken with salt and pepper, cook in olive oil until golden',
        'In same pan, melt butter and sauté garlic until fragrant',
        'Pour in cream, bring to simmer, then stir in Parmesan until melted',
        'Add cooked pasta and chicken to sauce, toss to combine',
        'Season with nutmeg, salt, and pepper. Garnish with parsley'
      ],
      chef_tips: [
        'Use freshly grated Parmesan for best melting',
        'Save pasta water to adjust sauce consistency',
        'Do not boil the cream sauce after adding cheese'
      ],
      score: 88,
      powered_by: 'Célestique AI - Sooban Talha Productions'
    },
    'stir fry': {
      name: 'Asian Vegetable Stir Fry',
      cuisine: 'Asian',
      difficulty: 'Easy',
      prep_time: '15 minutes',
      cook_time: '10 minutes',
      serves: '4 people',
      ingredients: [
        '2 cups mixed vegetables (bell peppers, broccoli, carrots, snow peas)',
        '1 onion, sliced',
        '3 cloves garlic, minced',
        '1 tbsp ginger, grated',
        '3 tbsp soy sauce',
        '1 tbsp oyster sauce',
        '1 tsp sesame oil',
        '2 tbsp vegetable oil',
        '1 tsp cornstarch',
        '2 tbsp water',
        'Sesame seeds for garnish'
      ],
      instructions: [
        'Cut vegetables into uniform pieces for even cooking',
        'Mix soy sauce, oyster sauce, and sesame oil in small bowl',
        'Heat wok with vegetable oil until smoking hot',
        'Stir-fry garlic and ginger for 30 seconds until fragrant',
        'Add vegetables and stir-fry for 4-5 minutes until crisp-tender',
        'Pour sauce over vegetables, toss to coat',
        'Mix cornstarch with water, add to wok to thicken sauce',
        'Garnish with sesame seeds and serve immediately'
      ],
      chef_tips: [
        'Keep wok very hot for proper stir-frying',
        'Cut vegetables uniformly for even cooking',
        'Have all ingredients prepped before starting'
      ],
      score: 85,
      powered_by: 'Célestique AI - Sooban Talha Productions'
    }
  };

  // Find the best matching recipe
  const lowerInput = input.toLowerCase();
  for (const [key, recipe] of Object.entries(recipes)) {
    if (lowerInput.includes(key)) {
      return recipe;
    }
  }

  // Default creative fallback
  return {
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
    score: 87,
    powered_by: 'Célestique AI - Sooban Talha Productions',
    generated_at: new Date().toISOString()
  };
}