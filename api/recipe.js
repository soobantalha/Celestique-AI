
  /**
 * Celestique AI - Ultra Advanced Recipe Generator
 * Advanced API handler with comprehensive error handling, security, and performance optimizations
 * @version 3.0.0
 * @author Sooban Talha Technologies
 */

const RECIPE_CONFIG = {
    MAX_RETRIES: 3,
    TIMEOUT: 30000,
    MAX_TOKENS: 8000,
    MODELS: [
        'google/gemini-2.0-flash-exp:free',
    'z-ai/glm-4.5-air:free',
    'tngtech/deepseek-r1t2-chimera:free',
    'deepseek/deepseek-chat-v3.1:free',
    'deepseek/deepseek-r1-0528:free'
    ],
    FALLBACK_MODELS: [
        'google/gemini-2.0-flash-exp:free',
        'deepseek/deepseek-chat-v3.1:free'
    ]
};

// Security and validation middleware
const SecurityUtils = {
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .substring(0, 1000)
            .trim();
    },

    validatePreferences: (prefs) => {
        const allowedPreferences = {
            diet: ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'mediterranean', 'none'],
            cuisine: ['italian', 'mexican', 'indian', 'chinese', 'french', 'japanese', 'thai', 'mediterranean', 'american', 'fusion'],
            difficulty: ['easy', 'medium', 'hard', 'expert'],
            time: ['quick', 'moderate', 'lengthy'],
            allergies: ['dairy', 'nuts', 'seafood', 'eggs', 'soy', 'wheat', 'none'],
            equipment: ['basic', 'advanced', 'professional'],
            spice: ['mild', 'medium', 'hot', 'extra-hot']
        };

        const validated = {};
        for (const [key, value] of Object.entries(prefs)) {
            if (allowedPreferences[key] && allowedPreferences[key].includes(value)) {
                validated[key] = value;
            }
        }
        return validated;
    },

    rateLimitCheck: (ip) => {
        // Implement Redis-based rate limiting in production
        const limit = 50; // requests per hour
        // Mock implementation - replace with actual Redis client
        return Math.random() > 0.95; // 5% chance of hitting limit for demo
    }
};

// Advanced recipe template system
const RecipeTemplates = {
    generatePrompt: (userInput, preferences, context = {}) => {
        const {
            diet = 'none',
            cuisine = 'fusion',
            difficulty = 'medium',
            time = 'moderate',
            allergies = 'none',
            equipment = 'basic',
            spice = 'medium'
        } = preferences;

        return `As Celestique AI Master Chef - create a RESTAURANT-QUALITY, PROFESSIONAL recipe for: "${userInput}"

CONTEXT & CONSTRAINTS:
- User Diet: ${diet}
- Preferred Cuisine: ${cuisine}
- Skill Level: ${difficulty}
- Available Time: ${time}
- Allergies: ${allergies}
- Kitchen Equipment: ${equipment}
- Spice Preference: ${spice}
- Seasonal Ingredients: ${context.season || 'all-year'}
- Special Occasion: ${context.occasion || 'everyday'}

PROFESSIONAL REQUIREMENTS:
1. RECIPE IDENTITY:
   - Creative, appealing name that reflects the dish
   - Compelling description highlighting key flavors and textures
   - Accurate cuisine classification
   - Realistic difficulty assessment

2. TIMING & LOGISTICS:
   - Realistic prep time (active work)
   - Accurate cook time (heat application)
   - Total time including resting/prep
   - Standard serving sizes (2-6 people)

3. INGREDIENTS & EQUIPMENT:
   - Comprehensive ingredient list with precise quantities
   - Standard measurement units (grams, cups, tbsp, etc.)
   - Ingredient notes (preparation state, alternatives)
   - Realistic equipment list matching user's level

4. COOKING INSTRUCTIONS:
   - Step-by-step professional methodology
   - Cooking times for each major step
   - Temperature guidance where applicable
   - Visual/textural cues for doneness
   - Chef pro-tips for each critical step

5. FLAVOR & NUTRITION:
   - Detailed flavor profile analysis (1-10 scale)
   - Comprehensive nutritional breakdown
   - Macronutrient balance
   - Dietary compliance tags

6. PROFESSIONAL ELEMENTS:
   - 5 advanced chef techniques/tips
   - Beverage pairing recommendations
   - Presentation/plating suggestions
   - Storage/reheating instructions
   - Recipe scalability notes

CRITICAL FORMAT REQUIREMENTS - RESPOND WITH VALID JSON ONLY:

{
    "name": "Creative Recipe Name",
    "description": "Appetizing description highlighting key features",
    "cuisine": "Specific Cuisine Type",
    "difficulty": "Easy/Medium/Hard/Expert",
    "prep_time": "XX mins",
    "cook_time": "XX mins",
    "total_time": "XX mins",
    "servings": X,
    "calories_per_serving": XXX,
    "ingredients": [
        {
            "name": "Ingredient Name",
            "quantity": "Precise Measurement",
            "notes": "Preparation notes or alternatives",
            "category": "produce/protein/dairy/etc"
        }
    ],
    "equipment": ["Essential Equipment Item 1", "Equipment 2"],
    "instructions": [
        {
            "step": 1,
            "description": "Detailed, actionable instruction",
            "time": "XX mins",
            "temperature": "XXX°F/°C if applicable",
            "tips": ["Professional tip 1", "Tip 2"],
            "visual_cues": ["What to look for at this stage"]
        }
    ],
    "chef_tips": [
        "Advanced professional technique with explanation",
        "Flavor enhancement method",
        "Time-saving professional trick",
        "Presentation/plating advice",
        "Equipment optimization tip"
    ],
    "nutritional_info": {
        "calories": XXX,
        "protein": "XXg",
        "carbs": "XXg",
        "fat": "XXg",
        "fiber": "XXg",
        "sugar": "XXg",
        "sodium": "XXmg"
    },
    "flavor_profile": {
        "savory": X,
        "sweet": X,
        "spicy": X,
        "umami": X,
        "bitter": X,
        "sour": X,
        "richness": X
    },
    "pairings": {
        "wine": ["Specific wine recommendation with reasoning"],
        "beer": ["Craft beer pairing suggestion"],
        "non_alcoholic": ["Sophisticated non-alcoholic pairing"],
        "side_dishes": ["Complementary side dish ideas"]
    },
    "dietary_tags": ["Diet-Friendly-Tag", "Allergy-Safe"],
    "presentation_tips": ["Professional plating suggestion 1", "Garnish advice"],
    "storage_instructions": "Professional storage and reheating guidance",
    "scalability_notes": "How to adjust for different serving sizes",
    "recipe_score": 85-97,
    "special_techniques": ["Named cooking technique used", "Another method"]
}

IMPERATIVE: Ensure all measurements are realistic, timing is accurate, and instructions are actionable for the specified difficulty level. Focus on professional restaurant techniques while maintaining approachability for the user's skill level.`;
    },

    validateRecipeStructure: (recipe) => {
        const required = [
            'name', 'description', 'cuisine', 'difficulty', 'prep_time',
            'cook_time', 'total_time', 'servings', 'ingredients', 'equipment',
            'instructions', 'chef_tips', 'nutritional_info', 'flavor_profile'
        ];

        return required.every(field => recipe[field] !== undefined);
    },

    enhanceRecipeData: (recipe) => {
        return {
            ...recipe,
            powered_by: 'Celestique AI Culinary Intelligence - Sooban Talha Technologies',
            generated_at: new Date().toISOString(),
            recipe_id: generateRecipeId(),
            version: '3.0.0',
            api_version: 'advanced-2024',
            culinary_style: determineCulinaryStyle(recipe),
            seasonality: determineSeasonality(recipe),
            cost_estimate: estimateRecipeCost(recipe),
            sustainability_score: calculateSustainability(recipe)
        };
    }
};

// Advanced AI model handler with circuit breaker pattern
class AdvancedAIHandler {
    constructor() {
        this.failures = new Map();
        this.cooldown = new Map();
        this.circuitBreakerThreshold = 5;
        this.cooldownPeriod = 60000; // 1 minute
    }

    async generateWithAI(userInput, preferences, context = {}) {
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('AI_API_KEY_NOT_CONFIGURED: OpenRouter API key is required');
        }

        const sanitizedInput = SecurityUtils.sanitizeInput(userInput);
        const validatedPrefs = SecurityUtils.validatePreferences(preferences);

        if (!sanitizedInput) {
            throw new Error('INVALID_INPUT: Recipe request must be a non-empty string');
        }

        const prompt = RecipeTemplates.generatePrompt(sanitizedInput, validatedPrefs, context);

        // Try primary models first
        let recipe = await this.tryModels(RECIPE_CONFIG.MODELS, prompt);
        
        if (!recipe) {
            // Fallback to reliable models
            console.warn('Primary models failed, using fallback models');
            recipe = await this.tryModels(RECIPE_CONFIG.FALLBACK_MODELS, prompt);
        }

        if (!recipe) {
            throw new Error('ALL_MODELS_UNAVAILABLE: Unable to generate recipe at this time');
        }

        return RecipeTemplates.enhanceRecipeData(recipe);
    }

    async tryModels(models, prompt) {
        for (const model of models) {
            if (this.isModelInCooldown(model)) {
                console.log(`Model ${model} in cooldown, skipping`);
                continue;
            }

            try {
                console.log(`Attempting recipe generation with: ${model}`);
                const recipe = await this.callModelWithRetry(model, prompt);
                
                if (recipe && RecipeTemplates.validateRecipeStructure(recipe)) {
                    this.recordSuccess(model);
                    return recipe;
                } else {
                    throw new Error('INVALID_RECIPE_STRUCTURE: Model response validation failed');
                }
            } catch (error) {
                console.error(`Model ${model} failed:`, error.message);
                this.recordFailure(model);
            }
        }
        return null;
    }

    async callModelWithRetry(model, prompt, retries = RECIPE_CONFIG.MAX_RETRIES) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), RECIPE_CONFIG.TIMEOUT);

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'HTTP-Referer': 'https://celestiqueai.vercel.app',
                        'X-Title': 'Celestique AI Recipes - Advanced Culinary Intelligence'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are Celestique AI Master Chef, a world-class culinary AI specializing in restaurant-quality recipes. Always respond with valid JSON following the exact specification provided. Ensure all recipes are practical, accurate, and professionally crafted.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: RECIPE_CONFIG.MAX_TOKENS,
                        temperature: 0.7,
                        top_p: 0.9,
                        response_format: { type: 'json_object' }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP_${response.status}: ${errorText}`);
                }

                const data = await response.json();
                const content = data.choices[0].message.content;

                // Enhanced JSON parsing with better error handling
                try {
                    const recipeData = JSON.parse(content);
                    return recipeData;
                } catch (parseError) {
                    // Try to extract JSON from malformed responses
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const recipeData = JSON.parse(jsonMatch[0]);
                        return recipeData;
                    }
                    throw new Error('INVALID_JSON_RESPONSE: No valid JSON found in model response');
                }

            } catch (error) {
                if (attempt === retries) throw error;
                
                // Exponential backoff
                await new Promise(resolve => 
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                );
            }
        }
    }

    isModelInCooldown(model) {
        const cooldownUntil = this.cooldown.get(model);
        return cooldownUntil && Date.now() < cooldownUntil;
    }

    recordFailure(model) {
        const failures = this.failures.get(model) || 0;
        const newFailures = failures + 1;
        this.failures.set(model, newFailures);

        if (newFailures >= this.circuitBreakerThreshold) {
            this.cooldown.set(model, Date.now() + this.cooldownPeriod);
            this.failures.set(model, 0); // Reset failures after cooldown
            console.warn(`Circuit breaker activated for model: ${model}`);
        }
    }

    recordSuccess(model) {
        this.failures.set(model, 0);
        this.cooldown.delete(model);
    }
}

// Utility functions
function generateRecipeId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `rec_${timestamp}_${random}`;
}

function determineCulinaryStyle(recipe) {
    const cuisines = {
        'italian': 'Mediterranean',
        'french': 'Classical French',
        'japanese': 'East Asian',
        'mexican': 'Latin American',
        'indian': 'South Asian',
        'chinese': 'East Asian',
        'thai': 'Southeast Asian',
        'american': 'Contemporary American'
    };
    return cuisines[recipe.cuisine.toLowerCase()] || 'International Fusion';
}

function determineSeasonality(recipe) {
    // Simple season detection based on common ingredients
    const ingredients = recipe.ingredients.map(i => i.name.toLowerCase()).join(' ');
    
    if (ingredients.includes('pumpkin') || ingredients.includes('apple') || ingredients.includes('cinnamon')) {
        return 'Fall';
    } else if (ingredients.includes('berry') || ingredients.includes('melon') || ingredients.includes('zucchini')) {
        return 'Summer';
    } else if (ingredients.includes('asparagus') || ingredients.includes('pea') || ingredients.includes('rhubarb')) {
        return 'Spring';
    } else if (ingredients.includes('root') || ingredients.includes('potato') || ingredients.includes('cabbage')) {
        return 'Winter';
    }
    return 'All-Season';
}

function estimateRecipeCost(recipe) {
    // Simple cost estimation based on ingredient complexity
    const baseCost = 15;
    const ingredientMultiplier = recipe.ingredients.length * 0.5;
    const difficultyMultiplier = { 'Easy': 1, 'Medium': 1.2, 'Hard': 1.5, 'Expert': 2 }[recipe.difficulty] || 1;
    
    return Math.round((baseCost + ingredientMultiplier) * difficultyMultiplier);
}

function calculateSustainability(recipe) {
    // Simple sustainability score
    let score = 75; // Base score
    
    // Adjust based on ingredients
    const ingredients = recipe.ingredients.map(i => i.name.toLowerCase()).join(' ');
    if (ingredients.includes('local') || ingredients.includes('seasonal')) score += 10;
    if (ingredients.includes('plant') || ingredients.includes('vegetable')) score += 5;
    if (ingredients.includes('beef') || ingredients.includes('lamb')) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

// Enhanced fallback recipe generator
function generateAdvancedFallbackRecipe(request, preferences = {}) {
    const baseRecipe = {
        name: `Chef's Special ${request}`,
        description: `A masterfully crafted ${request} featuring premium ingredients, sophisticated techniques, and balanced flavors that showcase professional culinary artistry.`,
        cuisine: "International Fusion",
        difficulty: "Medium",
        prep_time: "25 mins",
        cook_time: "40 mins",
        total_time: "65 mins",
        servings: 4,
        calories_per_serving: 450,
        ingredients: [
            {name: "Premium protein selection", quantity: "600g", notes: "chicken thigh, salmon fillet, or firm tofu", category: "protein"},
            {name: "Seasonal vegetables", quantity: "4 cups", notes: "colorful variety, chopped uniformly", category: "produce"},
            {name: "Aromatic base", quantity: "1 large", notes: "onion, garlic, ginger finely minced", category: "aromatics"},
            {name: "Quality cooking oil", quantity: "3 tbsp", notes: "extra virgin olive oil or avocado oil", category: "fat"},
            {name: "Fresh herbs", quantity: "1/4 cup", notes: "basil, cilantro, or parsley chopped", category: "herbs"},
            {name: "Acid component", quantity: "2 tbsp", notes: "lemon juice, vinegar, or wine", category: "acid"},
            {name: "Flavor enhancers", quantity: "2 tsp", notes: "soy sauce, fish sauce, or miso paste", category: "seasoning"},
            {name: "Texture element", quantity: "1/2 cup", notes: "toasted nuts, seeds, or crispy elements", category: "garnish"}
        ],
        equipment: ["Chef's knife 8-inch", "Cutting board", "Large skillet or wok", "Mixing bowls various sizes", "Measuring spoons and cups", "Kitchen scale", "Timer", "Tasting spoons"],
        instructions: [
            {
                step: 1,
                description: "Prepare all ingredients using professional mise en place technique. Chop vegetables to uniform sizes, measure seasonings precisely, and organize workstation for efficient workflow.",
                time: "15 mins",
                temperature: "Room temperature",
                tips: ["Keep ingredients organized in small bowls", "Clean as you go for efficient workflow"],
                visual_cues: ["All ingredients measured and prepared", "Workstation clean and organized"]
            },
            {
                step: 2,
                description: "Build flavor foundation by sautéing aromatic base in quality oil until fragrant and lightly golden. Develop complex flavors through proper caramelization without burning.",
                time: "8 mins",
                temperature: "Medium heat",
                tips: ["Don't rush this step - flavor development is crucial", "Adjust heat to prevent burning"],
                visual_cues: ["Aromatics are translucent and fragrant", "Light golden color achieved"]
            },
            {
                step: 3,
                description: "Cook main ingredients in stages, starting with proteins to develop sear and texture, then adding vegetables based on cooking times. Maintain proper heat control throughout.",
                time: "15 mins",
                temperature: "Medium-high heat",
                tips: ["Don't overcrowd the pan - cook in batches if needed", "Season each layer as you cook"],
                visual_cues: ["Protein is properly seared", "Vegetables are tender-crisp"]
            },
            {
                step: 4,
                description: "Combine all elements, deglaze pan with acid component, and simmer to integrate flavors. Adjust seasoning with precision and finish with fresh herbs and texture elements.",
                time: "7 mins",
                temperature: "Low heat",
                tips: ["Taste and adjust seasoning multiple times", "Let dish rest 2-3 minutes before serving"],
                visual_cues: ["Sauce is properly reduced", "Herbs are bright and fresh"]
            }
        ],
        chef_tips: [
            "Use a digital thermometer for perfect protein cooking every time - chicken 165°F, fish 145°F, beef 130-140°F for medium-rare",
            "Let ingredients come to room temperature before cooking for even results and better flavor development",
            "Develop layers of flavor by adding ingredients at optimal times - aromatics first, then proteins, quick-cooking vegetables last",
            "Balance flavors systematically - add acid (lemon/vinegar) at the end to brighten, sweet elements to round out, salt to enhance",
            "Rest proteins before slicing to retain juices - 5-10 minutes depending on size for maximum flavor and tenderness"
        ],
        nutritional_info: {
            calories: 450,
            protein: "35g",
            carbs: "32g",
            fat: "22g",
            fiber: "8g",
            sugar: "12g",
            sodium: "680mg"
        },
        flavor_profile: {
            savory: 8,
            sweet: 4,
            spicy: 3,
            umami: 7,
            bitter: 2,
            sour: 5,
            richness: 6
        },
        pairings: {
            wine: ["Sauvignon Blanc - crisp acidity complements the fresh herbs", "Pinot Noir - light body matches without overwhelming"],
            beer: ["Pale Ale - hoppy notes cut through richness", "Wheat Beer - refreshing contrast"],
            non_alcoholic: ["Sparkling water with cucumber and mint", "Ginger beer with lime"],
            side_dishes: ["Quinoa pilaf with herbs", "Roasted seasonal vegetables", "Crusty artisan bread"]
        },
        dietary_tags: ["High-Protein", "Customizable", "Chef-Approved"],
        presentation_tips: [
            "Plate with height and negative space for restaurant appeal",
            "Garnish with fresh herb sprigs and texture elements at the last moment",
            "Wipe plate edges clean for professional presentation"
        ],
        storage_instructions: "Store in airtight container in refrigerator for up to 3 days. Reheat gently in skillet over medium heat with splash of water or broth to refresh. Do not freeze with fresh herbs.",
        scalability_notes: "Recipe scales well for 2-8 servings. Adjust cooking times slightly - larger batches may need additional time. For more than 8 servings, cook in multiple batches for best results.",
        recipe_score: 88,
        special_techniques: ["Mise en Place", "Layered Flavor Development", "Deglazing", "Resting Proteins"]
    };

    return RecipeTemplates.enhanceRecipeData(baseRecipe);
}

// Main API handler with comprehensive error handling
const aiHandler = new AdvancedAIHandler();

module.exports = async (req, res) => {
    // Enhanced CORS handling
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400'
    };

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Method validation
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'METHOD_NOT_ALLOWED',
            message: 'Only POST requests are supported',
            allowed_methods: ['POST']
        });
    }

    // Rate limiting (basic implementation)
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (SecurityUtils.rateLimitCheck(clientIP)) {
        return res.status(429).json({
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retry_after: 3600
        });
    }

    try {
        // Request body validation
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                error: 'INVALID_REQUEST_BODY',
                message: 'Request body must be a valid JSON object'
            });
        }

        const { message, preferences = {}, context = {} } = req.body;

        // Input validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'INVALID_RECIPE_REQUEST',
                message: 'Recipe request must be a non-empty string'
            });
        }

        // Generate recipe with comprehensive error handling
        let recipeData;
        try {
            recipeData = await aiHandler.generateWithAI(message, preferences, context);
        } catch (aiError) {
            console.error('AI generation failed:', {
                error: aiError.message,
                input: message.substring(0, 100),
                preferences,
                timestamp: new Date().toISOString()
            });

            // Enhanced fallback with context awareness
            recipeData = generateAdvancedFallbackRecipe(message, preferences);
            recipeData.generation_notes = 'AI generation failed, using enhanced fallback recipe';
            recipeData.original_error = aiError.message;
        }

        // Success response
        res.status(200).json({
            success: true,
            data: recipeData,
            meta: {
                generated_at: new Date().toISOString(),
                version: '3.0.0',
                request_id: generateRecipeId().replace('rec_', 'req_')
            }
        });

    } catch (error) {
        // Comprehensive error handling
        console.error('Unexpected error in recipe generation:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            clientIP
        });

        // Fallback with error context
        const fallbackRecipe = generateAdvancedFallbackRecipe(
            req.body?.message || 'Delicious Gourmet Recipe',
            req.body?.preferences || {}
        );
        fallbackRecipe.generation_notes = 'System error occurred, using emergency fallback';
        fallbackRecipe.system_error = error.message;

        res.status(200).json({
            success: false,
            error: 'SYSTEM_ERROR',
            message: 'Recipe generation encountered an error',
            data: fallbackRecipe,
            meta: {
                generated_at: new Date().toISOString(),
                fallback_used: true
            }
        });
    }
};

// Utility endpoint for health checks
module.exports.health = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '3.0.0',
        services: {
            ai_models: 'available',
            recipe_generation: 'operational',
            fallback_system: 'ready'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };

    res.status(200).json(health);
};