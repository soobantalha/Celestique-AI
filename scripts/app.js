// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendMessageBtn = document.getElementById('send-message');

// Create luxury floating particles
function createLuxuryParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '-1';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'luxury-particle';
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 10 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.top = `${posY}vh`;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        particlesContainer.appendChild(particle);
    }
}

// Dynamic gradient effect
const root = document.documentElement;
const gradients = [
    { start: '#6e45e2', mid: '#b354e9', end: '#ff6b6b' },
    { start: '#d4af37', mid: '#e5e4e2', end: '#9b870c' },
    { start: '#4ecdc4', mid: '#44a08d', end: '#093637' },
    { start: '#6a11cb', mid: '#2575fc', end: '#009efd' }
];

let currentGradient = 0;

// Change gradients every 10 seconds
setInterval(() => {
    currentGradient = (currentGradient + 1) % gradients.length;
    const gradient = gradients[currentGradient];
    
    root.style.setProperty('--gradient-start', gradient.start);
    root.style.setProperty('--gradient-mid', gradient.mid);
    root.style.setProperty('--gradient-end', gradient.end);
}, 10000);

// Send message function - will call the backend API
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Call our backend API with full URL for Vercel
        const response = await fetch('https://celestiqueai.vercel.app/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        console.log('API Response status:', response.status);
        
        // Remove loading indicator
        chatMessages.removeChild(loadingDiv);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        if (data.error) {
            addMessage(`Error: ${data.error}`, 'bot');
            return;
        }
        
        // Display the recipe
        displayRecipe(data);
    } catch (error) {
        console.error('Fetch error:', error);
        // Remove loading indicator
        if (chatMessages.contains(loadingDiv)) {
            chatMessages.removeChild(loadingDiv);
        }
        
        // Use fallback recipe
        useFallbackRecipe(message);
    }
}

// Use fallback recipe when API is unavailable
function useFallbackRecipe(message) {
    const fallbackRecipes = [
        {
            "name": "Truffle Infused Wild Mushroom Risotto",
            "cuisine": "Italian",
            "difficulty": "Intermediate",
            "prep_time": "45 minutes",
            "ingredients": [
                "1 cup Arborio rice", "4 cups vegetable broth", "1 cup mixed wild mushrooms",
                "2 tbsp black truffle oil", "1 shallot, finely chopped", "1/2 cup dry white wine",
                "1/4 cup grated Parmesan cheese", "2 tbsp butter", "1 tbsp fresh thyme leaves",
                "Salt and white pepper to taste", "Fresh truffle shavings for garnish"
            ],
            "instructions": [
                "Heat the truffle oil in a large pan over medium heat. Add shallots and sauté until translucent.",
                "Add wild mushrooms and cook until they release their moisture and become golden.",
                "Stir in Arborio rice, coating it with the oil and toasting for 2 minutes.",
                "Pour in white wine and cook until mostly absorbed, stirring constantly.",
                "Add warm broth one ladle at a time, allowing each addition to be absorbed before adding the next.",
                "Continue this process until rice is creamy yet al dente (about 18-20 minutes).",
                "Remove from heat and stir in butter, Parmesan, and thyme. Season to taste.",
                "Serve immediately garnished with fresh truffle shavings and a drizzle of truffle oil."
            ],
            "tips": [
                "Use a wide, shallow pan for even cooking of the risotto.",
                "Keep broth at a steady simmer to maintain cooking temperature.",
                "Stir constantly to develop the creamy starch texture.",
                "For extra richness, finish with a tablespoon of mascarpone."
            ],
            "score": 92
        },
        {
            "name": "Saffron and Seafood Paella",
            "cuisine": "Spanish",
            "difficulty": "Advanced",
            "prep_time": "1 hour",
            "ingredients": [
                "1 1/2 cups Bomba or Calasparra rice", "4 cups fish stock, warmed", "1/2 lb mixed seafood (shrimp, mussels, clams, calamari)",
                "1 pinch saffron threads", "1 onion, finely diced", "1 red bell pepper, sliced",
                "3 cloves garlic, minced", "1 tomato, grated", "1/2 cup frozen peas",
                "3 tbsp olive oil", "1 tsp smoked paprika", "Lemon wedges for serving"
            ],
            "instructions": [
                "Steep saffron threads in 1/4 cup warm fish stock for 10 minutes.",
                "Heat olive oil in a large paella pan over medium-high heat.",
                "Sear seafood until just cooked, then remove and set aside.",
                "Sauté onion, bell pepper, and garlic until softened.",
                "Add grated tomato and smoked paprika, cook until thickened.",
                "Add rice and stir to coat, toasting for 2 minutes.",
                "Pour in saffron-infused stock and remaining fish stock. Bring to a simmer.",
                "Arrange seafood and peas over the rice. Do not stir from this point.",
                "Cook for 15-20 minutes until liquid is absorbed and rice is cooked.",
                "Increase heat for the last 2 minutes to create socarrat (crispy bottom).",
                "Rest for 5 minutes before serving with lemon wedges."
            ],
            "tips": [
                "Use a traditional paella pan for even heat distribution.",
                "Do not stir after adding the seafood to create the characteristic texture.",
                "For authentic flavor, use real saffron - it's worth the investment.",
                "Let the paella rest before serving to allow flavors to meld."
            ],
            "score": 94
        },
        {
            "name": "Herb-Crusted Rack of Lamb with Red Wine Reduction",
            "cuisine": "French",
            "difficulty": "Advanced",
            "prep_time": "1 hour 30 minutes",
            "ingredients": [
                "1 rack of lamb (8 ribs)", "2 cloves garlic, minced", "2 tbsp fresh rosemary, chopped",
                "2 tbsp fresh thyme, chopped", "1/4 cup Dijon mustard", "1 cup breadcrumbs",
                "1/2 cup parsley, chopped", "1/2 cup red wine", "1 cup beef stock",
                "2 tbsp butter", "Salt and pepper to taste"
            ],
            "instructions": [
                "Preheat oven to 400°F (200°C).",
                "Season the rack of lamb with salt and pepper.",
                "Sear the lamb in a hot pan on all sides until browned.",
                "Mix garlic, rosemary, thyme, and Dijon mustard. Coat the lamb with this mixture.",
                "Combine breadcrumbs and parsley, then press onto the mustard-coated lamb.",
                "Roast in the oven for 20-25 minutes for medium-rare.",
                "While the lamb rests, prepare the reduction by deglazing the pan with red wine.",
                "Add beef stock and reduce by half. Finish with butter.",
                "Slice the lamb between the ribs and serve with the reduction sauce."
            ],
            "tips": [
                "Let the lamb come to room temperature before cooking for even doneness.",
                "Use a meat thermometer to ensure perfect cooking (125°F for medium-rare).",
                "Allow the lamb to rest for 10 minutes before slicing to retain juices.",
                "Strain the reduction sauce for a smoother texture."
            ],
            "score": 96
        }
    ];
    
    // Select a random fallback recipe
    const recipe = fallbackRecipes[Math.floor(Math.random() * fallbackRecipes.length)];
    
    // Display the recipe
    displayRecipe(recipe);
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Display recipe in a formatted way
function displayRecipe(recipe) {
    // Check if recipe is a string (API might have returned raw text)
    if (typeof recipe === 'string') {
        try {
            // Try to parse as JSON
            recipe = JSON.parse(recipe);
        } catch (e) {
            // If it's not JSON, just show the text
            addMessage(recipe, 'bot');
            return;
        }
    }
    
    // Check if the recipe has the expected structure
    if (!recipe.name || !recipe.ingredients) {
        // If not, it might be an error message or malformed response
        addMessage("Sorry, I couldn't generate a proper recipe. Please try again.", 'bot');
        if (typeof recipe === 'object') {
            console.error('Malformed recipe object:', recipe);
        }
        return;
    }
    
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'message bot-message';
    
    recipeDiv.innerHTML = `
        <div class="recipe-card">
            <div class="recipe-header">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span>${recipe.cuisine || 'International'}</span>
                    <span>${recipe.difficulty || 'Moderate'}</span>
                    <span>${recipe.prep_time || '30 minutes'}</span>
                </div>
            </div>
            
            <div class="recipe-section">
                <h4>Ingredients</h4>
                <ul class="ingredients-list">
                    ${(recipe.ingredients || []).map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            
            <div class="recipe-section">
                <h4>Instructions</h4>
                <ol class="instructions-list">
                    ${(recipe.instructions || []).map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            
            <div class="recipe-section">
                <h4>Chef's Tips</h4>
                <ul class="tips-list">
                    ${(recipe.tips || []).map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            <div class="recipe-stats">
                <div class="stat-item">
                    <div class="stat-value">${recipe.score || '90'}/100</div>
                    <div class="stat-label">Recipe Score</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">High</div>
                    <div class="stat-label">Nutritional Value</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">Balanced</div>
                    <div class="stat-label">Taste Profile</div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(recipeDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Animation on scroll
const fadeElements = document.querySelectorAll('.fade-in');

function checkFade() {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = (elementTop < window.innerHeight - 100) && (elementBottom > 0);
        
        if (isVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Set initial state for fade elements
fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
});

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Create luxury particles
    createLuxuryParticles();
    
    // Check on load and scroll
    window.addEventListener('load', checkFade);
    window.addEventListener('scroll', checkFade);
    checkFade(); // Initial check
    
    // Send message button event
    sendMessageBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});