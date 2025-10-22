// Celestique AI Recipe Master - Ultra Advanced
class CelestiqueRecipeMaster {
    constructor() {
        this.features = {
            VOICE_INPUT: true,
            IMAGE_GENERATION: true,
            MEAL_PLANNING: true,
            NUTRITION_TRACKING: true,
            SHOPPING_LISTS: true,
            COOKING_TIMER: true,
            CONVERSION_CALCULATOR: true,
            RECIPE_SCALING: true,
            FLAVOR_PROFILING: true,
            WINE_PAIRING: true,
            DIETARY_ADAPTATION: true,
            TECHNIQUE_VIDEOS: true,
            INGREDIENT_SUBSTITUTION: true,
            SEASONAL_SUGGESTIONS: true,
            COST_CALCULATION: true,
            KITCHEN_INVENTORY: true,
            RECIPE_SAVING: true,
            SOCIAL_SHARING: true,
            COOKING_STREAK: true,
            ACHIEVEMENTS: true
        };
        
        this.currentRecipe = null;
        this.userPreferences = this.loadPreferences();
        this.cookingTimer = null;
        this.voiceRecognition = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.loadUserData();
        this.showDashboard();
        this.startCookingStreak();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('navDashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('navRecipeGen').addEventListener('click', () => this.showRecipeGenerator());
        document.getElementById('navMealPlan').addEventListener('click', () => this.showMealPlanner());
        document.getElementById('navNutrition').addEventListener('click', () => this.showNutritionTracker());
        document.getElementById('navSettings').addEventListener('click', () => this.showSettings());

        // Recipe Generation
        document.getElementById('generateRecipe').addEventListener('click', () => this.generateRecipe());
        document.getElementById('voiceInputBtn').addEventListener('click', () => this.toggleVoiceInput());
        document.getElementById('uploadImageBtn').addEventListener('click', () => this.handleImageUpload());
        document.getElementById('quickIdeasBtn').addEventListener('click', () => this.showQuickIdeas());

        // Cooking Tools
        document.getElementById('startTimerBtn').addEventListener('click', () => this.startCookingTimer());
        document.getElementById('scaleRecipeBtn').addEventListener('click', () => this.scaleRecipe());
        document.getElementById('convertUnitsBtn').addEventListener('click', () => this.showUnitConverter());
        document.getElementById('shoppingListBtn').addEventListener('click', () => this.generateShoppingList());

        // Social Features
        document.getElementById('saveRecipeBtn').addEventListener('click', () => this.saveRecipe());
        document.getElementById('shareRecipeBtn').addEventListener('click', () => this.shareRecipe());
        document.getElementById('printRecipeBtn').addEventListener('click', () => this.printRecipe());

        // Input handling
        document.getElementById('recipeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateRecipe();
        });

        // Quick filters
        document.querySelectorAll('.diet-filter').forEach(filter => {
            filter.addEventListener('click', (e) => this.applyDietFilter(e.target.dataset.diet));
        });

        // Initialize all tooltips
        this.initTooltips();
    }

    async generateRecipe() {
        const input = document.getElementById('recipeInput').value.trim();
        if (!input) {
            this.showNotification('Please describe what you want to cook!', 'warning');
            return;
        }

        this.showLoadingState();
        const preferences = this.getCurrentPreferences();

        try {
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    preferences: preferences
                })
            });

            if (!response.ok) throw new Error('Server error');
            
            const recipe = await response.json();
            this.currentRecipe = recipe;
            this.displayRecipe(recipe);
            this.trackRecipeGeneration();
            this.showNotification('Recipe generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Failed to generate recipe. Using fallback.', 'error');
            this.currentRecipe = this.getFallbackRecipe(input);
            this.displayRecipe(this.currentRecipe);
        } finally {
            this.hideLoadingState();
        }
    }

    displayRecipe(recipe) {
        const container = document.getElementById('recipeContainer');
        container.innerHTML = this.createRecipeHTML(recipe);
        this.attachRecipeInteractions();
        this.showSection('recipeResults');
    }

    createRecipeHTML(recipe) {
        return `
            <div class="recipe-master">
                <!-- Recipe Header -->
                <div class="recipe-header">
                    <div class="recipe-meta">
                        <span class="recipe-score">${recipe.recipe_score}%</span>
                        <span class="cuisine-badge">${recipe.cuisine}</span>
                        <span class="difficulty-badge">${recipe.difficulty}</span>
                    </div>
                    <h1 class="recipe-title">${recipe.name}</h1>
                    <p class="recipe-description">${recipe.description}</p>
                    
                    <!-- Quick Stats -->
                    <div class="recipe-stats">
                        <div class="stat">
                            <i class="fas fa-clock"></i>
                            <span>${recipe.total_time}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span>Serves ${recipe.servings}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-fire"></i>
                            <span>${recipe.calories_per_serving} cal</span>
                        </div>
                    </div>
                </div>

                <!-- Flavor Profile -->
                <div class="flavor-profile">
                    <h3>Flavor Profile</h3>
                    <div class="flavor-bars">
                        ${this.createFlavorBars(recipe.flavor_profile)}
                    </div>
                </div>

                <!-- Ingredients & Equipment -->
                <div class="ingredients-equipment">
                    <div class="ingredients-section">
                        <h3>Ingredients</h3>
                        <div class="ingredients-list">
                            ${recipe.ingredients.map(ing => `
                                <div class="ingredient-item" data-ingredient="${ing.name}">
                                    <span class="quantity">${ing.quantity}</span>
                                    <span class="name">${ing.name}</span>
                                    ${ing.notes ? `<span class="notes">${ing.notes}</span>` : ''}
                                    <button class="substitute-btn" onclick="app.showSubstitutions('${ing.name}')">
                                        <i class="fas fa-exchange-alt"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="equipment-section">
                        <h3>Equipment Needed</h3>
                        <div class="equipment-list">
                            ${recipe.equipment.map(item => `
                                <div class="equipment-item">
                                    <i class="fas fa-utensils"></i>
                                    <span>${item}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="instructions-section">
                    <h3>Cooking Instructions</h3>
                    <div class="instructions-timeline">
                        ${recipe.instructions.map(step => `
                            <div class="instruction-step">
                                <div class="step-number">${step.step}</div>
                                <div class="step-content">
                                    <p>${step.description}</p>
                                    ${step.time ? `<span class="step-time">${step.time}</span>` : ''}
                                    ${step.tips && step.tips.length > 0 ? `
                                        <div class="step-tips">
                                            ${step.tips.map(tip => `<span class="tip">💡 ${tip}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                                <button class="timer-btn" onclick="app.startStepTimer('${step.time}')">
                                    <i class="fas fa-hourglass-start"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Chef Tips -->
                <div class="chef-tips-section">
                    <h3>Professional Chef Tips</h3>
                    <div class="tips-grid">
                        ${recipe.chef_tips.map(tip => `
                            <div class="tip-card">
                                <i class="fas fa-lightbulb"></i>
                                <p>${tip}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Pairings & Nutrition -->
                <div class="pairing-nutrition">
                    <div class="pairings">
                        <h4>Perfect Pairings</h4>
                        <div class="pairing-items">
                            ${recipe.pairings.map(pairing => `
                                <span class="pairing-item">${pairing}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="nutrition-facts">
                        <h4>Nutrition Facts (per serving)</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="label">Calories</span>
                                <span class="value">${recipe.nutritional_info.calories}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="label">Protein</span>
                                <span class="value">${recipe.nutritional_info.protein}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="label">Carbs</span>
                                <span class="value">${recipe.nutritional_info.carbs}</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="label">Fat</span>
                                <span class="value">${recipe.nutritional_info.fat}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="recipe-actions">
                    <button class="btn-primary" onclick="app.generateShoppingList()">
                        <i class="fas fa-shopping-cart"></i> Shopping List
                    </button>
                    <button class="btn-secondary" onclick="app.saveRecipe()">
                        <i class="fas fa-bookmark"></i> Save Recipe
                    </button>
                    <button class="btn-secondary" onclick="app.shareRecipe()">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                    <button class="btn-secondary" onclick="app.scaleRecipe()">
                        <i class="fas fa-calculator"></i> Scale
                    </button>
                </div>

                <div class="recipe-footer">
                    <span class="powered-by">${recipe.powered_by}</span>
                    <span class="generated-time">Generated ${new Date(recipe.generated_at).toLocaleString()}</span>
                </div>
            </div>
        `;
    }

    createFlavorBars(profile) {
        return Object.entries(profile).map(([flavor, value]) => `
            <div class="flavor-bar">
                <span class="flavor-name">${flavor}</span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${value * 10}%" data-value="${value}"></div>
                </div>
                <span class="flavor-value">${value}/10</span>
            </div>
        `).join('');
    }

    // Advanced Features Implementation
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.voiceRecognition = new webkitSpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('recipeInput').value = transcript;
                this.showNotification('Voice input captured!', 'success');
            };
            
            this.voiceRecognition.onerror = (event) => {
                this.showNotification('Voice recognition failed', 'error');
            };
        }
    }

    toggleVoiceInput() {
        if (this.voiceRecognition) {
            this.voiceRecognition.start();
            this.showNotification('Listening... Speak your recipe request', 'info');
        } else {
            this.showNotification('Voice recognition not supported', 'warning');
        }
    }

    startCookingTimer() {
        if (this.currentRecipe) {
            const totalMinutes = this.parseTimeToMinutes(this.currentRecipe.total_time);
            this.createTimerModal(totalMinutes);
        }
    }

    startStepTimer(timeString) {
        const minutes = this.parseTimeToMinutes(timeString);
        this.createTimerModal(minutes, `Step Timer: ${timeString}`);
    }

    createTimerModal(minutes, title = 'Cooking Timer') {
        const modal = document.createElement('div');
        modal.className = 'timer-modal';
        modal.innerHTML = `
            <div class="timer-content">
                <h3>${title}</h3>
                <div class="timer-display">${this.formatTime(minutes * 60)}</div>
                <div class="timer-controls">
                    <button onclick="app.startTimer(${minutes})">Start</button>
                    <button onclick="app.pauseTimer()">Pause</button>
                    <button onclick="app.stopTimer()">Stop</button>
                </div>
                <button class="close-timer" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    startTimer(minutes) {
        let seconds = minutes * 60;
        this.cookingTimer = setInterval(() => {
            seconds--;
            const display = document.querySelector('.timer-display');
            if (display) display.textContent = this.formatTime(seconds);
            
            if (seconds <= 0) {
                this.stopTimer();
                this.showNotification('Timer finished!', 'success');
                this.playTimerSound();
            }
        }, 1000);
    }

    generateShoppingList() {
        if (!this.currentRecipe) return;
        
        const ingredients = this.currentRecipe.ingredients;
        const shoppingList = ingredients.map(ing => 
            `☐ ${ing.quantity} ${ing.name} ${ing.notes ? `(${ing.notes})` : ''}`
        ).join('\n');
        
        this.showModal('Shopping List', `
            <div class="shopping-list">
                <textarea readonly>${shoppingList}</textarea>
                <div class="shopping-actions">
                    <button onclick="app.printText('${shoppingList.replace(/\n/g, '\\n')}')">Print</button>
                    <button onclick="app.copyToClipboard('${shoppingList.replace(/\n/g, '\\n')}')">Copy</button>
                </div>
            </div>
        `);
    }

    scaleRecipe() {
        if (!this.currentRecipe) return;
        
        this.showModal('Scale Recipe', `
            <div class="scale-recipe">
                <label>Current Servings: ${this.currentRecipe.servings}</label>
                <input type="number" id="newServings" value="${this.currentRecipe.servings}" min="1" max="20">
                <button onclick="app.calculateScaledRecipe()">Calculate</button>
                <div id="scaledResults"></div>
            </div>
        `);
    }

    calculateScaledRecipe() {
        const newServings = parseInt(document.getElementById('newServings').value);
        const scaleFactor = newServings / this.currentRecipe.servings;
        
        const scaledIngredients = this.currentRecipe.ingredients.map(ing => {
            return this.scaleIngredient(ing, scaleFactor);
        });
        
        document.getElementById('scaledResults').innerHTML = `
            <h4>Scaled Ingredients:</h4>
            ${scaledIngredients.map(ing => `
                <div class="scaled-ingredient">
                    <span class="quantity">${ing.scaledQuantity}</span>
                    <span class="name">${ing.name}</span>
                </div>
            `).join('')}
        `;
    }

    scaleIngredient(ingredient, scaleFactor) {
        // Simple scaling logic - in production, you'd want more sophisticated parsing
        const quantity = ingredient.quantity;
        const scaledQuantity = this.parseAndScaleQuantity(quantity, scaleFactor);
        
        return {
            ...ingredient,
            scaledQuantity: scaledQuantity
        };
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="modal-body">${content}</div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showSection(sectionId) {
        document.querySelectorAll('.main-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Data Management
    saveRecipe() {
        if (!this.currentRecipe) return;
        
        const savedRecipes = JSON.parse(localStorage.getItem('celestique_saved_recipes') || '[]');
        savedRecipes.push({
            ...this.currentRecipe,
            saved_at: new Date().toISOString()
        });
        
        localStorage.setItem('celestique_saved_recipes', JSON.stringify(savedRecipes));
        this.showNotification('Recipe saved to your collection!', 'success');
    }

    loadPreferences() {
        return JSON.parse(localStorage.getItem('celestique_preferences') || '{}');
    }

    savePreferences() {
        localStorage.setItem('celestique_preferences', JSON.stringify(this.userPreferences));
    }

    // 20+ Features Tracking
    trackRecipeGeneration() {
        const stats = JSON.parse(localStorage.getItem('celestique_stats') || '{"generated": 0, "last_generated": ""}');
        stats.generated++;
        stats.last_generated = new Date().toISOString();
        localStorage.setItem('celestique_stats', JSON.stringify(stats));
        
        this.updateAchievements();
    }

    startCookingStreak() {
        // Implement cooking streak tracking
        const today = new Date().toDateString();
        const lastCooked = localStorage.getItem('celestique_last_cooked');
        
        if (lastCooked !== today) {
            const streak = parseInt(localStorage.getItem('celestique_cooking_streak') || '0');
            localStorage.setItem('celestique_cooking_streak', (streak + 1).toString());
            localStorage.setItem('celestique_last_cooked', today);
        }
    }

    updateAchievements() {
        // Implement achievement system
        const stats = JSON.parse(localStorage.getItem('celestique_stats') || '{"generated": 0}');
        const achievements = [];
        
        if (stats.generated >= 10) achievements.push('Recipe Explorer');
        if (stats.generated >= 50) achievements.push('Master Chef');
        if (stats.generated >= 100) achievements.push('Recipe Guru');
        
        localStorage.setItem('celestique_achievements', JSON.stringify(achievements));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CelestiqueRecipeMaster();
});