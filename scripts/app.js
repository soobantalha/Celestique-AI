// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendMessageBtn = document.getElementById('send-message');
const recipeDisplay = document.getElementById('recipe-display');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Initialize particles
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(0, 212, 255, 0.3);
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            animation: float ${duration}s infinite ease-in-out ${delay}s;
        `;
        
        container.appendChild(particle);
    }
    
    // Add CSS for particle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(-20px); }
        }
        
        .particle {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// Add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (typeof content === 'string') {
        messageContent.innerHTML = `
            <p>${content}</p>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
    } else {
        messageContent.appendChild(content);
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        messageContent.appendChild(timeDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loading animation
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message');
    loadingDiv.id = 'loading-message';
    
    loadingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="ai-thinking">
                <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>Crafting your gourmet recipe...</p>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove loading animation
function hideLoading() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

// Format recipe display
function formatRecipe(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    
    // Handle error case
    if (recipe.error) {
        recipeCard.innerHTML = `
            <div class="recipe-header">
                <h3 class="recipe-title">Recipe Generation Failed</h3>
            </div>
            <div class="recipe-content">
                <p><strong>Error:</strong> ${recipe.error}</p>
                ${recipe.details ? `<p><strong>Details:</strong> ${recipe.details}</p>` : ''}
                <p>Please try again with a different request.</p>
            </div>
        `;
        return recipeCard;
    }
    
    // Format ingredients
    const ingredientsHTML = recipe.ingredients && recipe.ingredients.length > 0 
        ? recipe.ingredients.map(ingredient => `
            <div class="ingredient-item">
                <div class="ingredient-emoji">🥄</div>
                <div class="ingredient-text">${ingredient}</div>
            </div>
        `).join('')
        : '<p>No ingredients specified</p>';
    
    // Format instructions
    const instructionsHTML = recipe.instructions && recipe.instructions.length > 0
        ? recipe.instructions.map(instruction => `
            <li class="instruction-step">${instruction}</li>
        `).join('')
        : '<p>No instructions provided</p>';
    
    // Format tips
    const tipsHTML = recipe.chef_tips && recipe.chef_tips.length > 0
        ? recipe.chef_tips.map(tip => `
            <div class="tip-item">
                <div class="tip-icon">💡</div>
                <div class="tip-text">${tip}</div>
            </div>
        `).join('')
        : '';
    
    recipeCard.innerHTML = `
        <div class="recipe-header">
            <h2 class="recipe-title">${recipe.name || 'Gourmet Recipe'}</h2>
            <div class="recipe-meta">
                ${recipe.cuisine ? `<div class="meta-item"><i class="fas fa-globe"></i> ${recipe.cuisine}</div>` : ''}
                ${recipe.difficulty ? `<div class="meta-item"><i class="fas fa-signal"></i> ${recipe.difficulty}</div>` : ''}
                ${recipe.prep_time ? `<div class="meta-item"><i class="fas fa-clock"></i> Prep: ${recipe.prep_time}</div>` : ''}
                ${recipe.cook_time ? `<div class="meta-item"><i class="fas fa-fire"></i> Cook: ${recipe.cook_time}</div>` : ''}
                ${recipe.serves ? `<div class="meta-item"><i class="fas fa-users"></i> Serves: ${recipe.serves}</div>` : ''}
            </div>
        </div>
        
        <div class="recipe-content">
            <div class="recipe-section">
                <h3 class="section-title"><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                <div class="ingredients-grid">
                    ${ingredientsHTML}
                </div>
            </div>
            
            <div class="recipe-section">
                <h3 class="section-title"><i class="fas fa-list-ol"></i> Instructions</h3>
                <ol class="instructions-list">
                    ${instructionsHTML}
                </ol>
            </div>
            
            ${tipsHTML ? `
            <div class="recipe-section">
                <h3 class="section-title"><i class="fas fa-lightbulb"></i> Chef's Tips</h3>
                <div class="tips-grid">
                    ${tipsHTML}
                </div>
            </div>
            ` : ''}
            
            <div class="recipe-footer">
                <div class="powered-by">
                    <p><i class="fas fa-robot"></i> Generated by Célestique AI • Sooban Talha Productions</p>
                    ${recipe.generated_at ? `<p><small>Created: ${new Date(recipe.generated_at).toLocaleString()}</small></p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    return recipeCard;
}

// Send message to API
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);

    // Clear input
    userInput.value = '';

    // Show loading
    showLoading();

    try {
        console.log('Sending recipe request:', message);

        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received recipe data:', data);

        // Hide loading
        hideLoading();

        // Display recipe
        recipeDisplay.innerHTML = '';
        const recipeCard = formatRecipe(data);
        recipeDisplay.appendChild(recipeCard);

        // Add bot message with summary
        const summaryMessage = `I've created a ${data.cuisine || 'gourmet'} recipe for you! Check out "${data.name}" above with all the details.`;
        addMessage(summaryMessage);

    } catch (error) {
        console.error('Error generating recipe:', error);
        hideLoading();
        
        const errorMessage = `
            <div class="recipe-card">
                <div class="recipe-header">
                    <h3 class="recipe-title">Connection Issue</h3>
                </div>
                <div class="recipe-content">
                    <p>Unable to reach Célestique AI at the moment. Please check your connection and try again.</p>
                    <p><small>Error: ${error.message}</small></p>
                </div>
            </div>
        `;
        recipeDisplay.innerHTML = errorMessage;
        
        addMessage("I'm having trouble connecting to the recipe database. Please try again in a moment.", false);
    }
}

// Event Listeners
sendMessageBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Suggestion chip handlers
suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const recipe = chip.getAttribute('data-recipe');
        userInput.value = recipe;
        sendMessage();
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    
    // Update stats with random increments
    setInterval(() => {
        const recipesElement = document.getElementById('recipes-generated');
        const chefsElement = document.getElementById('active-chefs');
        
        let recipes = parseInt(recipesElement.textContent.replace(',', ''));
        let chefs = parseInt(chefsElement.textContent.replace(',', ''));
        
        recipes += Math.floor(Math.random() * 3);
        chefs += Math.floor(Math.random() * 2);
        
        recipesElement.textContent = recipes.toLocaleString();
        chefsElement.textContent = chefs.toLocaleString();
    }, 5000);
});

// Add CSS for loading animation
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    .ai-thinking {
        text-align: center;
        padding: 1rem;
    }
    
    .thinking-dots {
        display: flex;
        justify-content: center;
        gap: 4px;
        margin-bottom: 0.5rem;
    }
    
    .thinking-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        animation: thinkingBounce 1.4s infinite ease-in-out both;
    }
    
    .thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
    .thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0s; }
    
    @keyframes thinkingBounce {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
    }
    
    .powered-by {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-top: 2rem;
        border: 1px solid var(--card-border);
    }
    
    .powered-by p {
        margin: 0.5rem 0;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(loadingStyle);
