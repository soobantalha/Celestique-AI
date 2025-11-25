/**
 * Celestique AI Recipe Master - WORKING VERSION
 * @version 3.0.0
 * @author Sooban Talha Technologies
 */

class CelestiqueRecipeMaster {
    constructor() {
        this.currentRecipe = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showDashboard();
    }

    setupEventListeners() {
        // Recipe Generation
        document.getElementById('generateRecipe').addEventListener('click', () => this.generateRecipe());
        
        // Navigation
        document.getElementById('navDashboard').addEventListener('click', () => this.showDashboard());
        document.getElementById('navRecipeGen').addEventListener('click', () => this.showRecipeGenerator());
        
        // Enter key support
        document.getElementById('recipeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateRecipe();
            }
        });
    }

    async generateRecipe() {
        const input = document.getElementById('recipeInput').value.trim();
        if (!input) {
            this.showNotification('Please describe what you want to cook!', 'warning');
            return;
        }

        this.showLoadingState();

        try {
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: input,
                    preferences: this.getCurrentPreferences(),
                    context: this.getAdvancedOptions()
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                this.currentRecipe = result.data;
                this.displayRecipe(this.currentRecipe);
                this.showNotification('Recipe generated successfully! 🎉', 'success');
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Failed to generate recipe. Using enhanced fallback.', 'error');
            this.currentRecipe = this.getEnhancedFallbackRecipe(input);
            this.displayRecipe(this.currentRecipe);
        } finally {
            this.hideLoadingState();
        }
    }

    displayRecipe(recipe) {
        const container = document.getElementById('recipeResults');
        if (!container) return;

        container.innerHTML = this.createRecipeHTML(recipe);
        this.showSection('recipeResults');
    }

    createRecipeHTML(recipe) {
        return `
            <div class="recipe-master" data-recipe-id="${recipe.recipe_id}">
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
                            <i class="fas fa-fire-alt"></i>
                            <span>${recipe.calories_per_serving} cal</span>
                        </div>
                    </div>
                </div>

                <!-- Ingredients -->
                <div class="ingredients-section">
                    <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                    <div class="ingredients-list">
                        ${recipe.ingredients.map((ing, index) => `
                            <div class="ingredient-item">
                                <span class="quantity">${ing.quantity}</span>
                                <span class="name">${ing.name}</span>
                                ${ing.notes ? `<span class="notes">${ing.notes}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Instructions -->
                <div class="instructions-section">
                    <h3><i class="fas fa-list-ol"></i> Cooking Instructions</h3>
                    <div class="instructions-timeline">
                        ${recipe.instructions.map(step => `
                            <div class="instruction-step">
                                <div class="step-number">${step.step}</div>
                                <div class="step-content">
                                    <p>${step.description}</p>
                                    ${step.time ? `<span class="step-time"><i class="fas fa-clock"></i> ${step.time}</span>` : ''}
                                    ${step.tips && step.tips.length > 0 ? `
                                        <div class="step-tips">
                                            ${step.tips.map(tip => `<span class="tip"><i class="fas fa-lightbulb"></i> ${tip}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Chef Tips -->
                <div class="chef-tips-section">
                    <h3><i class="fas fa-graduation-cap"></i> Professional Chef Tips</h3>
                    <div class="tips-grid">
                        ${recipe.chef_tips.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <p>${tip}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Nutrition -->
                <div class="nutrition-section">
                    <h3><i class="fas fa-chart-bar"></i> Nutrition Facts</h3>
                    <div class="nutrition-grid">
                        ${Object.entries(recipe.nutritional_info).map(([key, value]) => `
                            <div class="nutrition-item">
                                <span class="label">${this.formatNutritionLabel(key)}</span>
                                <span class="value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recipe-footer">
                    <div class="footer-info">
                        <span class="powered-by">${recipe.powered_by}</span>
                        <span class="generated-time">Generated ${new Date(recipe.generated_at).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Simple notification implementation
        alert(`${type.toUpperCase()}: ${message}`);
    }

    showLoadingState() {
        // Simple loading state
        document.getElementById('generateRecipe').disabled = true;
        document.getElementById('generateRecipe').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    }

    hideLoadingState() {
        document.getElementById('generateRecipe').disabled = false;
        document.getElementById('generateRecipe').innerHTML = '<i class="fas fa-magic"></i> Generate Recipe';
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.main-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    showDashboard() {
        this.showSection('dashboard');
    }

    showRecipeGenerator() {
        this.showSection('recipeGenerator');
    }

    getCurrentPreferences() {
        return {
            diet: 'none',
            cuisine: 'fusion',
            difficulty: 'medium'
        };
    }

    getAdvancedOptions() {
        return {};
    }

    getEnhancedFallbackRecipe(input) {
        // Simple fallback recipe
        return {
            name: `Delicious ${input}`,
            description: `A wonderful recipe for ${input} created with care and expertise.`,
            cuisine: "International",
            difficulty: "Medium",
            prep_time: "15 mins",
            cook_time: "30 mins",
            total_time: "45 mins",
            servings: 4,
            calories_per_serving: 400,
            ingredients: [
                { name: "Main ingredient", quantity: "500g", notes: "Fresh and high quality", category: "main" },
                { name: "Vegetables", quantity: "2 cups", notes: "Seasonal varieties", category: "produce" },
                { name: "Spices", quantity: "1 tbsp", notes: "To taste", category: "seasoning" }
            ],
            equipment: ["Knife", "Cutting board", "Pan"],
            instructions: [
                {
                    step: 1,
                    description: `Prepare your ${input} by cleaning and cutting as needed.`,
                    time: "10 mins",
                    tips: ["Work carefully", "Use sharp tools"]
                },
                {
                    step: 2,
                    description: "Cook with love and attention to detail.",
                    time: "20 mins",
                    tips: ["Taste as you go", "Adjust seasoning"]
                }
            ],
            chef_tips: [
                "Use fresh ingredients for best results",
                "Don't rush the cooking process",
                "Taste and adjust seasoning throughout"
            ],
            nutritional_info: {
                calories: 400,
                protein: "25g",
                carbs: "45g",
                fat: "15g"
            },
            flavor_profile: {
                savory: 7,
                sweet: 5,
                spicy: 3
            },
            pairings: {
                wine: ["Nice white wine"],
                beer: ["Refreshing lager"],
                non_alcoholic: ["Sparkling water"]
            },
            recipe_score: 85,
            powered_by: "Celestique AI",
            generated_at: new Date().toISOString(),
            recipe_id: 'fallback_' + Date.now()
        };
    }

    formatNutritionLabel(key) {
        const labels = {
            calories: "Calories",
            protein: "Protein",
            carbs: "Carbohydrates",
            fat: "Fat",
            fiber: "Fiber",
            sugar: "Sugar",
            sodium: "Sodium"
        };
        return labels[key] || key;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new CelestiqueRecipeMaster();
        console.log('Celestique AI Recipe Master initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Celestique AI:', error);
        alert('Application loading failed. Please refresh the page.');
    }
});