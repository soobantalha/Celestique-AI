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
  const cuisines = ["Italian", "French", "Spanish", "Asian", "Mediterranean", "Mexican", "Indian", "Thai"];
  const difficulties = ["Easy", "Moderate", "Intermediate", "Advanced"];
  const times = ["20 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours"];
  
  const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const prepTime = times[Math.floor(Math.random() * times.length)];
  
  // Extract the main ingredient from the message
  const mainIngredient = extractMainIngredient(message);
  
  return {
    name: `${mainIngredient} ${cuisine} Specialty`,
    cuisine: cuisine,
    difficulty: difficulty,
    prep_time: prepTime,
    ingredients: generateIngredients(mainIngredient, cuisine),
    instructions: generateInstructions(mainIngredient, cuisine, difficulty),
    tips: generateTips(mainIngredient, cuisine),
    score: Math.floor(Math.random() * 15) + 85
  };
}

function extractMainIngredient(message) {
  const ingredients = [
    "Chicken", "Beef", "Fish", "Salmon", "Pasta", "Rice", "Vegetable", 
    "Mushroom", "Potato", "Lamb", "Pork", "Tofu", "Shrimp", "Crab",
    "Eggplant", "Spinach", "Tomato", "Cheese", "Chocolate", "Berry"
  ];
  
  // Look for ingredients in the message
  const lowerMessage = message.toLowerCase();
  for (const ingredient of ingredients) {
    if (lowerMessage.includes(ingredient.toLowerCase())) {
      return ingredient;
    }
  }
  
  // If no ingredient found, return a random one
  return ingredients[Math.floor(Math.random() * ingredients.length)];
}

function generateIngredients(mainIngredient, cuisine) {
  const baseIngredients = {
    Italian: ["Olive oil", "Garlic", "Basil", "Parmesan cheese", "Tomato sauce"],
    French: ["Butter", "Shallots", "Thyme", "White wine", "Cream"],
    Spanish: ["Paprika", "Saffron", "Olives", "Lemon", "Sherry vinegar"],
    Asian: ["Soy sauce", "Ginger", "Sesame oil", "Rice vinegar", "Chili paste"],
    Mediterranean: ["Olive oil", "Lemon juice", "Oregano", "Feta cheese", "Kalamata olives"],
    Mexican: ["Cumin", "Chili powder", "Cilantro", "Lime", "Black beans"],
    Indian: ["Turmeric", "Cumin seeds", "Coriander", "Garam masala", "Yogurt"],
    Thai: ["Fish sauce", "Lemongrass", "Coconut milk", "Thai basil", "Lime leaves"]
  };
  
  const proteinIngredients = {
    Chicken: ["Chicken breast", "Chicken thighs", "Ground chicken"],
    Beef: ["Beef sirloin", "Ground beef", "Beef stew meat"],
    Fish: ["White fish fillets", "Salmon", "Tuna steak"],
    Pork: ["Pork chops", "Pork tenderloin", "Ground pork"],
    Vegetarian: ["Tofu", "Tempeh", "Chickpeas", "Lentils"]
  };
  
  const cuisineBase = baseIngredients[cuisine] || baseIngredients.Italian;
  const protein = proteinIngredients[mainIngredient] || [mainIngredient];
  
  // Generate 5-8 ingredients
  const count = Math.floor(Math.random() * 4) + 5;
  const ingredients = [...protein, ...cuisineBase];
  
  return ingredients.slice(0, count);
}

function generateInstructions(mainIngredient, cuisine, difficulty) {
  const steps = {
    Italian: [
      "Prepare all ingredients by chopping and measuring.",
      "Heat oil in a large pan over medium heat.",
      "Sauté garlic until fragrant, about 1 minute.",
      `Add ${mainIngredient.toLowerCase()} and cook until golden.`,
      "Add tomatoes and herbs, simmer for 15 minutes.",
      "Season with salt and pepper to taste.",
      "Garnish with fresh basil and serve immediately."
    ],
    French: [
      "Mise en place: prepare all ingredients.",
      "Melt butter in a saucepan over medium heat.",
      "Sauté shallots until translucent.",
      `Add ${mainIngredient.toLowerCase()} and cook until browned.`,
      "Deglaze with white wine, reduce by half.",
      "Add cream and simmer until sauce thickens.",
      "Season with herbs and serve hot."
    ],
    Asian: [
      "Prepare all ingredients and sauces.",
      "Heat wok or large pan over high heat.",
      "Add oil and swirl to coat the pan.",
      `Stir-fry ${mainIngredient.toLowerCase()} until cooked through.`,
      "Add vegetables and sauce, toss to combine.",
      "Cook until sauce thickens and coats ingredients.",
      "Garnish with sesame seeds and serve with rice."
    ]
  };
  
  return steps[cuisine] || steps.Italian;
}

function generateTips(mainIngredient, cuisine) {
  const tips = {
    Italian: [
      "Use fresh herbs for the best flavor.",
      "Don't overcook the pasta - al dente is perfect.",
      "Reserve some pasta water to adjust sauce consistency."
    ],
    French: [
      "Use high-quality butter for the best results.",
      "Don't rush the cooking process - French cuisine takes time.",
      "Taste and adjust seasoning throughout the cooking process."
    ],
    Asian: [
      "Prepare all ingredients before starting to cook.",
      "Keep the wok hot for proper stir-frying.",
      "Balance sweet, salty, sour, and spicy flavors."
    ]
  };
  
  return tips[cuisine] || tips.Italian;
}