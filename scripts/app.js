/**
 * Celestique AI Recipe Master - SIMPLE WORKING VERSION
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
        console.log('Celestique AI initialized');
    }

    setupEventListeners() {
        // Recipe Generation
        const generateBtn = document.getElementById('generateRecipe');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateRecipe());
        }

        // Enter key support
        const recipeInput = document.getElementById('recipeInput');
        if (recipeInput) {
            recipeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.generateRecipe();
                }
            });
        }

        // Navigation
        this.setupNavigation();
    }

    setupNavigation() {
        const navItems = {
            'navDashboard': () => this.showSection('dashboard'),
            'navRecipeGen': () => this.showSection('recipeGenerator'),
            'navMealPlan': () => this.showSection('mealPlanner'),
            'navNutrition': () => this.showSection('nutritionTracker'),
            'navSettings': () => this.showSection('settings')
        };

        Object.entries(navItems).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    async generateRecipe() {
        const input = document.getElementById('recipeInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) {
            this.showNotification('Please describe what you want to cook!', 'warning');
            return;
        }

        this.showLoadingState();

        try {
            console.log('Sending request to API...');
            
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    preferences: this.getCurrentPreferences()
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success && result.data) {
                this.currentRecipe = result.data;
                this.displayRecipe(this.currentRecipe);
                this.showNotification('Recipe generated successfully! 🎉', 'success');
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Failed to generate recipe. Using fallback.', 'error');
            this.currentRecipe = this.getEnhancedFallbackRecipe(message);
            this.displayRecipe(this.currentRecipe);
        } finally {
            this.hideLoadingState();
        }
    }

    displayRecipe(recipe) {
        const container = document.getElementById('recipeResults');
        if (!container) {
            console.error('Recipe results container not found');
            return;
        }

        container.innerHTML = this.createRecipeHTML(recipe);
        this.showSection('recipeResults');
    }

    createRecipeHTML(recipe) {
        return `
            <div class="recipe-master">
                <div class="recipe-header">
                    <h1 class="recipe-title">${this.escapeHtml(recipe.name)}</h1>
                    <p class="recipe-description">${this.escapeHtml(recipe.description)}</p>
                    
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
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>${recipe.recipe_score}%</span>
                        </div>
                    </div>
                </div>

                <div class="ingredients-section">
                    <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                    <div class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <div class="ingredient-item">
                                <span class="quantity">${this.escapeHtml(ing.quantity)}</span>
                                <span class="name">${this.escapeHtml(ing.name)}</span>
                                ${ing.notes ? `<span class="notes">${this.escapeHtml(ing.notes)}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="instructions-section">
                    <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                    <div class="instructions-timeline">
                        ${recipe.instructions.map(step => `
                            <div class="instruction-step">
                                <div class="step-number">${step.step}</div>
                                <div class="step-content">
                                    <p>${this.escapeHtml(step.description)}</p>
                                    ${step.time ? `<div class="step-time"><i class="fas fa-clock"></i> ${step.time}</div>` : ''}
                                    ${step.tips && step.tips.length > 0 ? `
                                        <div class="step-tips">
                                            ${step.tips.map(tip => `<span class="tip"><i class="fas fa-lightbulb"></i> ${this.escapeHtml(tip)}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="chef-tips-section">
                    <h3><i class="fas fa-graduation-cap"></i> Chef Tips</h3>
                    <div class="tips-list">
                        ${recipe.chef_tips.map(tip => `
                            <div class="tip-item">${this.escapeHtml(tip)}</div>
                        `).join('')}
                    </div>
                </div>

                <div class="nutrition-section">
                    <h3><i class="fas fa-chart-bar"></i> Nutrition</h3>
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
                    <div class="powered-by">${this.escapeHtml(recipe.powered_by)}</div>
                    <div class="generated-time">Generated ${new Date(recipe.generated_at).toLocaleString()}</div>
                </div>
            </div>
        `;
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    showLoadingState() {
        const btn = document.getElementById('generateRecipe');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        }
    }

    hideLoadingState() {
        const btn = document.getElementById('generateRecipe');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magic"></i> Generate Recipe';
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification
        console.log(`${type}: ${message}`);
        alert(`${type.toUpperCase()}: ${message}`);
    }

    getCurrentPreferences() {
        return {
            diet: 'none',
            cuisine: 'fusion',
            difficulty: 'medium'
        };
    }

    getEnhancedFallbackRecipe(input) {
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
                { name: "Main ingredient", quantity: "500g", notes: "Fresh and high quality" },
                { name: "Vegetables", quantity: "2 cups", notes: "Seasonal varieties" },
                { name: "Spices", quantity: "1 tbsp", notes: "To taste" }
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
            recipe_score: 85,
            powered_by: "Celestique AI by Sooban Talha Technologies",
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

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new CelestiqueRecipeMaster();
    });
} else {
    window.app = new CelestiqueRecipeMaster();
}