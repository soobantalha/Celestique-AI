// For Vercel serverless function - Using OpenRouter API
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

    // Use OpenRouter API to get AI-generated recipe
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://celestiqueai.vercel.app',
        'X-Title': 'Célestique AI'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content: `You are Célestique AI, a world-class culinary assistant from Sooban Talha Productions. 
            Create exquisite, detailed recipes with the following structure in JSON format:
            {
              "name": "Recipe Name",
              "cuisine": "Cuisine Type",
              "difficulty": "Difficulty Level",
              "prep_time": "Preparation Time",
              "ingredients": ["ingredient 1", "ingredient 2", ...],
              "instructions": ["step 1", "step 2", ...],
              "tips": ["tip 1", "tip 2", ...],
              "score": 95
            }
            Make the recipe luxurious, detailed, and include professional chef tips.
            Always respond with valid JSON only.`
          },
          { role: "user", content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const responseText = data.choices[0].message.content;
    
    try {
      // Try to parse the recipe from the response
      let recipeData;
      if (responseText.includes('```json')) {
        const jsonStr = responseText.split('```json')[1].split('```')[0].trim();
        recipeData = JSON.parse(jsonStr);
      } else if (responseText.includes('```')) {
        const jsonStr = responseText.split('```')[1].split('```')[0].trim();
        recipeData = JSON.parse(jsonStr);
      } else {
        recipeData = JSON.parse(responseText);
      }
      
      res.status(200).json(recipeData);
    } catch (e) {
      // If parsing fails, use our enhanced fallback
      const recipe = generateRecipeFromMessage(message);
      res.status(200).json(recipe);
    }
  } catch (error) {
    console.error('API Error:', error);
    // Use enhanced fallback recipe generator
    const { message } = req.body;
    const recipe = generateRecipeFromMessage(message || "gourmet recipe");
    res.status(200).json(recipe);
  }
};

// Enhanced fallback recipe generator
function generateRecipeFromMessage(message) {
  const cuisines = ["Italian", "French", "Spanish", "Asian", "Mediterranean", "Mexican", "Indian", "Thai", "Chinese", "Japanese"];
  const difficulties = ["Easy", "Moderate", "Intermediate", "Advanced"];
  const times = ["20 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours"];
  
  // Extract information from message
  const lowerMessage = message.toLowerCase();
  
  // Determine cuisine
  let cuisine = "International";
  for (const c of cuisines) {
    if (lowerMessage.includes(c.toLowerCase())) {
      cuisine = c;
      break;
    }
  }
  
  // Determine difficulty
  let difficulty = "Moderate";
  if (lowerMessage.includes("easy") || lowerMessage.includes("simple") || lowerMessage.includes("quick")) {
    difficulty = "Easy";
  } else if (lowerMessage.includes("advanced") || lowerMessage.includes("complex") || lowerMessage.includes("challenging")) {
    difficulty = "Advanced";
  }
  
  // Determine prep time
  let prepTime = "45 minutes";
  if (lowerMessage.includes("quick") || lowerMessage.includes("fast") || lowerMessage.includes("20")) {
    prepTime = "20 minutes";
  } else if (lowerMessage.includes("long") || lowerMessage.includes("slow") || lowerMessage.includes("2 hour")) {
    prepTime = "2 hours";
  }
  
  // Extract main ingredient
  let mainIngredient = "Chicken";
  const ingredients = [
    "Chicken", "Beef", "Fish", "Salmon", "Pasta", "Rice", "Vegetable", 
    "Mushroom", "Potato", "Lamb", "Pork", "Tofu", "Shrimp", "Crab",
    "Eggplant", "Spinach", "Tomato", "Cheese", "Chocolate", "Berry",
    "Egg", "Duck", "Turkey", "Lobster", "Scallops", "Octopus", "Squid"
  ];
  
  for (const ingredient of ingredients) {
    if (lowerMessage.includes(ingredient.toLowerCase())) {
      mainIngredient = ingredient;
      break;
    }
  }
  
  // Generate specific recipe based on cuisine
  return generateSpecificRecipe(mainIngredient, cuisine, difficulty, prepTime);
}

function generateSpecificRecipe(mainIngredient, cuisine, difficulty, prepTime) {
  // Recipe templates for different cuisines
  const recipeTemplates = {
    Italian: {
      name: `${mainIngredient} ${mainIngredient === "Pasta" ? "alla" : "al"} Forno`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}`,
        "2 tbsp extra virgin olive oil",
        "3 cloves garlic, minced",
        "1 onion, finely chopped",
        "400g San Marzano tomatoes",
        "1 tsp dried oregano",
        "Fresh basil leaves",
        "100g Parmigiano-Reggiano cheese, grated",
        "Sea salt and freshly ground black pepper to taste",
        "1 tsp red pepper flakes (optional)"
      ],
      instructions: [
        "Preheat oven to 200°C (400°F).",
        `Heat olive oil in a pan and sauté garlic and onion until fragrant and translucent.`,
        `Add ${mainIngredient.toLowerCase()} and cook until golden brown.`,
        "Add tomatoes, oregano, salt, pepper, and red pepper flakes if using. Simmer for 15 minutes.",
        "Transfer to a baking dish and top generously with Parmigiano-Reggiano cheese.",
        "Bake for 20-25 minutes until golden and bubbly.",
        "Garnish with fresh basil leaves before serving.",
        "Let rest for 5 minutes before serving to allow flavors to meld."
      ],
      tips: [
        "Use high-quality extra virgin olive oil for authentic flavor.",
        "Don't overcook the pasta - al dente is traditional.",
        "Reserve a cup of pasta water to adjust sauce consistency.",
        "Freshly grate your cheese for better melting and flavor."
      ]
    },
    Asian: {
      name: `${mainIngredient} Stir-Fry with Asian Vegetables`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, thinly sliced`,
        "2 tbsp peanut oil",
        "4 cloves garlic, minced",
        "1 inch ginger, grated",
        "1 red bell pepper, sliced",
        "1 carrot, julienned",
        "100g broccoli florets",
        "100g snow peas",
        "3 tbsp soy sauce",
        "1 tbsp oyster sauce",
        "1 tbsp hoisin sauce",
        "1 tsp sesame oil",
        "1 tsp cornstarch mixed with 2 tbsp water",
        "2 green onions, sliced",
        "Sesame seeds for garnish"
      ],
      instructions: [
        "Prepare all ingredients and have them ready near the stove.",
        "Heat wok or large pan over high heat until smoking hot.",
        `Add ${mainIngredient.toLowerCase()} and stir-fry for 2-3 minutes until cooked through. Remove and set aside.`,
        "Add peanut oil to the wok, then add garlic and ginger. Stir for 30 seconds until fragrant.",
        "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
        "Return meat to the wok, add soy sauce, oyster sauce, and hoisin sauce.",
        "Add cornstarch mixture and stir constantly until sauce thickens and coats ingredients.",
        "Drizzle with sesame oil and toss to combine.",
        "Garnish with sliced green onions and sesame seeds.",
        "Serve immediately with steamed jasmine rice."
      ],
      tips: [
        "Prepare all ingredients before starting to cook (mise en place).",
        "Keep the wok very hot for proper stir-frying and to avoid steaming.",
        "Don't overcrowd the wok - cook in batches if necessary.",
        "Balance sweet, salty, sour, and spicy flavors to taste."
      ]
    },
    Indian: {
      name: `${mainIngredient} Curry with Fragrant Spices`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, cubed`,
        "2 tbsp ghee or vegetable oil",
        "1 large onion, finely chopped",
        "4 cloves garlic, minced",
        "1 inch ginger, grated",
        "2 tbsp curry powder",
        "1 tsp turmeric",
        "1 tsp cumin seeds",
        "1 tsp coriander powder",
        "1 can (400ml) coconut milk",
        "2 tomatoes, pureed",
        "1 tsp garam masala",
        "1 tsp Kashmiri red chili powder",
        "Fresh cilantro for garnish",
        "Salt to taste"
      ],
      instructions: [
        "Heat ghee in a large heavy-bottomed pot over medium heat.",
        "Add cumin seeds and cook until they splutter.",
        "Add onions and cook until golden brown, about 10 minutes.",
        "Add garlic and ginger, cook for 1 minute until fragrant.",
        "Add all dry spices and cook for 30 seconds until fragrant.",
        `Add ${mainIngredient.toLowerCase()} and cook until sealed on all sides.`,
        "Add tomato puree and cook until oil separates from the masala.",
        "Add coconut milk, bring to a simmer, then reduce heat to low.",
        "Cover and cook for 20-30 minutes until meat is tender and sauce has thickened.",
        "Stir in garam masala and adjust seasoning.",
        "Garnish with fresh cilantro and serve with basmati rice or naan."
      ],
      tips: [
        "Toast whole spices briefly in a dry pan to enhance their flavor.",
        "Use full-fat coconut milk for a richer, creamier curry.",
        "Let the curry rest for 10-15 minutes before serving for flavors to meld.",
        "Adjust chili powder according to your heat preference."
      ]
    },
    Mexican: {
      name: `${mainIngredient} Tacos with Fresh Salsa and Guacamole`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, diced or shredded`,
        "2 tbsp taco seasoning",
        "8 small corn tortillas",
        "1 cup shredded lettuce",
        "1 tomato, diced",
        "1/2 red onion, finely chopped",
        "1/4 cup cilantro, chopped",
        "1 lime, juiced",
        "1 avocado, mashed",
        "1 jalapeño, finely chopped (optional)",
        "Sour cream or Mexican crema",
        "Cotija cheese, crumbled"
      ],
      instructions: [
        `Season ${mainIngredient.toLowerCase()} with taco seasoning and cook until done.`,
        "Warm tortillas on a dry skillet or directly over gas flame for 30 seconds per side.",
        "Prepare salsa by combining tomato, onion, cilantro, lime juice, and jalapeño if using.",
        "Make guacamole by mashing avocado with lime juice and salt.",
        "Assemble tacos with meat, lettuce, salsa, guacamole, and crema.",
        "Top with crumbled cotija cheese.",
        "Serve immediately with lime wedges and extra hot sauce on the side."
      ],
      tips: [
        "Warm tortillas briefly for better flavor and pliability.",
        "Let the meat rest before slicing to retain juices.",
        "Add a pinch of sugar to balance the acidity of tomatoes in salsa.",
        "Toast your tortillas for extra flavor and to prevent tearing."
      ]
    }
  };

  // Default template for other cuisines
  const defaultTemplate = {
    name: `Gourmet ${mainIngredient} Recipe`,
    ingredients: [
      `500g ${mainIngredient.toLowerCase()}`,
      "2 tbsp high-quality olive oil",
      "3 cloves garlic, minced",
      "1 onion, finely chopped",
      "1 tsp mixed herbs (thyme, rosemary, oregano)",
      "Sea salt and freshly ground black pepper to taste",
      "1 lemon, zested and juiced",
      "Fresh herbs for garnish (parsley, chives, or basil)"
    ],
    instructions: [
      "Prepare all ingredients by chopping and measuring (mise en place).",
      "Heat oil in a pan over medium-high heat until shimmering.",
      "Sauté garlic and onion until fragrant and translucent, about 3 minutes.",
      `Add ${mainIngredient.toLowerCase()} and cook until golden brown and cooked through.`,
      "Season with herbs, salt, pepper, and lemon zest.",
      "Deglaze the pan with lemon juice, scraping up any browned bits.",
      "Adjust seasoning to taste.",
      "Garnish with fresh herbs and serve immediately.",
      "Let rest for 2-3 minutes before serving to allow flavors to meld."
    ],
    tips: [
      "Use the highest quality ingredients you can find for best results.",
      "Don't overcrowd the pan to ensure proper browning.",
      "Taste as you cook and adjust seasoning throughout the process.",
      "Let meat rest before slicing to retain juices and maximize flavor."
    ]
  };

  // Get the appropriate template or use default
  const template = recipeTemplates[cuisine] || defaultTemplate;
  
  // Calculate score based on specificity
  const score = cuisine !== "International" ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 10) + 75;
  
  return {
    name: template.name,
    cuisine: cuisine,
    difficulty: difficulty,
    prep_time: prepTime,
    ingredients: template.ingredients,
    instructions: template.instructions,
    tips: template.tips,
    score: score
  };
}