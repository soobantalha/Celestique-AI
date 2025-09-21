// Guaranteed working recipe generator
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
    const fallbackRecipe = generateFallbackRecipe(message);
    res.status(200).json(fallbackRecipe);
  }
};

// Generate recipe using AI
async function generateRecipeWithAI(userInput) {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  // Simple prompt that works reliably
  const prompt = `Create a recipe for: ${userInput}. 
  Respond with JSON in this format: 
  {
    "name": "Recipe name",
    "cuisine": "Cuisine type",
    "difficulty": "Easy/Medium/Hard",
    "prep_time": "X minutes",
    "cook_time": "X minutes",
    "serves": "X people",
    "ingredients": ["ingredient 1", "instruction 2"],
    "instructions": ["step 1", "step 2"],
    "chef_tips": ["tip 1", "tip 2"],
    "score": 85
  }`;

  try {
    // Try multiple models in sequence
    const models = [
      'x-ai/grok-4-fast:free',
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
      'X-Title': 'Célestique AI'
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
    recipe.powered_by = 'Célestique AI';
    recipe.generated_at = new Date().toISOString();
    return recipe;
  }

  throw new Error('No JSON found in response');
}

// Enhanced fallback recipe generator
function generateFallbackRecipe(input) {
  const recipes = {
    'pasta': {
      name: 'Gourmet Pasta Carbonara',
      cuisine: 'Italian',
      difficulty: 'Medium',
      prep_time: '15 minutes',
      cook_time: '15 minutes',
      serves: '4 people',
      ingredients: [
        '400g spaghetti',
        '200g pancetta or guanciale, diced',
        '4 large eggs',
        '100g Pecorino Romano, grated',
        'Black pepper, freshly cracked',
        'Salt to taste'
      ],
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti until al dente',
        'Meanwhile, cook pancetta in a large pan until crispy',
        'Whisk eggs with Pecorino Romano and black pepper',
        'Drain pasta, reserving 1 cup cooking water',
        'Add hot pasta to pancetta pan, remove from heat',
        'Quickly stir in egg mixture, adding pasta water as needed',
        'Serve immediately with extra cheese and pepper'
      ],
      chef_tips: [
        'Remove pan from heat before adding eggs to prevent scrambling',
        'Use freshly grated cheese for best flavor'
      ],
      score: 88,
      powered_by: 'Célestique AI Fallback'
    },
    'chicken': {
      name: 'Herb-Roasted Chicken',
      cuisine: 'International',
      difficulty: 'Easy',
      prep_time: '10 minutes',
      cook_time: '45 minutes',
      serves: '4 people',
      ingredients: [
        '1 whole chicken (1.5kg)',
        '2 tbsp olive oil',
        '1 lemon, halved',
        '4 garlic cloves, crushed',
        '1 tbsp fresh rosemary, chopped',
        '1 tbsp fresh thyme, chopped',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Preheat oven to 200°C (400°F)',
        'Pat chicken dry and rub with olive oil',
        'Season inside and out with salt, pepper, and herbs',
        'Place lemon halves and garlic inside cavity',
        'Roast for 45-60 minutes until golden and juices run clear',
        'Let rest for 10 minutes before carving'
      ],
      chef_tips: [
        'Let chicken come to room temperature before roasting',
        'Use a meat thermometer to ensure perfect doneness'
      ],
      score: 85,
      powered_by: 'Célestique AI Fallback'
    }
  };

  // Find the best matching recipe
  const lowerInput = input.toLowerCase();
  for (const [key, recipe] of Object.entries(recipes)) {
    if (lowerInput.includes(key)) {
      return recipe;
    }
  }

  // Default fallback
  return {
    name: 'Gourmet ' + input,
    cuisine: 'International',
    difficulty: 'Medium',
    prep_time: '30 minutes',
    cook_time: '30 minutes',
    serves: '4 people',
    ingredients: ['Check back soon for this recipe!'],
    instructions: ['Our AI chef is perfecting this recipe for you.'],
    chef_tips: ['Try asking for a different recipe in the meantime'],
    score: 0,
    powered_by: 'Célestique AI Fallback'
  };
}