// Fallback recipe generator (no API key needed)
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
    
    // Generate recipe based on user message
    const recipe = generateRecipeFromMessage(message);
    
    res.status(200).json(recipe);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function generateRecipeFromMessage(message) {
  const cuisines = ["Italian", "French", "Spanish", "Asian", "Mediterranean", "Mexican"];
  const difficulties = ["Easy", "Moderate", "Intermediate", "Advanced"];
  const times = ["20 minutes", "30 minutes", "45 minutes", "1 hour", "1.5 hours"];
  
  const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const prepTime = times[Math.floor(Math.random() * times.length)];
  
  return {
    name: `Gourmet ${message.split(' ')[0]} Recipe`,
    cuisine: cuisine,
    difficulty: difficulty,
    prep_time: prepTime,
    ingredients: [
      "Fresh ingredients",
      "Herbs and spices",
      "Quality oils",
      "Seasonal vegetables",
      "Premium proteins"
    ],
    instructions: [
      "Prepare all ingredients",
      "Follow cooking techniques",
      "Season to taste",
      "Plate beautifully",
      "Serve immediately"
    ],
    tips: [
      "Use fresh ingredients for best flavor",
      "Don't overcrowd the pan",
      "Taste as you cook",
      "Let meat rest before slicing"
    ],
    score: Math.floor(Math.random() * 15) + 85
  };
}