/**
 * Celestique AI Recipe Master - Ultra Advanced Frontend Application
 * Comprehensive recipe management system with advanced features and professional UI
 * @version 3.0.0
 * @author Sooban Talha Technologies
 */

class CelestiqueRecipeMaster {
    constructor() {
        this.features = {
            VOICE_INPUT: true,
            IMAGE_RECOGNITION: true,
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
            ACHIEVEMENTS: true,
            MEAL_PREP: true,
            NUTRITION_ANALYSIS: true,
            ALLERGY_ALERTS: true,
            EQUIPMENT_CHECK: true,
            RECIPE_RATING: true,
            COOKING_HISTORY: true,
            INGREDIENT_TRACKING: true,
            MACRO_TRACKING: true
        };
        
        this.currentRecipe = null;
        this.userPreferences = this.loadPreferences();
        this.cookingTimer = null;
        this.voiceRecognition = null;
        this.speechSynthesis = null;
        this.ingredientDatabase = this.loadIngredientDatabase();
        this.conversionRates = this.loadConversionRates();
        this.achievements = this.loadAchievements();
        this.cookingHistory = this.loadCookingHistory();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.setupSpeechSynthesis();
        this.loadUserData();
        this.showDashboard();
        this.startCookingStreak();
        this.setupServiceWorker();
        this.initializeOfflineStorage();
        this.setupAnalytics();
    }

    setupEventListeners() {
        // Enhanced Navigation
        this.setupNavigation();

        // Recipe Generation
        document.getElementById('generateRecipe').addEventListener('click', () => this.generateRecipe());
        document.getElementById('voiceInputBtn').addEventListener('click', () => this.toggleVoiceInput());
        document.getElementById('uploadImageBtn').addEventListener('click', () => this.handleImageUpload());
        document.getElementById('quickIdeasBtn').addEventListener('click', () => this.showQuickIdeas());
        document.getElementById('advancedOptionsBtn').addEventListener('click', () => this.showAdvancedOptions());

        // Cooking Tools
        document.getElementById('startTimerBtn').addEventListener('click', () => this.startCookingTimer());
        document.getElementById('scaleRecipeBtn').addEventListener('click', () => this.scaleRecipe());
        document.getElementById('convertUnitsBtn').addEventListener('click', () => this.showUnitConverter());
        document.getElementById('shoppingListBtn').addEventListener('click', () => this.generateShoppingList());
        document.getElementById('nutritionAnalysisBtn').addEventListener('click', () => this.showNutritionAnalysis());

        // Social Features
        document.getElementById('saveRecipeBtn').addEventListener('click', () => this.saveRecipe());
        document.getElementById('shareRecipeBtn').addEventListener('click', () => this.shareRecipe());
        document.getElementById('printRecipeBtn').addEventListener('click', () => this.printRecipe());
        document.getElementById('rateRecipeBtn').addEventListener('click', () => this.rateRecipe());

        // Input handling with debouncing
        this.setupInputHandling();

        // Quick filters with advanced options
        this.setupFilters();

        // Initialize all tooltips and interactive elements
        this.initTooltips();
        this.initInteractiveElements();
    }

    setupNavigation() {
        const navItems = {
            'navDashboard': () => this.showDashboard(),
            'navRecipeGen': () => this.showRecipeGenerator(),
            'navMealPlan': () => this.showMealPlanner(),
            'navNutrition': () => this.showNutritionTracker(),
            'navSettings': () => this.showSettings(),
            'navHistory': () => this.showCookingHistory(),
            'navAchievements': () => this.showAchievements(),
            'navInventory': () => this.showKitchenInventory()
        };

        Object.entries(navItems).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        });
    }

    setupInputHandling() {
        const recipeInput = document.getElementById('recipeInput');
        if (recipeInput) {
            // Enter key handling
            recipeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.generateRecipe();
                }
            });

            // Input suggestions
            recipeInput.addEventListener('input', this.debounce(() => {
                this.showInputSuggestions(recipeInput.value);
            }, 300));

            // Paste handling for image data
            recipeInput.addEventListener('paste', (e) => {
                this.handlePasteEvent(e);
            });
        }
    }

    setupFilters() {
        document.querySelectorAll('.diet-filter').forEach(filter => {
            filter.addEventListener('click', (e) => this.applyDietFilter(e.target.dataset.diet));
        });

        document.querySelectorAll('.cuisine-filter').forEach(filter => {
            filter.addEventListener('click', (e) => this.applyCuisineFilter(e.target.dataset.cuisine));
        });

        document.querySelectorAll('.time-filter').forEach(filter => {
            filter.addEventListener('click', (e) => this.applyTimeFilter(e.target.dataset.time));
        });
    }

    async generateRecipe() {
        const input = document.getElementById('recipeInput').value.trim();
        if (!input) {
            this.showNotification('Please describe what you want to cook!', 'warning');
            return;
        }

        this.showLoadingState();
        const preferences = this.getCurrentPreferences();
        const advancedOptions = this.getAdvancedOptions();

        try {
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Version': '3.0.0'
                },
                body: JSON.stringify({
                    message: input,
                    preferences: preferences,
                    context: advancedOptions
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.currentRecipe = result.data;
                this.displayRecipe(this.currentRecipe);
                this.trackRecipeGeneration();
                this.showNotification('Recipe generated successfully! 🎉', 'success');
                this.updateCookingHistory('generated', this.currentRecipe);
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            this.showNotification('Failed to generate recipe. Using enhanced fallback.', 'error');
            this.currentRecipe = this.getEnhancedFallbackRecipe(input);
            this.displayRecipe(this.currentRecipe);
            this.trackError('recipe_generation', error);
        } finally {
            this.hideLoadingState();
        }
    }

    displayRecipe(recipe) {
        const container = document.getElementById('recipeContainer');
        if (!container) return;

        container.innerHTML = this.createAdvancedRecipeHTML(recipe);
        this.attachRecipeInteractions();
        this.animateRecipeDisplay();
        this.showSection('recipeResults');
        
        // Update nutrition tracking
        this.updateNutritionTracking(recipe);
        
        // Check kitchen equipment
        this.checkKitchenEquipment(recipe.equipment);
        
        // Analyze allergies
        this.checkAllergies(recipe.ingredients);
    }

    createAdvancedRecipeHTML(recipe) {
        return `
            <div class="recipe-master" data-recipe-id="${recipe.recipe_id}">
                <!-- Enhanced Recipe Header -->
                <div class="recipe-header">
                    <div class="recipe-meta">
                        <span class="recipe-score">${recipe.recipe_score}%</span>
                        <span class="cuisine-badge">${recipe.cuisine}</span>
                        <span class="difficulty-badge">${recipe.difficulty}</span>
                        <span class="season-badge">${recipe.seasonality || 'All-Season'}</span>
                        <span class="cost-badge">$${recipe.cost_estimate || '15-25'}</span>
                    </div>
                    
                    <h1 class="recipe-title">${recipe.name}</h1>
                    <p class="recipe-description">${recipe.description}</p>
                    
                    <!-- Enhanced Quick Stats -->
                    <div class="recipe-stats">
                        <div class="stat" data-tooltip="Active preparation time">
                            <i class="fas fa-user-chef"></i>
                            <span>${recipe.prep_time}</span>
                        </div>
                        <div class="stat" data-tooltip="Cooking time">
                            <i class="fas fa-fire"></i>
                            <span>${recipe.cook_time}</span>
                        </div>
                        <div class="stat" data-tooltip="Total time including prep">
                            <i class="fas fa-clock"></i>
                            <span>${recipe.total_time}</span>
                        </div>
                        <div class="stat" data-tooltip="Number of servings">
                            <i class="fas fa-users"></i>
                            <span>Serves ${recipe.servings}</span>
                        </div>
                        <div class="stat" data-tooltip="Calories per serving">
                            <i class="fas fa-fire-alt"></i>
                            <span>${recipe.calories_per_serving} cal</span>
                        </div>
                        <div class="stat" data-tooltip="Sustainability score">
                            <i class="fas fa-leaf"></i>
                            <span>${recipe.sustainability_score || 75}/100</span>
                        </div>
                    </div>

                    <!-- Quick Action Buttons -->
                    <div class="header-actions">
                        <button class="btn-action" onclick="app.startCookingMode()">
                            <i class="fas fa-play"></i> Start Cooking
                        </button>
                        <button class="btn-action" onclick="app.saveRecipe()">
                            <i class="fas fa-bookmark"></i> Save
                        </button>
                        <button class="btn-action" onclick="app.shareRecipe()">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>

                <!-- Enhanced Flavor Profile -->
                <div class="flavor-profile">
                    <h3><i class="fas fa-chart-pie"></i> Flavor Profile Analysis</h3>
                    <div class="flavor-bars">
                        ${this.createEnhancedFlavorBars(recipe.flavor_profile)}
                    </div>
                    <div class="flavor-insights">
                        ${this.generateFlavorInsights(recipe.flavor_profile)}
                    </div>
                </div>

                <!-- Ingredients & Equipment with Enhanced Features -->
                <div class="ingredients-equipment">
                    <div class="ingredients-section">
                        <div class="section-header">
                            <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                            <div class="section-actions">
                                <button class="btn-icon" onclick="app.checkInventory()" title="Check Kitchen Inventory">
                                    <i class="fas fa-clipboard-check"></i>
                                </button>
                                <button class="btn-icon" onclick="app.exportIngredients()" title="Export Ingredients">
                                    <i class="fas fa-file-export"></i>
                                </button>
                            </div>
                        </div>
                        <div class="ingredients-list">
                            ${recipe.ingredients.map((ing, index) => `
                                <div class="ingredient-item" data-ingredient="${ing.name}" data-category="${ing.category}">
                                    <div class="ingredient-checkbox">
                                        <input type="checkbox" id="ing-${index}" onchange="app.trackIngredient('${ing.name}')">
                                        <label for="ing-${index}"></label>
                                    </div>
                                    <span class="quantity">${ing.quantity}</span>
                                    <span class="name">${ing.name}</span>
                                    ${ing.notes ? `<span class="notes">${ing.notes}</span>` : ''}
                                    <div class="ingredient-actions">
                                        <button class="btn-icon substitute-btn" onclick="app.showSubstitutions('${ing.name}')" title="Find Substitutes">
                                            <i class="fas fa-exchange-alt"></i>
                                        </button>
                                        <button class="btn-icon info-btn" onclick="app.showIngredientInfo('${ing.name}')" title="Ingredient Info">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="equipment-section">
                        <div class="section-header">
                            <h3><i class="fas fa-utensils"></i> Equipment Needed</h3>
                            <button class="btn-icon" onclick="app.checkEquipmentAvailability()" title="Check Available Equipment">
                                <i class="fas fa-toolbox"></i>
                            </button>
                        </div>
                        <div class="equipment-list">
                            ${recipe.equipment.map(item => `
                                <div class="equipment-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>${item}</span>
                                    <button class="btn-icon" onclick="app.showEquipmentGuide('${item}')" title="Usage Guide">
                                        <i class="fas fa-question-circle"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Enhanced Cooking Instructions -->
                <div class="instructions-section">
                    <div class="section-header">
                        <h3><i class="fas fa-list-ol"></i> Cooking Instructions</h3>
                        <div class="cooking-controls">
                            <button class="btn-secondary" onclick="app.startCookingMode()">
                                <i class="fas fa-play"></i> Start Cooking Mode
                            </button>
                            <button class="btn-secondary" onclick="app.readInstructionsAloud()">
                                <i class="fas fa-volume-up"></i> Read Aloud
                            </button>
                        </div>
                    </div>
                    <div class="instructions-timeline">
                        ${recipe.instructions.map(step => `
                            <div class="instruction-step" data-step="${step.step}">
                                <div class="step-number">${step.step}</div>
                                <div class="step-content">
                                    <p>${step.description}</p>
                                    ${step.time ? `<span class="step-time"><i class="fas fa-clock"></i> ${step.time}</span>` : ''}
                                    ${step.temperature ? `<span class="step-temp"><i class="fas fa-thermometer-half"></i> ${step.temperature}</span>` : ''}
                                    ${step.tips && step.tips.length > 0 ? `
                                        <div class="step-tips">
                                            ${step.tips.map(tip => `<span class="tip"><i class="fas fa-lightbulb"></i> ${tip}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                    ${step.visual_cues && step.visual_cues.length > 0 ? `
                                        <div class="visual-cues">
                                            <strong>Look for:</strong>
                                            ${step.visual_cues.map(cue => `<span class="visual-cue">${cue}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="step-actions">
                                    <button class="timer-btn" onclick="app.startStepTimer('${step.time}', ${step.step})">
                                        <i class="fas fa-hourglass-start"></i>
                                    </button>
                                    <button class="btn-icon" onclick="app.markStepComplete(${step.step})">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Enhanced Chef Tips -->
                <div class="chef-tips-section">
                    <h3><i class="fas fa-graduation-cap"></i> Professional Chef Techniques</h3>
                    <div class="tips-grid">
                        ${recipe.chef_tips.map((tip, index) => `
                            <div class="tip-card" data-tip-index="${index}">
                                <div class="tip-icon">
                                    <i class="fas fa-star"></i>
                                </div>
                                <div class="tip-content">
                                    <p>${tip}</p>
                                    <button class="btn-text" onclick="app.saveChefTip(${index})">
                                        <i class="fas fa-save"></i> Save Tip
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Enhanced Pairings & Nutrition -->
                <div class="pairing-nutrition">
                    <div class="pairings">
                        <h4><i class="fas fa-wine-glass-alt"></i> Perfect Pairings</h4>
                        <div class="pairing-categories">
                            <div class="pairing-category">
                                <h5>Wine</h5>
                                <div class="pairing-items">
                                    ${recipe.pairings.wine.map(pairing => `
                                        <span class="pairing-item">${pairing}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="pairing-category">
                                <h5>Beer</h5>
                                <div class="pairing-items">
                                    ${recipe.pairings.beer.map(pairing => `
                                        <span class="pairing-item">${pairing}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="pairing-category">
                                <h5>Non-Alcoholic</h5>
                                <div class="pairing-items">
                                    ${recipe.pairings.non_alcoholic.map(pairing => `
                                        <span class="pairing-item">${pairing}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="nutrition-facts">
                        <h4><i class="fas fa-chart-bar"></i> Nutrition Facts</h4>
                        <div class="nutrition-grid">
                            ${Object.entries(recipe.nutritional_info).map(([key, value]) => `
                                <div class="nutrition-item">
                                    <span class="label">${this.formatNutritionLabel(key)}</span>
                                    <span class="value">${value}</span>
                                    <div class="nutrition-bar" style="width: ${this.calculateNutritionBarWidth(key, value)}%"></div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="macronutrient-breakdown">
                            <h5>Macronutrient Ratio</h5>
                            <div class="macro-chart">
                                ${this.createMacroChart(recipe.nutritional_info)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Recipe Information -->
                <div class="recipe-info-grid">
                    <div class="info-card">
                        <h4><i class="fas fa-utensil-spoon"></i> Special Techniques</h4>
                        <div class="techniques-list">
                            ${recipe.special_techniques.map(tech => `
                                <span class="technique-tag">${tech}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h4><i class="fas fa-palette"></i> Presentation</h4>
                        <div class="presentation-tips">
                            ${recipe.presentation_tips.map(tip => `
                                <p>${tip}</p>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h4><i class="fas fa-box"></i> Storage & Leftovers</h4>
                        <p>${recipe.storage_instructions}</p>
                    </div>
                </div>

                <!-- Enhanced Action Buttons -->
                <div class="recipe-actions">
                    <button class="btn-primary" onclick="app.generateShoppingList()">
                        <i class="fas fa-shopping-cart"></i> Generate Shopping List
                    </button>
                    <button class="btn-secondary" onclick="app.saveRecipe()">
                        <i class="fas fa-bookmark"></i> Save to Collection
                    </button>
                    <button class="btn-secondary" onclick="app.shareRecipe()">
                        <i class="fas fa-share-alt"></i> Share Recipe
                    </button>
                    <button class="btn-secondary" onclick="app.scaleRecipe()">
                        <i class="fas fa-calculator"></i> Scale Recipe
                    </button>
                    <button class="btn-secondary" onclick="app.printRecipe()">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button class="btn-secondary" onclick="app.rateRecipe()">
                        <i class="fas fa-star"></i> Rate
                    </button>
                </div>

                <div class="recipe-footer">
                    <div class="footer-info">
                        <span class="powered-by">${recipe.powered_by}</span>
                        <span class="culinary-style">${recipe.culinary_style} • ${recipe.seasonality}</span>
                        <span class="generated-time">Generated ${new Date(recipe.generated_at).toLocaleString()}</span>
                    </div>
                    <div class="recipe-ids">
                        <span class="recipe-id">ID: ${recipe.recipe_id}</span>
                        <span class="api-version">v${recipe.version}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createEnhancedFlavorBars(profile) {
        return Object.entries(profile).map(([flavor, value]) => `
            <div class="flavor-bar">
                <span class="flavor-name">
                    <i class="fas fa-${this.getFlavorIcon(flavor)}"></i>
                    ${this.formatFlavorName(flavor)}
                </span>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${value * 10}%" data-value="${value}"></div>
                </div>
                <span class="flavor-value">${value}/10</span>
            </div>
        `).join('');
    }

    // Advanced Features Implementation
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';
            this.voiceRecognition.maxAlternatives = 1;
            
            this.voiceRecognition.onstart = () => {
                this.showNotification('Listening... Speak your recipe request', 'info');
                this.showVoiceInputIndicator();
            };
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('recipeInput').value = transcript;
                this.hideVoiceInputIndicator();
                this.showNotification('Voice input captured!', 'success');
            };
            
            this.voiceRecognition.onerror = (event) => {
                this.hideVoiceInputIndicator();
                this.showNotification('Voice recognition failed: ' + event.error, 'error');
            };
            
            this.voiceRecognition.onend = () => {
                this.hideVoiceInputIndicator();
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }

    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
        }
    }

    toggleVoiceInput() {
        if (this.voiceRecognition) {
            try {
                this.voiceRecognition.start();
            } catch (error) {
                this.showNotification('Voice recognition not available', 'warning');
            }
        } else {
            this.showNotification('Voice recognition not supported in your browser', 'warning');
        }
    }

    readInstructionsAloud() {
        if (!this.speechSynthesis || !this.currentRecipe) return;
        
        const instructions = this.currentRecipe.instructions
            .map(step => `Step ${step.step}: ${step.description}`)
            .join('. ');
        
        const utterance = new SpeechSynthesisUtterance(instructions);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        this.speechSynthesis.speak(utterance);
        this.showNotification('Reading instructions aloud...', 'info');
    }

    startCookingMode() {
        if (!this.currentRecipe) return;
        
        this.showModal('Cooking Mode', `
            <div class="cooking-mode">
                <h3>🏁 Ready to Start Cooking?</h3>
                <div class="cooking-prep">
                    <h4>Preparation Checklist:</h4>
                    <div class="prep-list">
                        <label><input type="checkbox"> Read through all instructions</label>
                        <label><input type="checkbox"> Gather all ingredients</label>
                        <label><input type="checkbox"> Prepare equipment</label>
                        <label><input type="checkbox"> Preheat oven if needed</label>
                        <label><input type="checkbox"> Clear workspace</label>
                    </div>
                </div>
                <div class="cooking-controls">
                    <button class="btn-primary" onclick="app.startCookingSession()">
                        <i class="fas fa-play"></i> Start Cooking Session
                    </button>
                    <button class="btn-secondary" onclick="app.closeModal()">
                        <i class="fas fa-times"></i> Not Ready Yet
                    </button>
                </div>
            </div>
        `);
    }

    startCookingSession() {
        this.closeModal();
        this.showNotification('Cooking session started! Timer is running.', 'success');
        
        // Start overall timer
        const totalTime = this.parseTimeToMinutes(this.currentRecipe.total_time);
        this.createTimerModal(totalTime, 'Total Cooking Time');
        
        // Track cooking session
        this.trackCookingSession('started');
    }

    startCookingTimer() {
        if (this.currentRecipe) {
            const totalMinutes = this.parseTimeToMinutes(this.currentRecipe.total_time);
            this.createAdvancedTimerModal(totalMinutes, 'Total Cooking Time');
        }
    }

    startStepTimer(timeString, stepNumber) {
        const minutes = this.parseTimeToMinutes(timeString);
        this.createAdvancedTimerModal(minutes, `Step ${stepNumber}: ${timeString}`);
    }

    createAdvancedTimerModal(minutes, title = 'Cooking Timer') {
        const modalId = 'advanced-timer-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        
        let seconds = minutes * 60;
        modal.innerHTML = `
            <div class="modal-content timer-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="app.closeTimerModal()">×</button>
                </div>
                <div class="timer-display">
                    <div class="time-circle">
                        <svg class="progress-ring" width="200" height="200">
                            <circle class="progress-ring-background" stroke="#333" stroke-width="8" fill="transparent" r="90" cx="100" cy="100"/>
                            <circle class="progress-ring-circle" stroke="#ffd700" stroke-width="8" fill="transparent" r="90" cx="100" cy="100" stroke-dasharray="565.48" stroke-dashoffset="0"/>
                        </svg>
                        <div class="time-text">${this.formatTime(seconds)}</div>
                    </div>
                </div>
                <div class="timer-controls">
                    <button class="btn-primary" onclick="app.startTimer(${seconds}, '${modalId}')">
                        <i class="fas fa-play"></i> Start
                    </button>
                    <button class="btn-secondary" onclick="app.pauseTimer('${modalId}')">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button class="btn-secondary" onclick="app.resetTimer(${seconds}, '${modalId}')">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                    <button class="btn-danger" onclick="app.stopTimer('${modalId}')">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>
                <div class="timer-actions">
                    <button class="btn-text" onclick="app.addTime(60, '${modalId}')">+1 min</button>
                    <button class="btn-text" onclick="app.addTime(300, '${modalId}')">+5 min</button>
                    <button class="btn-text" onclick="app.subtractTime(60, '${modalId}')">-1 min</button>
                </div>
            </div>
        `;
        
        this.updateTimerDisplay(modalId, seconds);
    }

    startTimer(seconds, modalId) {
        if (this.cookingTimer) {
            clearInterval(this.cookingTimer);
        }
        
        let remaining = seconds;
        const startTime = Date.now();
        const totalTime = seconds;
        
        this.cookingTimer = setInterval(() => {
            remaining = Math.max(0, totalTime - Math.floor((Date.now() - startTime) / 1000));
            this.updateTimerDisplay(modalId, remaining);
            
            if (remaining <= 0) {
                this.stopTimer(modalId);
                this.showNotification('Timer finished! 🎉', 'success');
                this.playTimerSound();
                this.trackAchievement('timer_completed');
            }
        }, 1000);
        
        this.showNotification('Timer started!', 'info');
    }

    updateTimerDisplay(modalId, seconds) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const timeText = modal.querySelector('.time-text');
        const progressCircle = modal.querySelector('.progress-ring-circle');
        
        if (timeText) {
            timeText.textContent = this.formatTime(seconds);
        }
        
        if (progressCircle) {
            const totalSeconds = this.getTotalTimerSeconds(modalId);
            if (totalSeconds > 0) {
                const progress = (totalSeconds - seconds) / totalSeconds;
                const circumference = 565.48;
                const offset = circumference - (progress * circumference);
                progressCircle.style.strokeDashoffset = offset;
            }
        }
    }

    generateAdvancedShoppingList() {
        if (!this.currentRecipe) return;
        
        const ingredients = this.currentRecipe.ingredients;
        const categorized = this.categorizeIngredients(ingredients);
        
        let shoppingList = 'CELESTIQUE AI SHOPPING LIST\n';
        shoppingList += '='.repeat(40) + '\n\n';
        
        Object.entries(categorized).forEach(([category, items]) => {
            shoppingList += `${category.toUpperCase()}:\n`;
            shoppingList += items.map(item => 
                `☐ ${item.quantity} ${item.name} ${item.notes ? `(${item.notes})` : ''}`
            ).join('\n');
            shoppingList += '\n\n';
        });
        
        shoppingList += `Recipe: ${this.currentRecipe.name}\n`;
        shoppingList += `Servings: ${this.currentRecipe.servings}\n`;
        shoppingList += `Generated: ${new Date().toLocaleDateString()}\n`;
        
        this.showModal('Advanced Shopping List', `
            <div class="shopping-list-advanced">
                <div class="shopping-header">
                    <h3>🛒 Shopping List</h3>
                    <div class="shopping-actions">
                        <button class="btn-icon" onclick="app.printText('${shoppingList.replace(/\n/g, '\\n')}')">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-icon" onclick="app.copyToClipboard('${shoppingList.replace(/\n/g, '\\n')}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon" onclick="app.saveShoppingList()">
                            <i class="fas fa-save"></i>
                        </button>
                    </div>
                </div>
                <div class="shopping-categories">
                    ${Object.entries(categorized).map(([category, items]) => `
                        <div class="shopping-category">
                            <h4>${this.formatCategoryName(category)}</h4>
                            <div class="category-items">
                                ${items.map(item => `
                                    <div class="shopping-item">
                                        <input type="checkbox" id="shop-${item.name.replace(/\s+/g, '-')}">
                                        <label for="shop-${item.name.replace(/\s+/g, '-')}">
                                            <span class="quantity">${item.quantity}</span>
                                            <span class="name">${item.name}</span>
                                            ${item.notes ? `<span class="notes">${item.notes}</span>` : ''}
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="shopping-stats">
                    <div class="stat">Total Items: ${ingredients.length}</div>
                    <div class="stat">Categories: ${Object.keys(categorized).length}</div>
                </div>
            </div>
        `);
    }

    // Enhanced scaling with intelligent quantity parsing
    scaleRecipe() {
        if (!this.currentRecipe) return;
        
        this.showModal('Advanced Recipe Scaling', `
            <div class="scale-recipe-advanced">
                <h3>⚖️ Scale Recipe</h3>
                <div class="scale-controls">
                    <div class="scale-input-group">
                        <label>Current Servings: ${this.currentRecipe.servings}</label>
                        <input type="range" id="scaleSlider" min="1" max="20" value="${this.currentRecipe.servings}" 
                               oninput="app.updateScaleValue(this.value)">
                        <input type="number" id="scaleInput" value="${this.currentRecipe.servings}" min="1" max="20"
                               onchange="app.updateScaleSlider(this.value)">
                    </div>
                    <div class="scale-factor">
                        Scale Factor: <span id="scaleFactor">1</span>x
                    </div>
                </div>
                <div class="scaled-ingredients" id="scaledIngredients">
                    ${this.calculateScaledIngredients(this.currentRecipe.servings)}
                </div>
                <div class="scale-actions">
                    <button class="btn-primary" onclick="app.applyRecipeScale()">
                        <i class="fas fa-check"></i> Apply Scaling
                    </button>
                    <button class="btn-secondary" onclick="app.closeModal()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `);
    }

    calculateScaledIngredients(newServings) {
        const scaleFactor = newServings / this.currentRecipe.servings;
        
        return this.currentRecipe.ingredients.map(ingredient => {
            const scaled = this.scaleIngredientAdvanced(ingredient, scaleFactor);
            return `
                <div class="scaled-ingredient">
                    <span class="original-quantity">${ingredient.quantity}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="scaled-quantity">${scaled.quantity}</span>
                    <span class="ingredient-name">${ingredient.name}</span>
                    ${scaled.note ? `<span class="scale-note">${scaled.note}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    scaleIngredientAdvanced(ingredient, scaleFactor) {
        const quantity = ingredient.quantity;
        const scaled = this.parseAndScaleQuantityAdvanced(quantity, scaleFactor);
        
        return {
            quantity: scaled.quantity,
            note: scaled.note,
            original: quantity
        };
    }

    // Utility Methods
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
        
        // Add enter/exit animations
        notification.style.animation = 'slideInRight 0.3s ease';
    }

    showModal(title, content, options = {}) {
        const modalId = options.id || 'advanced-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-content ${options.size || 'medium'}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="app.closeModal('${modalId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.footer ? `
                    <div class="modal-footer">
                        ${options.footer}
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Add keyboard event listener for ESC key
        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalId);
                document.removeEventListener('keydown', keyHandler);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }

    closeModal(modalId = 'advanced-modal') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
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
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const correspondingNav = document.querySelector(`[data-section="${sectionId}"]`);
        if (correspondingNav) {
            correspondingNav.classList.add('active');
        }
        
        // Track section view
        this.trackSectionView(sectionId);
    }

    // Data Management with Advanced Features
    saveRecipe() {
        if (!this.currentRecipe) return;
        
        const savedRecipes = JSON.parse(localStorage.getItem('celestique_saved_recipes') || '[]');
        
        // Check if recipe already exists
        const existingIndex = savedRecipes.findIndex(recipe => 
            recipe.recipe_id === this.currentRecipe.recipe_id
        );
        
        if (existingIndex !== -1) {
            savedRecipes[existingIndex] = {
                ...this.currentRecipe,
                saved_at: new Date().toISOString(),
                last_accessed: new Date().toISOString()
            };
        } else {
            savedRecipes.push({
                ...this.currentRecipe,
                saved_at: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                personal_rating: null,
                personal_notes: '',
                cooked_count: 0
            });
        }
        
        localStorage.setItem('celestique_saved_recipes', JSON.stringify(savedRecipes));
        this.showNotification('Recipe saved to your collection! 📚', 'success');
        this.trackAchievement('recipe_saved');
    }

    loadPreferences() {
        const defaults = {
            diet: 'none',
            cuisine: 'fusion',
            difficulty: 'medium',
            time: 'moderate',
            allergies: 'none',
            equipment: 'basic',
            spice: 'medium',
            units: 'metric',
            notifications: true,
            voice_guided: false,
            auto_save: true,
            theme: 'dark'
        };
        
        const saved = JSON.parse(localStorage.getItem('celestique_preferences') || '{}');
        return { ...defaults, ...saved };
    }

    savePreferences() {
        localStorage.setItem('celestique_preferences', JSON.stringify(this.userPreferences));
        this.showNotification('Preferences saved!', 'success');
    }

    // Advanced Analytics and Tracking
    trackRecipeGeneration() {
        const stats = JSON.parse(localStorage.getItem('celestique_stats') || '{"generated": 0, "last_generated": ""}');
        stats.generated++;
        stats.last_generated = new Date().toISOString();
        stats.total_cooking_time = (stats.total_cooking_time || 0) + this.parseTimeToMinutes(this.currentRecipe.total_time);
        localStorage.setItem('celestique_stats', JSON.stringify(stats));
        
        this.updateAchievements();
        this.updateCookingStreak();
    }

    startCookingStreak() {
        const today = new Date().toDateString();
        const lastCooked = localStorage.getItem('celestique_last_cooked');
        
        if (lastCooked !== today) {
            const streak = parseInt(localStorage.getItem('celestique_cooking_streak') || '0');
            const newStreak = lastCooked && this.isConsecutiveDay(lastCooked, today) ? streak + 1 : 1;
            
            localStorage.setItem('celestique_cooking_streak', newStreak.toString());
            localStorage.setItem('celestique_last_cooked', today);
            
            if (newStreak > streak) {
                this.checkStreakAchievements(newStreak);
            }
        }
    }

    updateAchievements() {
        const stats = JSON.parse(localStorage.getItem('celestique_stats') || '{"generated": 0}');
        const currentAchievements = JSON.parse(localStorage.getItem('celestique_achievements') || '[]');
        const newAchievements = [];
        
        // Recipe count achievements
        if (stats.generated >= 5 && !currentAchievements.includes('Recipe Explorer')) {
            newAchievements.push('Recipe Explorer');
        }
        if (stats.generated >= 25 && !currentAchievements.includes('Seasoned Cook')) {
            newAchievements.push('Seasoned Cook');
        }
        if (stats.generated >= 50 && !currentAchievements.includes('Master Chef')) {
            newAchievements.push('Master Chef');
        }
        if (stats.generated >= 100 && !currentAchievements.includes('Recipe Guru')) {
            newAchievements.push('Recipe Guru');
        }
        
        // Cooking time achievements
        const totalHours = (stats.total_cooking_time || 0) / 60;
        if (totalHours >= 10 && !currentAchievements.includes('Kitchen Novice')) {
            newAchievements.push('Kitchen Novice');
        }
        if (totalHours >= 50 && !currentAchievements.includes('Cooking Enthusiast')) {
            newAchievements.push('Cooking Enthusiast');
        }
        if (totalHours >= 100 && !currentAchievements.includes('Culinary Expert')) {
            newAchievements.push('Culinary Expert');
        }
        
        if (newAchievements.length > 0) {
            const allAchievements = [...currentAchievements, ...newAchievements];
            localStorage.setItem('celestique_achievements', JSON.stringify(allAchievements));
            
            newAchievements.forEach(achievement => {
                this.showNotification(`Achievement Unlocked: ${achievement}! 🏆`, 'success', 7000);
            });
        }
    }

    // Helper Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    parseTimeToMinutes(timeString) {
        if (!timeString) return 0;
        
        const matches = timeString.match(/(\d+)\s*(min|mins|minute|minutes|h|hr|hrs|hour|hours)/g);
        if (!matches) return 30; // Default fallback
        
        let totalMinutes = 0;
        
        matches.forEach(match => {
            const value = parseInt(match);
            if (match.includes('h') || match.includes('hr')) {
                totalMinutes += value * 60;
            } else {
                totalMinutes += value;
            }
        });
        
        return totalMinutes || 30;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getFlavorIcon(flavor) {
        const icons = {
            savory: 'utensils',
            sweet: 'candy-cane',
            spicy: 'fire',
            umami: 'star',
            bitter: 'leaf',
            sour: 'lemon',
            richness: 'tint'
        };
        return icons[flavor] || 'circle';
    }

    // Placeholder methods for extended functionality
    showDashboard() { /* Implementation */ }
    showRecipeGenerator() { /* Implementation */ }
    showMealPlanner() { /* Implementation */ }
    showNutritionTracker() { /* Implementation */ }
    showSettings() { /* Implementation */ }
    showCookingHistory() { /* Implementation */ }
    showAchievements() { /* Implementation */ }
    showKitchenInventory() { /* Implementation */ }
    
    handleImageUpload() { /* Implementation */ }
    showQuickIdeas() { /* Implementation */ }
    showAdvancedOptions() { /* Implementation */ }
    showNutritionAnalysis() { /* Implementation */ }
    showUnitConverter() { /* Implementation */ }
    rateRecipe() { /* Implementation */ }
    
    checkInventory() { /* Implementation */ }
    exportIngredients() { /* Implementation */ }
    showSubstitutions(ingredient) { /* Implementation */ }
    showIngredientInfo(ingredient) { /* Implementation */ }
    checkEquipmentAvailability() { /* Implementation */ }
    showEquipmentGuide(equipment) { /* Implementation */ }
    
    markStepComplete(step) { /* Implementation */ }
    saveChefTip(index) { /* Implementation */ }
    trackIngredient(ingredient) { /* Implementation */ }
    
    pauseTimer(modalId) { /* Implementation */ }
    resetTimer(seconds, modalId) { /* Implementation */ }
    stopTimer(modalId) { /* Implementation */ }
    addTime(seconds, modalId) { /* Implementation */ }
    subtractTime(seconds, modalId) { /* Implementation */ }
    
    closeTimerModal() { /* Implementation */ }
    playTimerSound() { /* Implementation */ }
    
    copyToClipboard(text) { /* Implementation */ }
    printText(text) { /* Implementation */ }
    saveShoppingList() { /* Implementation */ }
    
    updateScaleValue(value) { /* Implementation */ }
    updateScaleSlider(value) { /* Implementation */ }
    applyRecipeScale() { /* Implementation */ }
    
    categorizeIngredients(ingredients) { /* Implementation */ }
    formatCategoryName(category) { /* Implementation */ }
    parseAndScaleQuantityAdvanced(quantity, scaleFactor) { /* Implementation */ }
    
    showVoiceInputIndicator() { /* Implementation */ }
    hideVoiceInputIndicator() { /* Implementation */ }
    
    loadIngredientDatabase() { /* Implementation */ }
    loadConversionRates() { /* Implementation */ }
    loadAchievements() { /* Implementation */ }
    loadCookingHistory() { /* Implementation */ }
    
    setupServiceWorker() { /* Implementation */ }
    initializeOfflineStorage() { /* Implementation */ }
    setupAnalytics() { /* Implementation */ }
    
    getCurrentPreferences() { /* Implementation */ }
    getAdvancedOptions() { /* Implementation */ }
    getEnhancedFallbackRecipe(input) { /* Implementation */ }
    attachRecipeInteractions() { /* Implementation */ }
    animateRecipeDisplay() { /* Implementation */ }
    updateNutritionTracking(recipe) { /* Implementation */ }
    checkKitchenEquipment(equipment) { /* Implementation */ }
    checkAllergies(ingredients) { /* Implementation */ }
    generateFlavorInsights(profile) { /* Implementation */ }
    formatNutritionLabel(key) { /* Implementation */ }
    calculateNutritionBarWidth(key, value) { /* Implementation */ }
    createMacroChart(nutrition) { /* Implementation */ }
    formatFlavorName(flavor) { /* Implementation */ }
    getTotalTimerSeconds(modalId) { /* Implementation */ }
    isConsecutiveDay(lastDate, currentDate) { /* Implementation */ }
    checkStreakAchievements(streak) { /* Implementation */ }
    trackError(type, error) { /* Implementation */ }
    trackCookingSession(action) { /* Implementation */ }
    trackAchievement(achievement) { /* Implementation */ }
    trackSectionView(section) { /* Implementation */ }
    updateCookingHistory(action, recipe) { /* Implementation */ }
    
    showLoadingState() { /* Implementation */ }
    hideLoadingState() { /* Implementation */ }
    initTooltips() { /* Implementation */ }
    initInteractiveElements() { /* Implementation */ }
}

// Initialize the application with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof window.app === 'undefined') {
            window.app = new CelestiqueRecipeMaster();
            console.log('Celestique AI Recipe Master initialized successfully');
        }
    } catch (error) {
        console.error('Failed to initialize Celestique AI:', error);
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div class="error-content">
                <h3>😔 Application Error</h3>
                <p>We encountered an issue while loading the application. Please refresh the page.</p>
                <button onclick="window.location.reload()">Reload Application</button>
            </div>
        `;
        document.body.appendChild(errorMessage);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CelestiqueRecipeMaster;
}