// recipe.js - ULTRA ADVANCED VERSION (Study AI Pattern Based)
/**
 * CELESTIQUE AI RECIPE GENERATOR - ULTRA ADVANCED
 * @version 5.0.0
 * @author Sooban Talha Technologies
 */

import fetch from 'node-fetch';

// Study AI jaise multiple models
const RECIPE_MODELS = [
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat-v3.1:free', 
    'meta-llama/llama-3-70b-instruct:free',
    'microsoft/wizardlm-2-8x22b:free',
    'anthropic/claude-3.5-sonnet:free'
];

export default async function handler(req, res) {
    // Study AI jaise CORS handling
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
        const { message, preferences = {}, context = {} } = req.body;

        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Recipe request is required' 
            });
        }

        console.log('🔮 Generating ULTRA recipe for:', message);

        // Study AI jaise multiple models try karna
        let recipeData;
        try {
            recipeData = await generateUltraRecipe(message, preferences, context);
        } catch (aiError) {
            console.error('AI generation failed:', aiError);
            // Study AI jaise fallback
            recipeData = generateUltraFallbackRecipe(message, preferences);
        }

        res.status(200).json({
            success: true,
            data: recipeData
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        const fallbackRecipe = generateUltraFallbackRecipe(
            req.body?.message || 'Gourmet Recipe', 
            req.body?.preferences || {}
        );
        res.status(200).json({
            success: true,
            data: fallbackRecipe
        });
    }
}

// Study AI jaise multiple models try karna
async function generateUltraRecipe(userInput, preferences = {}, context = {}) {
    if (!process.env.OPENROUTER_API_KEY) {
        console.log('No API key, using fallback');
        throw new Error('API key not configured');
    }

    // Study AI jaise detailed prompt
    const ultraPrompt = `As CELESTIQUE ULTRA AI - World Class Executive Chef, create THE MOST DETAILED recipe for: "${userInput}"

USER PREFERENCES:
- Diet: ${preferences.diet || 'none'}
- Cuisine: ${preferences.cuisine || 'fusion'} 
- Difficulty: ${preferences.difficulty || 'medium'}
- Servings: ${preferences.servings || 4}

CRITICAL: Provide ULTRA-DETAILED response in EXACT JSON format:

{
  "recipe_metadata": {
    "recipe_id": "unique_id",
    "version": "5.0.0",
    "culinary_style": "Professional Gastronomy"
  },
  "basic_info": {
    "name": "Creative Recipe Name",
    "description": "Detailed description",
    "cuisine_type": "Cuisine",
    "difficulty_level": "Medium",
    "prep_time_minutes": 30,
    "cook_time_minutes": 45,
    "total_time_minutes": 75,
    "servings": 4,
    "calories_per_serving": 450
  },
  "ingredients_section": {
    "ingredient_groups": [
      {
        "group_name": "Main Components",
        "ingredients": [
          {
            "name": "Ingredient Name",
            "quantity": "500g",
            "unit": "grams", 
            "preparation": "Finely chopped",
            "quality_notes": "Use fresh",
            "substitutes": ["Sub1", "Sub2"]
          }
        ]
      }
    ]
  },
  "cooking_instructions": {
    "preparation_steps": [
      {
        "step_id": "prep_1",
        "description": "Detailed prep",
        "time_required": "10 mins",
        "tips": ["Tip1", "Tip2"]
      }
    ],
    "cooking_steps": [
      {
        "step_number": 1,
        "title": "Step Title",
        "description": "EXTREMELY DETAILED instruction",
        "time_required": "15 mins",
        "temperature": "Medium-High",
        "techniques": ["Sautéing", "Caramelization"],
        "visual_cues": ["Golden brown color", "Aromatic fragrance"],
        "pro_tips": ["Professional tip 1", "Professional tip 2"]
      }
    ]
  },
  "flavor_profile": {
    "primary_flavors": ["Savory", "Umami"],
    "flavor_intensity": 8,
    "complexity_rating": 9
  },
  "wine_pairings": {
    "white_wines": [
      {
        "type": "Sauvignon Blanc",
        "pairing_rationale": "Complements the flavors"
      }
    ]
  },
  "chef_expertise": {
    "advanced_techniques": ["Technique1", "Technique2"],
    "professional_tips": ["Tip1", "Tip2", "Tip3", "Tip4", "Tip5"]
  },
  "recipe_ratings": {
    "overall_score": 95,
    "taste_rating": 9,
    "presentation_rating": 9
  }
}

Make it EXTREMELY DETAILED, PROFESSIONAL, and CULINARILY PERFECT.`;

    // Study AI jaise multiple models try karna
    for (const model of RECIPE_MODELS) {
        try {
            console.log(`Trying model: ${model}`);
            const recipe = await tryRecipeModel(model, ultraPrompt);
            if (recipe) {
                console.log(`Success with model: ${model}`);
                
                return {
                    ...recipe,
                    powered_by: 'Celestique AI Ultra by Sooban Talha Technologies',
                    generated_at: new Date().toISOString(),
                    recipe_id: generateRecipeId(),
                    version: '5.0.0'
                };
            }
        } catch (error) {
            console.log(`Model ${model} failed:`, error.message);
        }
    }
    throw new Error('All models failed');
}

async function tryRecipeModel(model, prompt) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://celestiqueai.vercel.app',
            'X-Title': 'Celestique AI Ultra Recipes'
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 8000, // Study AI jaise more tokens
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
}

// Study AI jaise detailed fallback
function generateUltraFallbackRecipe(topic, preferences = {}) {
    return {
        recipe_metadata: {
            recipe_id: generateRecipeId(),
            version: "5.0.0",
            culinary_style: "Professional Gastronomy",
            chef_credential: "Executive Chef Certified",
            fallback_generated: true
        },
        basic_info: {
            name: `Exquisite ${topic} | Chef's Masterpiece`,
            description: `An extraordinary culinary creation featuring ${topic}, crafted with precision techniques and premium ingredients to deliver an unforgettable dining experience.`,
            story: `This recipe represents the pinnacle of modern gastronomy, blending traditional techniques with innovative approaches.`,
            cuisine_type: "Contemporary Fusion",
            difficulty_level: "Medium",
            prep_time_minutes: 25,
            cook_time_minutes: 35,
            total_time_minutes: 60,
            servings: 4,
            calories_per_serving: 480
        },
        ingredients_section: {
            ingredient_groups: [
                {
                    group_name: "Protein Foundation",
                    ingredients: [
                        {
                            name: "Premium Protein",
                            quantity: "600g",
                            unit: "grams",
                            preparation: "Portioned and tempered",
                            quality_notes: "Source sustainable, high-quality protein",
                            substitutes: ["Alternative protein options"],
                            purpose: "Main structural component"
                        }
                    ]
                },
                {
                    group_name: "Aromatics & Flavor Base",
                    ingredients: [
                        {
                            name: "Fresh Aromatics",
                            quantity: "200g", 
                            unit: "grams",
                            preparation: "Finely diced",
                            quality_notes: "Use fresh, not dried",
                            substitutes: ["Different aromatic vegetables"],
                            purpose: "Flavor foundation"
                        }
                    ]
                }
            ],
            total_ingredients_count: 18
        },
        cooking_instructions: {
            preparation_steps: [
                {
                    step_id: "prep_1",
                    description: `Mise en place: Prepare all ingredients for ${topic}. Wash, chop, measure, and organize components.`,
                    time_required: "15 mins",
                    tips: ["Work clean", "Follow sequence", "Measure accurately"],
                    visual_cues: ["Evenly chopped ingredients", "Organized workstation"]
                }
            ],
            cooking_steps: [
                {
                    step_number: 1,
                    title: "Flavor Foundation",
                    description: `Begin by building the flavor base for ${topic}. Heat oil in precision-controlled pan, add aromatics, and develop foundational flavors through careful caramelization.`,
                    time_required: "8 mins",
                    temperature: "Medium-High",
                    techniques: ["Sautéing", "Caramelization", "Flavor Development"],
                    visual_cues: ["Aromatics translucent", "Golden coloration", "Aromatic fragrance"],
                    pro_tips: ["Don't rush this step", "Layer flavors gradually", "Control heat precisely"]
                },
                {
                    step_number: 2,
                    title: "Main Component Integration",
                    description: "Introduce the primary protein or main ingredient, searing to develop complex Maillard reaction flavors and create perfect texture.",
                    time_required: "12 mins", 
                    temperature: "High",
                    techniques: ["Searing", "Maillard Reaction", "Temperature Control"],
                    visual_cues: ["Golden-brown crust", "Juices being sealed", "Aromatic development"],
                    pro_tips: ["Don't overcrowd the pan", "Maintain high heat", "Allow proper searing time"]
                }
            ]
        },
        flavor_profile: {
            primary_flavors: ["Umami", "Savory", "Complex"],
            flavor_intensity: 8,
            complexity_rating: 9,
            balance_rating: 9
        },
        wine_pairings: {
            white_wines: [
                {
                    type: "Sauvignon Blanc",
                    pairing_rationale: "Crisp acidity cuts through richness"
                }
            ],
            red_wines: [
                {
                    type: "Pinot Noir",
                    pairing_rationale: "Elegant tannins complement delicate flavors"
                }
            ]
        },
        chef_expertise: {
            advanced_techniques: ["Precision Temperature Control", "Layered Flavor Development"],
            professional_tips: [
                "Use a digital thermometer for perfect doneness",
                "Let protein rest before slicing for juicier results",
                "Season in layers throughout cooking process",
                "Use high-smoke-point oils for proper searing",
                "Balance flavors with acid at the end"
            ]
        },
        recipe_ratings: {
            overall_score: 92,
            taste_rating: 9,
            presentation_rating: 9,
            difficulty_rating: 7,
            repeatability_rating: 9
        },
        powered_by: "Celestique AI Ultra by Sooban Talha Technologies",
        generated_at: new Date().toISOString(),
        version: '5.0.0'
    };
}

function generateRecipeId() {
    return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}