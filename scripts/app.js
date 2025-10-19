// Main Application Logic
class CelestiqueApp {
    constructor() {
        this.selectedModel = 'deepseek';
        this.currentRecipe = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initParticles();
        this.loadRecipeHistory();
    }

    setupEventListeners() {
        // Model selection
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectModel(card.dataset.model);
            });
        });

        // Send message button
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in input
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const recipe = chip.getAttribute('data-recipe');
                document.getElementById('user-input').value = recipe;
                this.sendMessage();
            });
        });

        // Profile form submission
        document.querySelector('.profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });
    }

    selectModel(model) {
        this.selectedModel = model;
        
        // Update UI
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.toggle('active', card.dataset.model === model);
        });

        // Update model info in chat header
        const modelInfo = this.getModelInfo(model);
        document.getElementById('selectedModelName').textContent = modelInfo.name;
        document.getElementById('selectedModelIcon').className = modelInfo.icon;

        this.showNotification(`Switched to ${modelInfo.name}`, 'info');
    }

    getModelInfo(model) {
        const models = {
            deepseek: {
                name: 'DeepSeek Chef',
                icon: 'fas fa-robot',
                description: 'Advanced reasoning for complex recipes'
            },
            gemini: {
                name: 'Gemini Gourmet',
                icon: 'fas fa-gem',
                description: 'Perfect for international cuisine'
            },
            claude: {
                name: 'Claude Cuisine',
                icon: 'fas fa-cloud',
                description: 'Health-focused and dietary recipes'
            }
        };
        return models[model] || models.deepseek;
    }

    async sendMessage() {
        const message = document.getElementById('user-input').value.trim();
        if (!message) return;

        // Check if user is authenticated
        if (!window.authSystem || !window.authSystem.currentUser) {
            this.showNotification('Please log in to generate recipes', 'error');
            return;
        }

        // Add user message to chat
        this.addMessage(message, true);

        // Clear input
        document.getElementById('user-input').value = '';

        // Show loading
        this.showLoading();

        try {
            const recipe = await this.generateRecipe(message, this.selectedModel);
            
            // Hide loading
            this.hideLoading();

            // Add recipe to chat and display it
            this.displayRecipe(recipe);

            // Save to user history
            window.authSystem.addRecipeToHistory(recipe);

            // Reload history
            this.loadRecipeHistory();

        } catch (error) {
            this.hideLoading();
            this.handleError(error);
        }
    }

    async generateRecipe(message, model) {
        console.log('Generating recipe with model:', model);

        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                model,
                userPreferences: window.authSystem.currentUser.preferences
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        data.model = model; // Add model info to recipe
        return data;
    }

    addMessage(content, isUser = false) {
        const chatMessages = document.getElementById('chat-messages');
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

    showLoading() {
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
                    <p>Crafting your gourmet recipe with ${this.getModelInfo(this.selectedModel).name}...</p>
                </div>
            </div>
        `;
        
        document.getElementById('chat-messages').appendChild(loadingDiv);
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    }

    hideLoading() {
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }

    displayRecipe(recipe) {
        const recipeCard = this.formatRecipe(recipe);
        this.addMessage(recipeCard);
        
        // Store current recipe
        this.currentRecipe = recipe;
    }

    formatRecipe(recipe) {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        if (recipe.error) {
            recipeCard.innerHTML = `
                <div class="recipe-header">
                    <h3 class="recipe-title">Recipe Generation Failed</h3>
                </div>
                <div class="recipe-content">
                    <p><strong>Error:</strong> ${recipe.error}</p>
                    <p>Please try again with a different request.</p>
                </div>
            `;
            return recipeCard;
        }
        
        const ingredientsHTML = recipe.ingredients && recipe.ingredients.length > 0 
            ? recipe.ingredients.map(ingredient => `
                <div class="ingredient-item">
                    <div class="ingredient-emoji">🥄</div>
                    <div class="ingredient-text">${ingredient}</div>
                </div>
            `).join('')
            : '<p>No ingredients specified</p>';
        
        const instructionsHTML = recipe.instructions && recipe.instructions.length > 0
            ? recipe.instructions.map(instruction => `
                <li class="instruction-step">${instruction}</li>
            `).join('')
            : '<p>No instructions provided</p>';
        
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
                        <p><i class="fas fa-robot"></i> Generated by ${this.getModelInfo(recipe.model || this.selectedModel).name} • Sooban Talha Productions</p>
                        ${recipe.generated_at ? `<p><small>Created: ${new Date(recipe.generated_at).toLocaleString()}</small></p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        return recipeCard;
    }

    loadRecipeHistory() {
        if (!window.authSystem || !window.authSystem.currentUser) return;

        const history = window.authSystem.getRecipeHistory();
        const historyGrid = document.getElementById('historyGrid');
        
        if (history.length === 0) {
            historyGrid.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-utensils"></i>
                    <h3>No recipes yet</h3>
                    <p>Your generated recipes will appear here</p>
                </div>
            `;
            return;
        }

        historyGrid.innerHTML = history.slice(0, 6).map(item => `
            <div class="history-item glass-card" data-recipe-id="${item.id}">
                <div class="history-item-header">
                    <div>
                        <div class="history-item-title">${item.recipe.name}</div>
                        <div class="history-item-meta">
                            <span>${item.recipe.cuisine || 'International'}</span>
                            <span>${item.recipe.difficulty || 'Medium'}</span>
                            <span>${new Date(item.generatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button class="history-action-btn favorite-btn ${item.favorite ? 'favorited' : ''}" 
                                onclick="app.toggleFavorite('${item.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="history-action-btn" onclick="app.viewRecipe('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="history-item-preview">
                    ${item.recipe.ingredients ? item.recipe.ingredients.slice(0, 3).join(', ') : 'No ingredients listed'}
                </div>
            </div>
        `).join('');
    }

    toggleFavorite(recipeId) {
        if (window.authSystem) {
            window.authSystem.toggleFavorite(recipeId);
            this.loadRecipeHistory(); // Reload to update UI
        }
    }

    viewRecipe(recipeId) {
        if (!window.authSystem) return;

        const recipeItem = window.authSystem.currentUser.recipeHistory.find(r => r.id === recipeId);
        if (recipeItem) {
            this.displayRecipe(recipeItem.recipe);
            document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        }
    }

    updateProfile() {
        if (!window.authSystem || !window.authSystem.currentUser) return;

        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const preferences = Array.from(document.getElementById('profilePreferences').selectedOptions)
            .map(option => option.value);

        window.authSystem.currentUser.name = name;
        window.authSystem.currentUser.email = email;
        window.authSystem.currentUser.preferences = preferences;
        
        window.authSystem.saveUserData();
        window.authSystem.updateUserInterface();
        window.authSystem.hideProfileModal();
        
        this.showNotification('Profile updated successfully', 'success');
    }

    handleError(error) {
        console.error('Error generating recipe:', error);
        
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
        
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = errorMessage;
        this.addMessage(errorDiv);
        
        this.showNotification('Failed to generate recipe. Please try again.', 'error');
    }

    showNotification(message, type = 'info') {
        if (window.authSystem) {
            window.authSystem.showNotification(message, type);
        }
    }

    initParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;
        
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
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CelestiqueApp();
});