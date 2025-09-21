// Updated recipe generator using DeepSeek AI via OpenRouter
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
    // Use fallback if API call fails
    const fallbackRecipe = generateFallbackRecipe(message);
    res.status(200).json(fallbackRecipe);
  }
};

// Generate recipe using DeepSeek AI
async function generateRecipeWithDeepSeek(message) {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OpenRouter API key is not set');
    throw new Error('API key not configured');
  }

  // Construct the prompt for recipe generation
  const prompt = `As a professional chef, create a detailed gourmet recipe based on: "${message}".
  
  Respond with ONLY a JSON object in this exact structure:
  {
    "name": "Recipe name",
    "cuisine": "Cuisine type",
    "difficulty": "Difficulty level",
    "prep_time": "Preparation time",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...],
    "tips": ["tip 1", "tip 2", ...],
    "score": 85
  }
  
  Make it professional with precise measurements and techniques.`;

  try {
    // Call OpenRouter API with DeepSeek model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://celestiqueai.vercel.app',
        'X-Title': 'Célestique AI Recipe Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));
    
    const recipeText = data.choices[0].message.content;
    console.log('Recipe text:', recipeText);
    
    // Try to extract JSON from the response
    const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    }
    
    // If JSON extraction fails, use fallback
    throw new Error('Failed to extract JSON from AI response');
    
  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Use fallback if API call fails
    return generateFallbackRecipe(message);
  }
}

// Fallback recipe generator
function generateFallbackRecipe(message) {
  const fallbackRecipes = [
    {
      "name": "Truffle Infused Wild Mushroom Risotto",
      "cuisine": "Italian",
      "difficulty": "Intermediate",
      "prep_time": "45 minutes",
      "ingredients": [
        "1 cup Arborio rice", "4 cups vegetable broth", "1 cup mixed wild mushrooms",
        "2 tbsp black truffle oil", "1 shallot, finely chopped", "1/2 cup dry white wine",
        "1/4 cup grated Parmesan cheese", "2 tbsp butter", "1 tbsp fresh thyme leaves",
        "Salt and white pepper to taste", "Fresh truffle shavings for garnish"
      ],
      "instructions": [
        "Heat the truffle oil in a large pan over medium heat. Add shallots and sauté until translucent.",
        "Add wild mushrooms and cook until they release their moisture and become golden.",
        "Stir in Arborio rice, coating it with the oil and toasting for 2 minutes.",
        "Pour in white wine and cook until mostly absorbed, stirring constantly.",
        "Add warm broth one ladle at a time, allowing each addition to be absorbed before adding the next.",
        "Continue this process until rice is creamy yet al dente (about 18-20 minutes).",
        "Remove from heat and stir in butter, Parmesan, and thyme. Season to taste.",
        "Serve immediately garnished with fresh truffle shavings and a drizzle of truffle oil."
      ],
      "tips": [
        "Use a wide, shallow pan for even cooking of the risotto.",
        "Keep broth at a steady simmer to maintain cooking temperature.",
        "Stir constantly to develop the creamy starch texture.",
        "For extra richness, finish with a tablespoon of mascarpone."
      ],
      "score": 92
    },
    {
      "name": "Saffron and Seafood Paella",
      "cuisine": "Spanish",
      "difficulty": "Advanced",
      "prep_time": "1 hour",
      "ingredients": [
        "1 1/2 cups Bomba or Calasparra rice", "4 cups fish stock, warmed", "1/2 lb mixed seafood (shrimp, mussels, clams, calamari)",
        "1 pinch saffron threads", "1 onion, finely diced", "1 red bell pepper, sliced",
        "3 cloves garlic, minced", "1 tomato, grated", "1/2 cup frozen peas",
        "3 tbsp olive oil", "1 tsp smoked paprika", "Lemon wedges for serving"
      ],
      "instructions": [
        "Steep saffron threads in 1/4 cup warm fish stock for 10 minutes.",
        "Heat olive oil in a large paella pan over medium-high heat.",
        "Sear seafood until just cooked, then remove and set aside.",
        "Sauté onion, bell pepper, and garlic until softened.",
        "Add grated tomato and smoked paprika, cook until thickened.",
        "Add rice and stir to coat, toasting for 2 minutes.",
        "Pour in saffron-infused stock and remaining fish stock. Bring to a simmer.",
        "Arrange seafood and peas over the rice. Do not stir from this point.",
        "Cook for 15-20 minutes until liquid is absorbed and rice is cooked.",
        "Increase heat for the last 2 minutes to create socarrat (crispy bottom).",
        "Rest for 5 minutes before serving with lemon wedges."
      ],
      "tips": [
        "Use a traditional paella pan for even heat distribution.",
        "Do not stir after adding the seafood to create the characteristic texture.",
        "For authentic flavor, use real saffron - it's worth the investment.",
        "Let the paella rest before serving to allow flavors to meld."
      ],
      "score": 94
    },
    {
      "name": "Herb-Crusted Rack of Lamb with Red Wine Reduction",
      "cuisine": "French",
      "difficulty": "Advanced",
      "prep_time": "1 hour 30 minutes",
      "ingredients": [
        "1 rack of lamb (8 ribs)", "2 cloves garlic, minced", "2 tbsp fresh rosemary, chopped",
        "2 tbsp fresh thyme, chopped", "1/4 cup Dijon mustard", "1 cup breadcrumbs",
        "1/2 cup parsley, chopped", "1/2 cup red wine", "1 cup beef stock",
        "2 tbsp butter", "Salt and pepper to taste"
      ],
      "instructions": [
        "Preheat oven to 400°F (200°C).",
        "Season the rack of lamb with salt and pepper.",
        "Sear the lamb in a hot pan on all sides until browned.",
        "Mix garlic, rosemary, thyme, and Dijon mustard. Coat the lamb with this mixture.",
        "Combine breadcrumbs and parsley, then press onto the mustard-coated lamb.",
        "Roast in the oven for 20-25 minutes for medium-rare.",
        "While the lamb rests, prepare the reduction by deglazing the pan with red wine.",
        "Add beef stock and reduce by half. Finish with butter.",
        "Slice the lamb between the ribs and serve with the reduction sauce."
      ],
      "tips": [
        "Let the lamb come to room temperature before cooking for even doneness.",
        "Use a meat thermometer to ensure perfect cooking (125°F for medium-rare).",
        "Allow the lamb to rest for 10 minutes before slicing to retain juices.",
        "Strain the reduction sauce for a smoother texture."
      ],
      "score": 96
    }
  ];
  
  // Select a random fallback recipe
  return fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)];
}