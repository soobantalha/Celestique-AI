// app.js - ULTRA ADVANCED VERSION (Study AI Pattern Based)
/**
 * CELESTIQUE AI RECIPE MASTER - ULTRA ADVANCED
 * @version 5.0.0
 * @author Sooban Talha Technologies
 */

class CelestiqueRecipeMaster {
    constructor() {
        this.currentRecipe = null;
        this.conversationHistory = [];
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAdvancedAnimations();
        console.log('🎯 Celestique AI Ultra Advanced initialized');
    }

    initializeAdvancedAnimations() {
        // Study AI jaise scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
    }

    setupEventListeners() {
        // Study AI jaise advanced event handling
        const generateBtn = document.getElementById('generateRecipe');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateRecipe());
        }

        const recipeInput = document.getElementById('recipeInput');
        if (recipeInput) {
            recipeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.generateRecipe();
                }
            });

            // Study AI jaise auto-resize
            recipeInput.addEventListener('input', () => {
                this.autoResize();
                this.animateInput();
            });
        }

        // Study AI jaise quick suggestions
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.animateButton(e.target);
                const prompt = chip.getAttribute('data-prompt');
                this.messageInput.value = prompt;
                setTimeout(() => this.generateRecipe(), 300);
            });
        });

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
            console.log('🚀 Sending request to Ultra AI...');
            
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    preferences: this.getCurrentPreferences(),
                    context: this.getCookingContext()
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('🎉 Ultra AI Response:', result);
            
            if (result.success && result.data) {
                this.currentRecipe = result.data;
                this.displayUltraRecipe(this.currentRecipe);
                this.showNotification('Ultra Recipe Generated! 🎊', 'success');
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Using advanced fallback recipe.', 'info');
            this.currentRecipe = this.getUltraFallbackRecipe(message);
            this.displayUltraRecipe(this.currentRecipe);
        } finally {
            this.hideLoadingState();
        }
    }

    displayUltraRecipe(recipe) {
        const container = document.getElementById('recipeResults');
        if (!container) {
            console.error('Recipe results container not found');
            return;
        }

        container.innerHTML = this.createUltraRecipeHTML(recipe);
        this.showSection('recipeResults');
        
        // Study AI jaise scroll animations
        setTimeout(() => {
            document.querySelectorAll('.recipe-section').forEach(section => {
                this.observer.observe(section);
            });
        }, 100);
    }

    createUltraRecipeHTML(recipe) {
        return `
            <div class="ultra-recipe-master">
                <!-- Recipe Header -->
                <div class="recipe-section">
                    <div class="ultra-recipe-header">
                        <div class="recipe-meta-badges">
                            <span class="recipe-score">⭐ ${recipe.recipe_ratings?.overall_score || 95}/100</span>
                            <span class="cuisine-badge">${recipe.basic_info?.cuisine_type || 'Gourmet'}</span>
                            <span class="difficulty-badge">${recipe.basic_info?.difficulty_level || 'Medium'}</span>
                        </div>
                        <h1 class="ultra-recipe-title">${this.escapeHtml(recipe.basic_info?.name)}</h1>
                        <p class="ultra-recipe-description">${this.escapeHtml(recipe.basic_info?.description)}</p>
                        
                        <div class="ultra-recipe-stats">
                            <div class="stat">
                                <i class="fas fa-clock"></i>
                                <span>${recipe.basic_info?.total_time_minutes} mins total</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-users"></i>
                                <span>Serves ${recipe.basic_info?.servings}</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-fire-alt"></i>
                                <span>${recipe.basic_info?.calories_per_serving} cal/serving</span>
                            </div>
                            <div class="stat">
                                <i class="fas fa-chef-hat"></i>
                                <span>${recipe.basic_info?.difficulty_level}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Flavor Profile -->
                ${recipe.flavor_profile ? `
                <div class="recipe-section">
                    <div class="flavor-profile-section">
                        <h3><i class="fas fa-palette"></i> Flavor Profile</h3>
                        <div class="flavor-bars">
                            ${Object.entries(recipe.flavor_profile).map(([key, value]) => {
                                if (typeof value === 'number') {
                                    return `
                                        <div class="flavor-bar">
                                            <span class="flavor-name">${this.formatFlavorName(key)}</span>
                                            <div class="bar-container">
                                                <div class="bar-fill" style="width: ${value * 10}%"></div>
                                            </div>
                                            <span class="flavor-value">${value}/10</span>
                                        </div>
                                    `;
                                }
                                return '';
                            }).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Ingredients -->
                <div class="recipe-section">
                    <div class="ingredients-section">
                        <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                        ${recipe.ingredients_section?.ingredient_groups?.map(group => `
                            <div class="ingredient-group">
                                <h4>${this.escapeHtml(group.group_name)}</h4>
                                <div class="ingredients-list">
                                    ${group.ingredients?.map(ing => `
                                        <div class="ingredient-item">
                                            <div class="ingredient-main">
                                                <span class="quantity">${this.escapeHtml(ing.quantity)}</span>
                                                <span class="name">${this.escapeHtml(ing.name)}</span>
                                            </div>
                                            ${ing.preparation ? `<div class="preparation">${this.escapeHtml(ing.preparation)}</div>` : ''}
                                            ${ing.quality_notes ? `<div class="quality-notes">${this.escapeHtml(ing.quality_notes)}</div>` : ''}
                                            ${ing.substitutes?.length ? `
                                                <div class="substitutes">
                                                    <strong>Substitutes:</strong> ${ing.substitutes.join(', ')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Cooking Instructions -->
                <div class="recipe-section">
                    <div class="instructions-section">
                        <h3><i class="fas fa-list-ol"></i> Cooking Instructions</h3>
                        
                        <!-- Preparation Steps -->
                        ${recipe.cooking_instructions?.preparation_steps?.length ? `
                        <div class="preparation-steps">
                            <h4>Preparation</h4>
                            ${recipe.cooking_instructions.preparation_steps.map(step => `
                                <div class="prep-step">
                                    <div class="step-content">
                                        <p>${this.escapeHtml(step.description)}</p>
                                        ${step.time_required ? `<div class="step-time"><i class="fas fa-clock"></i> ${step.time_required}</div>` : ''}
                                        ${step.tips?.length ? `
                                            <div class="step-tips">
                                                ${step.tips.map(tip => `<span class="tip"><i class="fas fa-lightbulb"></i> ${this.escapeHtml(tip)}</span>`).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}

                        <!-- Cooking Steps -->
                        <div class="cooking-steps">
                            <h4>Cooking Process</h4>
                            <div class="steps-timeline">
                                ${recipe.cooking_instructions?.cooking_steps?.map(step => `
                                    <div class="cooking-step">
                                        <div class="step-number">${step.step_number}</div>
                                        <div class="step-content">
                                            <h5>${this.escapeHtml(step.title)}</h5>
                                            <p>${this.escapeHtml(step.description)}</p>
                                            <div class="step-details">
                                                ${step.time_required ? `<span class="detail"><i class="fas fa-clock"></i> ${step.time_required}</span>` : ''}
                                                ${step.temperature ? `<span class="detail"><i class="fas fa-thermometer-half"></i> ${step.temperature}</span>` : ''}
                                            </div>
                                            ${step.techniques?.length ? `
                                                <div class="techniques">
                                                    <strong>Techniques:</strong> ${step.techniques.join(', ')}
                                                </div>
                                            ` : ''}
                                            ${step.pro_tips?.length ? `
                                                <div class="pro-tips">
                                                    ${step.pro_tips.map(tip => `<div class="pro-tip"><i class="fas fa-star"></i> ${this.escapeHtml(tip)}</div>`).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chef Expertise -->
                ${recipe.chef_expertise ? `
                <div class="recipe-section">
                    <div class="chef-expertise-section">
                        <h3><i class="fas fa-graduation-cap"></i> Chef's Expertise</h3>
                        ${recipe.chef_expertise.advanced_techniques ? `
                            <div class="expertise-group">
                                <h4>Advanced Techniques</h4>
                                <div class="techniques-list">
                                    ${recipe.chef_expertise.advanced_techniques.map(tech => `
                                        <span class="technique-tag">${this.escapeHtml(tech)}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${recipe.chef_expertise.professional_tips ? `
                            <div class="expertise-group">
                                <h4>Professional Tips</h4>
                                <div class="tips-list">
                                    ${recipe.chef_expertise.professional_tips.map(tip => `
                                        <div class="pro-tip-item">${this.escapeHtml(tip)}</div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Wine Pairings -->
                ${recipe.wine_pairings ? `
                <div class="recipe-section">
                    <div class="pairings-section">
                        <h3><i class="fas fa-wine-glass-alt"></i> Perfect Pairings</h3>
                        ${recipe.wine_pairings.white_wines?.length ? `
                            <div class="pairing-category">
                                <h4>White Wines</h4>
                                ${recipe.wine_pairings.white_wines.map(wine => `
                                    <div class="pairing-item">
                                        <strong>${this.escapeHtml(wine.type)}</strong>
                                        ${wine.pairing_rationale ? `<span class="pairing-rationale">${this.escapeHtml(wine.pairing_rationale)}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${recipe.wine_pairings.red_wines?.length ? `
                            <div class="pairing-category">
                                <h4>Red Wines</h4>
                                ${recipe.wine_pairings.red_wines.map(wine => `
                                    <div class="pairing-item">
                                        <strong>${this.escapeHtml(wine.type)}</strong>
                                        ${wine.pairing_rationale ? `<span class="pairing-rationale">${this.escapeHtml(wine.pairing_rationale)}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- Recipe Footer -->
                <div class="recipe-section">
                    <div class="ultra-recipe-footer">
                        <div class="powered-by">
                            <i class="fas fa-crown"></i>
                            ${recipe.powered_by || 'Celestique AI Ultra by Sooban Talha Technologies'}
                        </div>
                        <div class="recipe-ids">
                            <span class="recipe-id">ID: ${recipe.recipe_id}</span>
                            <span class="generated-time">Generated: ${new Date(recipe.generated_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Study AI jaise helper methods
    animateInput() {
        const input = document.getElementById('recipeInput');
        input.style.transform = 'scale(1.02)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 150);
    }

    autoResize() {
        const input = document.getElementById('recipeInput');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    showLoadingState() {
        const btn = document.getElementById('generateRecipe');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Crafting Ultra Recipe...';
        }
    }

    hideLoadingState() {
        const btn = document.getElementById('generateRecipe');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-chef-hat"></i> Generate Ultra Recipe';
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.main-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }

    showNotification(message, type = 'info') {
        // Study AI jaise notification system
        console.log(`${type}: ${message}`);
        // Implement toast notification here
    }

    getCurrentPreferences() {
        return {
            diet: 'none',
            cuisine: 'fusion',
            difficulty: 'medium',
            servings: 4
        };
    }

    getCookingContext() {
        return {
            experience_level: 'intermediate',
            kitchen_setup: 'standard',
            time_available: 'moderate'
        };
    }

    getUltraFallbackRecipe(input) {
        // Study AI jaise detailed fallback
        return {
            recipe_metadata: {
                recipe_id: 'fallback_' + Date.now(),
                version: "5.0.0",
                culinary_style: "Professional Gastronomy",
                fallback_generated: true
            },
            basic_info: {
                name: `Exquisite ${input} | Chef's Masterpiece`,
                description: `An extraordinary culinary creation featuring ${input}, crafted with precision techniques.`,
                cuisine_type: "Contemporary Fusion",
                difficulty_level: "Medium",
                prep_time_minutes: 25,
                cook_time_minutes: 35,
                total_time_minutes: 60,
                servings: 4,
                calories_per_serving: 480
            },
            ingredients_section: {
                ingredient_groups: [
                    {
                        group_name: "Main Components",
                        ingredients: [
                            {
                                name: "Premium Ingredient",
                                quantity: "500g",
                                preparation: "Properly prepared",
                                quality_notes: "Use high-quality ingredients"
                            }
                        ]
                    }
                ]
            },
            cooking_instructions: {
                cooking_steps: [
                    {
                        step_number: 1,
                        title: "Flavor Foundation",
                        description: `Build the foundational flavors for ${input} with careful technique.`,
                        time_required: "10 mins",
                        pro_tips: ["Use quality ingredients", "Control temperature precisely"]
                    }
                ]
            },
            chef_expertise: {
                professional_tips: [
                    "Always taste as you cook",
                    "Use fresh herbs for maximum flavor",
                    "Let meat rest before serving"
                ]
            },
            powered_by: "Celestique AI Ultra by Sooban Talha Technologies",
            generated_at: new Date().toISOString()
        };
    }

    formatFlavorName(key) {
        const names = {
            flavor_intensity: "Intensity",
            complexity_rating: "Complexity", 
            balance_rating: "Balance",
            umami_level: "Umami",
            sweetness: "Sweetness",
            saltiness: "Saltiness",
            sourness: "Sourness",
            bitterness: "Bitterness",
            spiciness: "Spiciness"
        };
        return names[key] || key;
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

// Study AI jaise initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.celestiqueAI = new CelestiqueRecipeMaster();
    });
} else {
    window.celestiqueAI = new CelestiqueRecipeMaster();
}