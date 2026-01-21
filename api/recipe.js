/**
 * CELESTIQUE AI - NEURAL ENGINE
 * Property of Sooban Talha Technologies
 */

class RecipeEngine {
    constructor() {
        this.adj = ["Velvety", "Rustic", "Golden", "Smoked", "Artisan", "Zesty", "Decadent", "Infused", "Whipped", "Glazed", "Slow-Roasted", "Pan-Seared"];
        
        this.data = {
            italian: {
                mains: ["Truffle Carbonara", "Wild Mushroom Risotto", "Osso Buco", "Pesto Gnocchi", "Lasagna Classico"],
                ingredients: ["00 Flour", "San Marzano Tomatoes", "Pecorino Romano", "Truffle Oil", "Fresh Basil", "Guanciale"],
                story: "Born in the sun-drenched hills of Tuscany, this recipe respects the ancient tradition of 'la cucina povera'—creating luxury from simple, high-quality ingredients.",
                methods: ["Emulsifying the sauce", "Slow simmering for depth", "Al dente boiling"]
            },
            mexican: {
                mains: ["Birria Tacos", "Mole Poblano", "Chiles Rellenos", "Street Corn Salad", "Carne Asada"],
                ingredients: ["Oaxaca Cheese", "Guajillo Chiles", "Corn Masa", "Cilantro", "Lime Zest", "Avocado"],
                story: "A vibrant explosion of flavor tracing back to Oaxacan markets, blending indigenous techniques with Spanish influence.",
                methods: ["Charring the peppers", "Grinding spices", "Slow braising"]
            },
            asian: {
                mains: ["Miso Glazed Cod", "Spicy Ramen", "Pad Thai", "Kung Pao Chicken", "Sushi Bowl"],
                ingredients: ["White Miso", "Bok Choy", "Ginger Root", "Sesame Oil", "Rice Vinegar", "Bonito Flakes"],
                story: "Focused on the perfect harmony of the five flavors: sweet, sour, salty, bitter, and umami.",
                methods: ["Wok searing", "Steam infusion", "Quick pickling"]
            },
            healthy: {
                mains: ["Quinoa Power Bowl", "Avocado Toast Royale", "Green Goddess Salad", "Grilled Salmon"],
                ingredients: ["Chia Seeds", "Kale", "Turmeric", "Greek Yogurt", "Almond Butter", "Lean Protein"],
                story: "Designed to fuel the body and clarify the mind, proving that nutritious food can be deeply satisfying.",
                methods: ["Raw assembly", "Gentle poaching", "Roasting"]
            },
            dessert: {
                mains: ["Molten Lava Cake", "Berry Pavlova", "Tiramisu", "Lemon Tart"],
                ingredients: ["70% Dark Chocolate", "Madagascar Vanilla", "Mascarpone", "Fresh Berries", "Heavy Cream"],
                story: "A sweet conclusion to the evening, crafted to bring pure joy and indulgence.",
                methods: ["Tempering chocolate", "Whipping peaks", "Folding gently"]
            },
            generic: {
                mains: ["Harvest Roast", "Chef's Signature Bowl", "Comfort Stew", "Sunday Feast"],
                ingredients: ["Sea Salt", "Cracked Pepper", "Olive Oil", "Garlic", "Butter", "Herbs"],
                story: "A universal classic that brings warmth and comfort to any table.",
                methods: ["Seasoning", "Sautéing", "Baking"]
            }
        };
    }

    generate(prompt, user) {
        const ctx = this.analyze(prompt);
        const db = this.data[ctx.type];
        const main = this.rand(db.mains);
        const title = `${this.rand(this.adj)} ${main}`;
        
        return {
            title: title,
            intro: this.getIntro(user, title),
            cuisine: ctx.type.charAt(0).toUpperCase() + ctx.type.slice(1) + " Fusion",
            story: db.story,
            totalTime: Math.floor(Math.random() * 60 + 20) + " mins",
            calories: Math.floor(Math.random() * 600 + 300) + " kcal",
            ingredients: this.getIngredients(db),
            steps: this.getSteps(db, main),
            macros: {
                protein: Math.floor(Math.random() * 30 + 10),
                carbs: Math.floor(Math.random() * 50 + 20),
                fats: Math.floor(Math.random() * 20 + 5)
            },
            tips: [
                "Taste as you go—you are the conductor of this orchestra.",
                "Let ingredients come to room temperature before cooking.",
                "Rest the dish for 5 minutes before serving.",
                "Presentation is half the flavor."
            ],
            substitutions: "Use gluten-free alternatives if needed; swap protein for tofu for a vegan option.",
            pairings: "A crisp white wine or sparkling water with lime.",
            finalMessage: `Chef ${user}, the kitchen is your canvas.`
        };
    }

    analyze(prompt) {
        const p = prompt.toLowerCase();
        if (p.includes('pasta') || p.includes('italian')) return { type: 'italian' };
        if (p.includes('taco') || p.includes('spicy')) return { type: 'mexican' };
        if (p.includes('rice') || p.includes('asian')) return { type: 'asian' };
        if (p.includes('healthy') || p.includes('salad')) return { type: 'healthy' };
        if (p.includes('sweet') || p.includes('cake')) return { type: 'dessert' };
        return { type: 'generic' };
    }

    getIntro(user, title) {
        const i = [
            `Chef ${user}, get ready for a symphony of flavors with this ${title}.`,
            `Designed specifically for your palate, ${user}. This is ${title}.`,
            `A masterpiece awaits, ${user}. Let's cook ${title}.`
        ];
        return this.rand(i);
    }

    getIngredients(db) {
        let base = ["Kosher Salt", "Olive Oil", "Black Pepper"];
        for(let i=0; i<4; i++) base.push(this.rand(db.ingredients));
        return [...new Set(base)];
    }

    getSteps(db, main) {
        return [
            "Prepare your workspace (mise en place). Wash produce and measure ingredients.",
            `Begin by ${db.methods[0]} to build the foundation of flavor.`,
            `Combine main elements, ensuring the ${main} is treated with care.`,
            `Season generously and taste. Adjust acidity or salt as needed.`,
            `Plate artistically, garnish with fresh herbs, and serve immediately.`
        ];
    }

    rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
}

window.CelestiqueEngine = new RecipeEngine();