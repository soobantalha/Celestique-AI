/**
 * CELESTIQUE AI - NEURAL RECIPE ENGINE (Frontend Logic)
 * Property of Sooban Talha Technologies
 * * This module procedurally generates recipes based on input analysis
 * * using a massive local database of culinary logic.
 * * No API keys required. Works offline.
 */

class RecipeEngine {
    constructor() {
        this.branding = "Sooban Talha Technologies";
        
        // --- DATA BANKS ---
        this.adjectives = ["Rustic", "Velvety", "Golden", "Aromatic", "Spiced", "Glazed", "Slow-Roasted", "Pan-Seared", "Decadent", "Zesty", "Infused", "Artisan", "Heritage", "Smoked", "Whipped"];
        
        this.cuisines = {
            italian: {
                mains: ["Truffle Linguine", "Risotto Nero", "Osso Buco", "Carbonara Authentico"],
                ingredients: ["San Marzano Tomatoes", "Pecorino Romano", "Fresh Basil", "00 Flour", "Truffle Oil", "Prosciutto di Parma"],
                methods: ["Al dente boiling", "Emulsifying sauce", "Slow simmering"],
                story: "Rooted in the sun-drenched hills of Tuscany, this dish celebrates simplicity and high-quality ingredients."
            },
            mexican: {
                mains: ["Mole Poblano", "Birria Tacos", "Enchiladas Verdes", "Ceviche"],
                ingredients: ["Guajillo Chiles", "Corn Masa", "Oaxaca Cheese", "Cilantro", "Lime", "Avocado"],
                methods: ["Charring peppers", "Slow braising", "Grinding spices"],
                story: "A vibrant explosion of flavor tracing back to ancient Mayan traditions."
            },
            asian: {
                mains: ["Miso Ramen", "Kung Pao Chicken", "Pad Thai", "Sushi Rolls"],
                ingredients: ["Soy Sauce", "Ginger", "Lemongrass", "Sesame Oil", "Bok Choy", "Miso Paste"],
                methods: ["Wok frying", "Steaming", "Pickling"],
                story: "Balanced harmony of sweet, salty, sour, and umami flavors defined by centuries of technique."
            },
            healthy: {
                mains: ["Quinoa Power Bowl", "Avocado Toast Royale", "Grilled Salmon", "Green Goddess Salad"],
                ingredients: ["Kale", "Chia Seeds", "Almond Butter", "Turmeric", "Lean Protein", "Greek Yogurt"],
                methods: ["Roasting", "Raw assembly", "Blanching"],
                story: "Designed to fuel the body and mind without compromising on taste."
            },
            dessert: {
                mains: ["Molten Lava Cake", "Berry Pavlova", "Tiramisu", "Lemon Tart"],
                ingredients: ["70% Dark Chocolate", "Vanilla Bean Paste", "Mascarpone", "Fresh Berries", "Heavy Cream"],
                methods: ["Baking", "Whipping", "Tempering chocolate"],
                story: "A sweet conclusion to any meal, crafted to bring pure joy."
            }
        };

        this.generic = {
            mains: ["Harvest Feast", "Chef's Special", "Sunday Roast", "Comfort Bowl"],
            ingredients: ["Sea Salt", "Black Pepper", "Olive Oil", "Garlic", "Onion", "Butter"],
            methods: ["Sautéing", "Baking", "Seasoning"],
            story: "A universal classic that brings people together around the table."
        };
    }

    /**
     * Main Generation Function
     */
    generate(prompt, userName) {
        // 1. Context Analysis
        const ctx = this.analyzeContext(prompt);
        
        // 2. Data Selection
        const baseData = this.cuisines[ctx.type] || this.generic;
        const mainItem = this.selectRandom(baseData.mains);
        
        // 3. Procedural Construction
        const title = `${this.selectRandom(this.adjectives)} ${mainItem}`;
        const cookingTime = Math.floor(Math.random() * (90 - 20) + 20) + " mins";
        const prepTime = Math.floor(Math.random() * (30 - 10) + 10) + " mins";
        const cals = Math.floor(Math.random() * (900 - 300) + 300) + " kcal";
        
        // 4. Ingredient Generator
        const ingredients = this.generateIngredients(baseData, ctx.keywords);
        
        // 5. Steps Generator
        const steps = this.generateSteps(baseData, mainItem);

        // 6. Return Massive Object
        return {
            title: title,
            intro: this.generateIntro(userName, title, ctx),
            cuisine: ctx.type.charAt(0).toUpperCase() + ctx.type.slice(1) + " Fusion",
            story: baseData.story,
            prepTime: prepTime,
            cookingTime: cookingTime,
            difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random()*3)],
            servingSize: "2 - 4 People",
            calories: cals,
            macros: {
                Protein: Math.floor(Math.random() * 40 + 10) + "g",
                Carbs: Math.floor(Math.random() * 60 + 20) + "g",
                Fats: Math.floor(Math.random() * 30 + 5) + "g",
            },
            ingredients: ingredients,
            substitutions: ["Use Almond milk for dairy", "Gluten-free flour available", "Tofu instead of Chicken"],
            steps: steps,
            chefSecrets: [
                "Always salt your pasta water like the sea.",
                "Let meat rest for 10 minutes before slicing.",
                "Fresh herbs should be added at the very end.",
                "Use high-quality olive oil for finishing."
            ],
            commonMistakes: ["Overcrowding the pan", "Not tasting as you go", "Using cold butter for pastry"],
            flavorProfile: "Umami-rich with bright acidic notes",
            pairings: "A crisp Sauvignon Blanc or Sparkling Water with Lime",
            storage: "Store in an airtight container for up to 3 days.",
            reheating: "Gently reheat on the stove with a splash of water.",
            variations: ["Make it Spicy: Add chili flakes", "Make it Vegan: Swap protein"],
            healthNotes: "Rich in antioxidants and healthy fats.",
            finalMessage: `Chef ${userName}, this recipe is a canvas. Make it your own.`
        };
    }

    // --- LOGIC HELPERS ---

    analyzeContext(prompt) {
        const p = prompt.toLowerCase();
        let type = 'generic';
        let keywords = [];

        if (p.includes('pasta') || p.includes('pizza') || p.includes('italian')) type = 'italian';
        else if (p.includes('taco') || p.includes('mexican') || p.includes('spicy')) type = 'mexican';
        else if (p.includes('asian') || p.includes('rice') || p.includes('sushi') || p.includes('chinese')) type = 'asian';
        else if (p.includes('healthy') || p.includes('salad') || p.includes('vegan') || p.includes('keto')) type = 'healthy';
        else if (p.includes('cake') || p.includes('sweet') || p.includes('dessert') || p.includes('chocolate')) type = 'dessert';

        return { type, keywords };
    }

    generateIntro(name, title, ctx) {
        const templates = [
            `Dearest Chef ${name}, I have crafted this specific rendition of ${title} just for you.`,
            `Welcome to the kitchen, ${name}. This ${title} is designed to comfort the soul and delight the senses.`,
            `Prepare yourself, ${name}. We are about to embark on a culinary journey with this ${title}.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    generateIngredients(data, keywords) {
        // Start with base generic essentials
        let list = ["Kosher Salt", "Cracked Black Pepper", "Olive Oil"];
        // Add cuisine specifics (pick random 4)
        for(let i=0; i<4; i++) {
            list.push(this.selectRandom(data.ingredients));
        }
        // Ensure uniqueness
        return [...new Set(list)];
    }

    generateSteps(data, main) {
        return [
            "Prepare your workspace (mise en place). Wash all produce and measure ingredients.",
            `Begin by ${data.methods[0]} to build a flavor foundation.`,
            `In a large vessel, combine the main elements. Ensure the ${main} is treated with care.`,
            `Season generously. Taste. Adjust acidity and salt levels.`,
            `Allow the dish to rest for 5 minutes to let flavors meld.`,
            `Plate artistically. Garnish with fresh herbs or a drizzle of oil.`
        ];
    }

    selectRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Attach to Window
window.CelestiqueEngine = new RecipeEngine();