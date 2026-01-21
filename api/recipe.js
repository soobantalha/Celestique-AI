/**
 * Celestique AI v2.0 - World Edition Backend
 * Owned by: Sooban Talha Technologies (soobantalhatech.xyz)
 * Deployed at: celestiqueai.vercel.app
 * * SYSTEM ARCHITECTURE:
 * - Request Validation
 * - User Personalization Layer
 * - AI Model Orchestration
 * - Fallback Neural Database
 */

import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. GLOBAL CORS POLICY (Allows access from anywhere in the world)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed - Use POST' });
    }

    try {
        const { prompt, userName = "Chef" } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Please provide a food request.' });
        }

        console.log(`[SoobanTalhaTech] Request from ${userName}: ${prompt}`);

        // 2. ATTEMPT AI GENERATION
        let recipeData;
        try {
            // Check for API Key (Set this in Vercel Environment Variables)
            if (!process.env.OPENROUTER_API_KEY) {
                throw new Error("No API Key configured - switching to Fallback Mode");
            }
            recipeData = await generateAIRecipe(prompt, userName);
        } catch (error) {
            console.warn("AI Generation failed, using Fallback Engine:", error.message);
            recipeData = generateFallbackRecipe(prompt, userName);
        }

        // 3. SEND RESPONSE
        res.status(200).json({
            success: true,
            meta: {
                powered_by: "Sooban Talha Technologies",
                version: "2.0.0-WORLD",
                timestamp: new Date().toISOString()
            },
            data: recipeData
        });

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// --- AI ORCHESTRATOR ---
async function generateAIRecipe(prompt, userName) {
    const systemPrompt = `
        You are Celestique AI, a world-class culinary expert created by Sooban Talha Technologies.
        You are speaking to "${userName}".
        
        Create a detailed, delicious recipe for: "${prompt}".
        
        Return strictly JSON format:
        {
            "title": "Recipe Name",
            "description": "Warm, appetizing description addressing ${userName}",
            "stats": { "time": "30 mins", "servings": "2", "difficulty": "Medium" },
            "ingredients": ["Item 1", "Item 2"],
            "steps": ["Step 1", "Step 2"],
            "tips": ["Tip 1", "Tip 2"]
        }
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://celestiqueai.vercel.app',
            'X-Title': 'Celestique AI'
        },
        body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [{ role: 'user', content: systemPrompt }]
        })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

// --- FALLBACK DATABASE (If AI is offline) ---
function generateFallbackRecipe(prompt, userName) {
    return {
        title: `Signature ${prompt}`,
        description: `Hello ${userName}! Here is a specially crafted version of ${prompt}, designed by the Sooban Talha Technologies offline engine just for you.`,
        stats: {
            time: "45 Mins",
            servings: "2-4 People",
            difficulty: "Easy"
        },
        ingredients: [
            "500g Fresh Main Ingredient",
            "2 tbsp Olive Oil (Extra Virgin)",
            "1 tsp Sooban's Secret Spice Mix",
            "Salt & Pepper to taste",
            "Fresh Herbs for garnish"
        ],
        steps: [
            "Begin by washing all vegetables and preparing your workstation (mise en place).",
            "Heat the oil in a large pan over medium heat until it shimmers.",
            "Add the main ingredients and sear until golden brown (approx 5-7 mins).",
            "Lower the heat, add spices, and cover. Let it simmer to develop flavor.",
            "Serve hot, garnished with fresh herbs. Enjoy your meal, Chef " + userName + "!"
        ],
        tips: [
            "Rest the dish for 5 minutes before serving.",
            "Adjust spices according to your taste.",
            "Download the PDF to save this forever."
        ]
    };
}