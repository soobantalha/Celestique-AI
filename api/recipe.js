// Enhanced recipe generator with more specific responses
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    
    // Generate recipe based on user message with more specificity
    const recipe = generateRecipeFromMessage(message);
    
    res.status(200).json(recipe);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function generateRecipeFromMessage(message) {
  // Extract key information from the message
  const lowerMessage = message.toLowerCase();
  
  // Determine cuisine type based on keywords
  let cuisine = "International";
  if (lowerMessage.includes("italian") || lowerMessage.includes("pasta") || lowerMessage.includes("risotto")) {
    cuisine = "Italian";
  } else if (lowerMessage.includes("mexican") || lowerMessage.includes("taco") || lowerMessage.includes("burrito")) {
    cuisine = "Mexican";
  } else if (lowerMessage.includes("asian") || lowerMessage.includes("chinese") || lowerMessage.includes("stir fry")) {
    cuisine = "Asian";
  } else if (lowerMessage.includes("indian") || lowerMessage.includes("curry") || lowerMessage.includes("masala")) {
    cuisine = "Indian";
  } else if (lowerMessage.includes("french") || lowerMessage.includes("gourmet") || lowerMessage.includes("fine dining")) {
    cuisine = "French";
  }
  
  // Determine difficulty based on keywords
  let difficulty = "Moderate";
  if (lowerMessage.includes("easy") || lowerMessage.includes("simple") || lowerMessage.includes("quick")) {
    difficulty = "Easy";
  } else if (lowerMessage.includes("advanced") || lowerMessage.includes("complex") || lowerMessage.includes("challenging")) {
    difficulty = "Advanced";
  }
  
  // Determine prep time based on keywords
  let prepTime = "30 minutes";
  if (lowerMessage.includes("quick") || lowerMessage.includes("fast") || lowerMessage.includes("20")) {
    prepTime = "20 minutes";
  } else if (lowerMessage.includes("long") || lowerMessage.includes("slow") || lowerMessage.includes("hour")) {
    prepTime = "1 hour";
  }
  
  // Extract main ingredient
  let mainIngredient = "Chicken";
  const ingredients = [
    "Chicken", "Beef", "Fish", "Salmon", "Pasta", "Rice", "Vegetable", 
    "Mushroom", "Potato", "Lamb", "Pork", "Tofu", "Shrimp", "Crab",
    "Eggplant", "Spinach", "Tomato", "Cheese", "Chocolate", "Berry"
  ];
  
  for (const ingredient of ingredients) {
    if (lowerMessage.includes(ingredient.toLowerCase())) {
      mainIngredient = ingredient;
      break;
    }
  }
  
  // Generate specific recipe based on cuisine and ingredient
  return generateSpecificRecipe(mainIngredient, cuisine, difficulty, prepTime);
}

function generateSpecificRecipe(mainIngredient, cuisine, difficulty, prepTime) {
  // Recipe templates for different cuisines
  const recipeTemplates = {
    Italian: {
      name: `${mainIngredient} ${mainIngredient === "Pasta" ? "alla" : "al"} Forno`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}`,
        "2 tbsp olive oil",
        "3 cloves garlic, minced",
        "1 onion, finely chopped",
        "400g canned tomatoes",
        "1 tsp dried oregano",
        "Fresh basil leaves",
        "100g Parmesan cheese, grated",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Preheat oven to 200°C (400°F).",
        `Heat olive oil in a pan and sauté garlic and onion until fragrant.`,
        `Add ${mainIngredient.toLowerCase()} and cook until browned.`,
        "Add tomatoes, oregano, salt, and pepper. Simmer for 10 minutes.",
        "Transfer to a baking dish and top with Parmesan cheese.",
        "Bake for 20 minutes until golden and bubbly.",
        "Garnish with fresh basil before serving."
      ],
      tips: [
        "Use fresh herbs for the best flavor.",
        "Don't overcook the pasta - al dente is perfect.",
        "Reserve some pasta water to adjust sauce consistency."
      ]
    },
    Mexican: {
      name: `${mainIngredient} Tacos with Fresh Salsa`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, diced`,
        "2 tbsp taco seasoning",
        "8 small corn tortillas",
        "1 cup shredded lettuce",
        "1 tomato, diced",
        "1/2 red onion, finely chopped",
        "1/4 cup cilantro, chopped",
        "1 lime, juiced",
        "1 avocado, sliced",
        "Sour cream for serving"
      ],
      instructions: [
        `Season ${mainIngredient.toLowerCase()} with taco seasoning and cook until done.`,
        "Warm tortillas according to package instructions.",
        "Prepare salsa by combining tomato, onion, cilantro, and lime juice.",
        "Assemble tacos with meat, lettuce, salsa, and avocado.",
        "Serve with lime wedges and sour cream."
      ],
      tips: [
        "Warm tortillas briefly in a dry skillet for better flavor.",
        "Let the meat rest before slicing to retain juices.",
        "Add a pinch of sugar to balance the acidity of tomatoes."
      ]
    },
    Asian: {
      name: `${mainIngredient} Stir-Fry with Vegetables`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, thinly sliced`,
        "2 tbsp vegetable oil",
        "2 cloves garlic, minced",
        "1 inch ginger, grated",
        "1 bell pepper, sliced",
        "1 carrot, julienned",
        "100g broccoli florets",
        "3 tbsp soy sauce",
        "1 tbsp oyster sauce",
        "1 tsp sesame oil",
        "1 tsp cornstarch mixed with 2 tbsp water",
        "Sesame seeds for garnish"
      ],
      instructions: [
        "Heat oil in a wok or large pan over high heat.",
        `Add ${mainIngredient.toLowerCase()} and stir-fry until cooked through. Remove and set aside.`,
        "In the same pan, add garlic and ginger, stir for 30 seconds.",
        "Add vegetables and stir-fry for 2-3 minutes until crisp-tender.",
        "Return meat to the pan, add soy sauce and oyster sauce.",
        "Add cornstarch mixture and stir until sauce thickens.",
        "Drizzle with sesame oil and garnish with sesame seeds.",
        "Serve immediately with steamed rice."
      ],
      tips: [
        "Prepare all ingredients before starting to cook.",
        "Keep the wok hot for proper stir-frying.",
        "Balance sweet, salty, sour, and spicy flavors."
      ]
    },
    Indian: {
      name: `${mainIngredient} Curry with Fragrant Spices`,
      ingredients: [
        `500g ${mainIngredient.toLowerCase()}, cubed`,
        "2 tbsp ghee or vegetable oil",
        "1 large onion, finely chopped",
        "3 cloves garlic, minced",
        "1 inch ginger, grated",
        "2 tbsp curry powder",
        "1 tsp turmeric",
        "1 tsp cumin",
        "1 can (400ml) coconut milk",
        "2 tomatoes, chopped",
        "1 tsp garam masala",
        "Fresh cilantro for garnish",
        "Salt to taste"
      ],
      instructions: [
        "Heat ghee in a large pot over medium heat.",
        "Add onions and cook until golden brown, about 10 minutes.",
        "Add garlic and ginger, cook for 1 minute until fragrant.",
        "Add spices and cook for 30 seconds until fragrant.",
        `Add ${mainIngredient.toLowerCase()} and cook until sealed on all sides.`,
        "Add tomatoes and coconut milk, bring to a simmer.",
        "Cover and cook for 20-30 minutes until meat is tender.",
        "Stir in garam masala and adjust seasoning.",
        "Garnish with fresh cilantro and serve with rice or naan."
      ],
      tips: [
        "Toast spices briefly to enhance their flavor.",
        "Use full-fat coconut milk for a richer curry.",
        "Let the curry rest for 10 minutes before serving for flavors to meld."
      ]
    },
    French: {
      name: `${mainIngredient} with Wine Reduction Sauce`,
      ingredients: [
        `4 ${mainIngredient.toLowerCase()} portions`,
        "2 tbsp butter",
        "1 shallot, finely chopped",
        "1/2 cup dry white wine",
        "1/2 cup chicken or vegetable stock",
        "2 tbsp cream",
        "1 tbsp fresh thyme leaves",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Season the main ingredient with salt and pepper.",
        "Heat butter in a skillet over medium-high heat.",
        `Cook ${mainIngredient.toLowerCase()} until golden brown on both sides. Remove and keep warm.`,
        "In the same skillet, add shallot and cook until softened.",
        "Add wine and simmer until reduced by half.",
        "Add stock and reduce again by half.",
        "Stir in cream and thyme, simmer until sauce thickens slightly.",
        "Return the main ingredient to the pan to warm through.",
        "Serve with sauce spooned over the top."
      ],
      tips: [
        "Use high-quality butter for the best results.",
        "Don't rush the reduction process - French cuisine takes time.",
        "Taste and adjust seasoning throughout the cooking process."
      ]
    }
  };

  // Default template for other cuisines
  const defaultTemplate = {
    name: `Gourmet ${mainIngredient} Recipe`,
    ingredients: [
      `500g ${mainIngredient.toLowerCase()}`,
      "2 tbsp olive oil",
      "3 cloves garlic, minced",
      "1 onion, finely chopped",
      "1 tsp mixed herbs",
      "Salt and pepper to taste",
      "Fresh herbs for garnish"
    ],
    instructions: [
      "Prepare all ingredients by chopping and measuring.",
      "Heat oil in a pan over medium heat.",
      "Sauté garlic and onion until fragrant.",
      `Add ${mainIngredient.toLowerCase()} and cook until done.`,
      "Season with herbs, salt, and pepper.",
      "Garnish with fresh herbs and serve immediately."
    ],
    tips: [
      "Use fresh ingredients for best flavor.",
      "Don't overcrowd the pan.",
      "Taste as you cook and adjust seasoning."
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