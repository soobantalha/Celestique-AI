// ================================================================
// Celestique AI v2.0 — recipe.js
// Server-side API handler (Vercel/Node.js serverless function)
// Supports streaming via OpenRouter + robust local fallback
// By Sooban Talha Technologies
// ================================================================

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      userName = 'Valued Chef',
      stream = false,
      dietaryPreference = 'balanced',
      cuisinePreference = 'international',
      mealType = 'main',
      cookingTime = 'moderate'
    } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Recipe description required',
        message: 'Please provide a description of what you want to cook'
      });
    }

    console.log(`[Celestique AI v2.0] Generating for: ${userName} — "${message.substring(0, 60)}"`);

    const apiKey = process.env.OPENROUTER_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 10;

    if (!hasApiKey) {
      // Use local generation
      const recipe = generateLocalRecipe({ message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime });
      recipe.generated_at = new Date().toISOString();
      recipe.recipe_id = `cel_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      recipe.source = 'local';
      return res.status(200).json({ success: true, recipe, meta: { generated_for: userName, source: 'local' } });
    }

    // --- Streaming response ---
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const upstreamRes = await callOpenRouter({ message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime }, apiKey, true);

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        throw new Error(`OpenRouter error ${upstreamRes.status}: ${errText}`);
      }

      // Pipe stream
      const reader = upstreamRes.body;
      reader.on('data', chunk => res.write(chunk));
      reader.on('end', () => res.end());
      reader.on('error', err => {
        console.error('Stream error:', err);
        res.end();
      });
      return;
    }

    // --- Non-streaming response ---
    const upstreamRes = await callOpenRouter({ message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime }, apiKey, false);

    if (!upstreamRes.ok) {
      throw new Error(`OpenRouter API error: ${upstreamRes.status}`);
    }

    const data = await upstreamRes.json();
    let content = data?.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from AI');

    // Clean markdown fences
    content = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Try to parse as JSON, else return as markdown text
    let recipeData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
        recipeData.source = 'ai_json';
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Return as markdown text
      recipeData = {
        recipe_title: extractTitle(content) || 'Your Recipe',
        markdown_content: content,
        source: 'ai_markdown'
      };
    }

    recipeData.generated_at = new Date().toISOString();
    recipeData.recipe_id = `cel_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    return res.status(200).json({
      success: true,
      recipe: recipeData,
      meta: {
        generated_for: userName,
        source: recipeData.source,
        timestamp: recipeData.generated_at
      }
    });

  } catch (error) {
    console.error('[Celestique AI v2.0] Error:', error.message);

    // Ultimate fallback
    const fallback = generateLocalRecipe({
      message: req.body?.message || 'Delicious Meal',
      userName: req.body?.userName || 'Chef',
      dietaryPreference: 'balanced',
      cuisinePreference: 'international',
      mealType: 'main',
      cookingTime: 'moderate'
    });

    fallback.generated_at = new Date().toISOString();
    fallback.recipe_id = `cel_fallback_${Date.now()}`;
    fallback.source = 'fallback';

    return res.status(200).json({
      success: true,
      recipe: fallback,
      meta: {
        generated_for: req.body?.userName || 'Chef',
        source: 'fallback',
        note: 'AI service temporarily unavailable — local recipe generated'
      }
    });
  }
};

// ================================================================
// OpenRouter API Call
// ================================================================
async function callOpenRouter(params, apiKey, stream = false) {
  const { message, userName, dietaryPreference, cuisinePreference, mealType, cookingTime } = params;

  const systemPrompt = `You are Celestique AI v2.0 — the world's most advanced recipe intelligence and personal culinary companion. You speak with warmth, emotional depth, and chef-level expertise.

Always address the user as "${userName}". Your recipes are not just instructions — they are experiences, stories, and memories.

Write your response in beautiful, well-structured Markdown with:
- A creative, evocative recipe title (H1)
- A personal emotional introduction for ${userName}
- A quick-glance table (prep/cook time, servings, difficulty, calories)
- Organized ingredients list
- Detailed step-by-step instructions with sensory cues
- Pro chef tips section
- Common mistakes to avoid
- Pairing suggestions (wine/beverage + sides)
- Storage and reheating guidance
- Nutritional highlights
- A closing quote in blockquote format

Be warm, specific, and write as if you personally know ${userName} and care deeply about their success in the kitchen.`;

  const userMessage = `Create a full, detailed, emotionally rich recipe for: "${message}"
Dietary preference: ${dietaryPreference}
Cuisine preference: ${cuisinePreference}  
Meal type: ${mealType}
Time preference: ${cookingTime}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://celestique.ai',
        'X-Title': 'Celestique AI v2.0'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        stream,
        max_tokens: 2500,
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ================================================================
// Extract title from markdown
// ================================================================
function extractTitle(markdown) {
  const match = markdown.match(/^# (.+)$/m);
  return match ? match[1].replace(/[*_`]/g, '').trim() : null;
}

// ================================================================
// Local Recipe Generator (comprehensive fallback)
// ================================================================
function generateLocalRecipe(params) {
  const { message, userName, cuisinePreference, dietaryPreference, mealType, cookingTime } = params;

  const isVeg = /veg|vegetar|vegan|plant/i.test(message + dietaryPreference);
  const isQuick = /quick|fast|easy|30 min/i.test(message + cookingTime);
  const isDesert = /dessert|cake|chocolate|sweet|cookie|pastry/i.test(message);

  const prepTime = isQuick ? '10 minutes' : '20 minutes';
  const cookT = isQuick ? '20 minutes' : '45 minutes';
  const protein = isVeg ? 'chickpeas or firm tofu' : 'chicken breast or thighs';
  const calories = isDesert ? '380' : '450';

  const adjectives = ['Signature', 'Elevated', 'Artisanal', 'Gourmet', 'Comforting', 'Rustic'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

  const title = `${adj} ${cuisinePreference} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} — Crafted for ${userName}`;

  return {
    recipe_title: title,
    emotional_introduction: `${userName}, I created this recipe thinking specifically of you. Whether this meal is for a quiet evening alone, a shared table with people you love, or just a Tuesday that needed something special — this dish is here for that. Every ingredient was chosen with intention. Cook it slowly. Enjoy the process.`,
    cuisine_origin: `${cuisinePreference.charAt(0).toUpperCase() + cuisinePreference.slice(1)} with contemporary sensibility`,
    cultural_background: `A celebration of global flavors meeting personal taste — this dish honors traditional technique while embracing the creativity of the modern kitchen.`,
    preparation_time: prepTime,
    cooking_time: cookT,
    total_time: isQuick ? '30 minutes' : '65 minutes',
    difficulty_level: 'Intermediate — approachable with clear guidance',
    serving_size: '4 servings',
    calories_estimate: `${calories} per serving`,
    nutrition_breakdown: {
      protein: '28g',
      carbohydrates: '42g',
      fat: '18g',
      fiber: '7g',
      sugar: '6g',
      sodium: '560mg',
      key_vitamins: 'Vitamins A, C, B12 · Iron · Potassium'
    },
    ingredients_list: [
      { amount: '1.5 lbs', name: protein, note: 'The heart of the dish' },
      { amount: '3 tbsp', name: 'quality extra-virgin olive oil', note: 'For richness and depth' },
      { amount: '4 cloves', name: 'fresh garlic, minced', note: 'The soul of the kitchen' },
      { amount: '1 large', name: 'yellow onion, finely diced', note: 'Sweetness that builds complexity' },
      { amount: '2 cups', name: 'seasonal vegetables (your choice)', note: "Nature's colorful palette" },
      { amount: '1 cup', name: 'vegetable or chicken broth', note: 'Liquid gold that ties everything together' },
      { amount: '1 tsp', name: 'fine sea salt', note: 'Season with intention' },
      { amount: '½ tsp', name: 'freshly cracked black pepper', note: 'Warm, aromatic spice' },
      { amount: '1 tsp', name: 'smoked paprika', note: 'Depth and color' },
      { amount: '2 tbsp', name: 'fresh herbs (thyme, rosemary, or parsley)', note: 'The finishing touch' },
      { amount: '1', name: 'lemon, juice and zest', note: 'Brightness that lifts everything' }
    ],
    ingredient_substitutions: [
      { original: 'Chicken', substitution: 'Firm tofu or chickpeas', reason: 'Perfect vegan alternative' },
      { original: 'Olive oil', substitution: 'Avocado oil or unsalted butter', reason: 'Similar smoke points and flavor' },
      { original: 'Seasonal vegetables', substitution: 'Frozen vegetables (thawed)', reason: 'Convenient and equally nutritious' },
      { original: 'Fresh herbs', substitution: 'Dried herbs (½ the quantity)', reason: 'More concentrated flavor' }
    ],
    step_by_step_instructions: [
      { step: 1, instruction: 'Gather all ingredients and prep them completely before turning on the heat. This is called mise en place — everything in its place. It changes how cooking feels.', sensory_cue: 'Enjoy the colors and aromas before you begin', chef_note: 'Mise en place is the chef\'s greatest secret for calm, joyful cooking' },
      { step: 2, instruction: 'Heat olive oil in a heavy-bottomed pan over medium heat until it shimmers — about 90 seconds.', sensory_cue: 'Oil should shimmer and move fluidly, but never smoke', chef_note: 'Hot pan prevents sticking and ensures even cooking' },
      { step: 3, instruction: 'Add diced onion. Cook, stirring occasionally, for 5-7 minutes until translucent and golden at the edges.', sensory_cue: 'They should smell sweet and look slightly translucent', chef_note: 'Do not rush onions. Their sweetness is built, not rushed.' },
      { step: 4, instruction: 'Add garlic. Stir constantly for exactly 90 seconds until golden and fragrant.', sensory_cue: 'The moment it turns golden and fragrant, move to the next step', chef_note: 'Garlic burns in 30 seconds on high heat. Watch it closely.' },
      { step: 5, instruction: 'Add the protein. Do not move it for 3-4 minutes. Let it develop a deep, golden sear.', sensory_cue: 'Listen for the satisfying sizzle; the pan should not go quiet', chef_note: 'The Maillard reaction — browning — creates the majority of flavor' },
      { step: 6, instruction: 'Flip the protein, add vegetables around it. Season with salt, pepper, and smoked paprika. Stir the vegetables gently.', sensory_cue: 'Watch the vegetables brighten in color as they hit the heat', chef_note: 'Season in layers for depth, not just at the end' },
      { step: 7, instruction: 'Pour in the broth. Bring to a gentle simmer — bubbles should be slow and lazy, not a rolling boil.', sensory_cue: 'Steam should carry beautiful, complex aromas', chef_note: 'Simmering vs. boiling makes the difference between tender and tough' },
      { step: 8, instruction: 'Cover partially and cook 15-20 minutes until protein is cooked through and vegetables are tender.', sensory_cue: 'Pierce the protein — juices should run clear', chef_note: 'Patience here creates perfection. Do not rush the simmer.' },
      { step: 9, instruction: 'Remove from heat. Squeeze lemon juice over the top, add zest, and scatter fresh herbs. Taste and adjust seasoning.', sensory_cue: 'The brightness of lemon should wake up every flavor in the pan', chef_note: 'This final step transforms a good dish into a memorable one' },
      { step: 10, instruction: `Let rest 5 minutes before serving. Plate with care, ${userName} — this dish deserves it.`, sensory_cue: 'The resting allows all the flavors to redistribute and settle', chef_note: 'A beautiful presentation makes the first bite taste better. Science proves it.' }
    ],
    pro_chef_tips: [
      { tip: 'Always taste as you go', explanation: 'Your palate is the most accurate seasoning tool in the kitchen' },
      { tip: 'Let the protein rest', explanation: 'Even 5 minutes of resting redistributes juices and improves flavor dramatically' },
      { tip: 'Deglaze with liquid', explanation: 'The browned bits on the pan bottom are pure flavor — broth dissolves them back in' },
      { tip: 'Finish with acid', explanation: 'A squeeze of lemon or splash of vinegar at the end brightens every flavor in the dish' }
    ],
    common_mistakes: [
      { mistake: 'Overcrowding the pan', solution: 'Cook in batches if necessary', consequence: 'Ingredients steam instead of sear, losing all that beautiful browning' },
      { mistake: 'Adding garlic too early', solution: 'Always add garlic after onions have softened', consequence: 'Garlic burns in seconds and turns bitter, ruining the base flavor' },
      { mistake: 'Skipping the resting step', solution: 'Always rest cooked protein before cutting', consequence: 'Juices run out immediately and the dish becomes dry' },
      { mistake: 'Not tasting as you cook', solution: 'Taste at every major stage', consequence: 'You can\'t correct seasoning at the table — only while cooking' }
    ],
    flavor_profile: {
      primary_tastes: 'Savory-umami with warm, herbal undertones',
      aroma_notes: 'Garlic, fresh herbs, golden onion, and a hint of citrus',
      texture_profile: 'Tender protein with a slight crust; vegetables with gentle bite',
      aftertaste: 'Warm, lingering, with a bright lemon finish'
    },
    side_dish_pairings: [
      { dish: 'Crusty sourdough bread', rationale: 'Perfect for soaking up the pan sauce' },
      { dish: 'Simple arugula salad with lemon vinaigrette', rationale: 'Peppery freshness cuts through the richness' },
      { dish: 'Roasted garlic mashed potatoes', rationale: 'A comforting, complementary base' }
    ],
    wine_beverage_pairings: [
      { beverage: 'Côtes du Rhône (red)', pairing_notes: 'Earthy, medium-bodied — complements savory herbs perfectly' },
      { beverage: 'Crisp Sauvignon Blanc (white)', pairing_notes: 'The herbaceous notes mirror the dish beautifully' },
      { beverage: 'Sparkling water with cucumber and mint', pairing_notes: 'Cleanses and refreshes between bites' }
    ],
    storage_guidance: {
      refrigerator: 'Airtight container for up to 4 days',
      freezer: 'Up to 3 months — thaw overnight in refrigerator',
      room_temperature: 'Not recommended beyond 2 hours',
      best_within: '2 days for optimal flavor and texture'
    },
    reheating_instructions: {
      stovetop: 'Gently over medium-low heat with a splash of broth or water — best method',
      oven: '350°F (175°C) for 15 minutes, covered with foil',
      microwave: '1-minute intervals, stirring between — keep covered'
    },
    variations: [
      { name: 'Spicy Version', changes: 'Add 1 tsp red chili flakes with the garlic', impact: 'Adds warmth and complexity' },
      { name: 'Creamy Version', changes: 'Stir in ¼ cup heavy cream or coconut milk at the end', impact: 'Silkier, richer mouthfeel' },
      { name: 'Mediterranean Twist', changes: 'Add olives, capers, and sun-dried tomatoes with the vegetables', impact: 'Briny, bold, deeply complex' }
    ],
    seasonal_adaptations: {
      spring: 'Add fresh peas, asparagus, and mint',
      summer: 'Use zucchini, cherry tomatoes, and basil',
      fall: 'Incorporate butternut squash, mushrooms, and sage',
      winter: 'Add root vegetables, hearty greens, and rosemary'
    },
    health_notes: {
      benefits: 'Balanced macros with lean protein, fiber, and essential vitamins. Naturally gluten-free.',
      modifications: 'Dairy-free, gluten-free, and vegan adaptations all possible with ingredient swaps above',
      wellness_tip: `${userName}, eat slowly and mindfully. Savor each bite. The pleasure of a good meal is itself nourishing.`
    },
    emotional_closing: `${userName}, remember: the most important ingredient is always the intention you bring to the kitchen. You created something real today. Something nourishing. Something worth savoring. Enjoy every bite.`,
    chef_signature: 'Crafted with love by Celestique AI v2.0',
    powered_by: 'Sooban Talha Technologies'
  };
}