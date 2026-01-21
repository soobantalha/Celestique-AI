// Celestique AI - Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    const appContainer = document.getElementById('appContainer');
    const userNameInput = document.getElementById('userNameInput');
    const enterKitchenBtn = document.getElementById('enterKitchenBtn');
    const userGreeting = document.getElementById('userGreeting');
    const greetingText = document.getElementById('greetingText');
    const recipePrompt = document.getElementById('recipePrompt');
    const generateRecipeBtn = document.getElementById('generateRecipeBtn');
    const recipeContainer = document.getElementById('recipeContainer');
    const emptyState = document.getElementById('emptyState');
    const historyToggle = document.getElementById('historyToggle');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const historyDrawer = document.getElementById('historyDrawer');
    const historyOverlay = document.getElementById('historyOverlay');
    const historyContent = document.getElementById('historyContent');
    const exportPDFBtn = document.getElementById('exportPDFBtn');
    const themeToggle = document.getElementById('themeToggle');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const hintTags = document.querySelectorAll('.hint-tag');
    
    // App State
    let userName = localStorage.getItem('celestique_userName') || '';
    let userHistory = JSON.parse(localStorage.getItem('celestique_history') || '[]');
    let currentRecipe = null;
    let currentTheme = localStorage.getItem('celestique_theme') || 'light';
    
    // Initialize the app
    function initApp() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
        
        // Check if user has already visited
        if (userName) {
            // Returning user - skip welcome screen
            welcomeOverlay.classList.remove('active');
            setTimeout(() => {
                appContainer.style.opacity = '1';
            }, 100);
            
            // Greet the user
            updateGreeting();
        } else {
            // First-time user - show welcome screen
            welcomeOverlay.classList.add('active');
            
            // Focus on name input
            setTimeout(() => {
                userNameInput.focus();
            }, 500);
        }
        
        // Load history
        renderHistory();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Update user greeting
    function updateGreeting() {
        const greetings = [
            `Welcome back, ${userName}!`,
            `Good to see you, ${userName}!`,
            `Ready to cook, ${userName}?`,
            `${userName}, let's make something delicious!`,
            `Hello Chef ${userName}!`
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        greetingText.textContent = randomGreeting;
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Welcome screen
        enterKitchenBtn.addEventListener('click', handleEnterKitchen);
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleEnterKitchen();
            }
        });
        
        // Recipe generation
        generateRecipeBtn.addEventListener('click', generateRecipe);
        recipePrompt.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                generateRecipe();
            }
        });
        
        // Hint tags
        hintTags.forEach(tag => {
            tag.addEventListener('click', function() {
                const hint = this.getAttribute('data-hint');
                recipePrompt.value = hint;
                recipePrompt.focus();
            });
        });
        
        // History drawer
        historyToggle.addEventListener('click', toggleHistoryDrawer);
        closeHistoryBtn.addEventListener('click', toggleHistoryDrawer);
        historyOverlay.addEventListener('click', toggleHistoryDrawer);
        
        // PDF export
        exportPDFBtn.addEventListener('click', exportToPDF);
        
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Handle entering the kitchen (welcome screen)
    function handleEnterKitchen() {
        const name = userNameInput.value.trim();
        
        if (!name) {
            userNameInput.style.borderColor = '#ff6b6b';
            userNameInput.focus();
            return;
        }
        
        // Save user name
        userName = name;
        localStorage.setItem('celestique_userName', userName);
        
        // Hide welcome screen with animation
        welcomeOverlay.classList.remove('active');
        
        // Show app with delay
        setTimeout(() => {
            appContainer.style.opacity = '1';
            updateGreeting();
            
            // Focus on recipe prompt
            setTimeout(() => {
                recipePrompt.focus();
            }, 300);
        }, 500);
    }
    
    // Generate a recipe based on user input
    async function generateRecipe() {
        const prompt = recipePrompt.value.trim();
        
        if (!prompt) {
            recipePrompt.style.borderColor = '#ff6b6b';
            recipePrompt.focus();
            return;
        }
        
        // Reset border color
        recipePrompt.style.borderColor = '';
        
        // Show loading overlay
        showLoading(true);
        
        // Simulate AI processing time (for UX)
        setTimeout(async () => {
            try {
                // Generate recipe locally
                currentRecipe = await generateRecipeLocally(prompt);
                
                // Save to history
                saveToHistory(prompt, currentRecipe);
                
                // Display the recipe
                displayRecipe(currentRecipe);
                
                // Show export button
                exportPDFBtn.classList.add('active');
                exportPDFBtn.style.display = 'flex';
                
                // Hide empty state
                emptyState.style.display = 'none';
                recipeContainer.style.display = 'block';
                
                // Clear input
                recipePrompt.value = '';
                
                // Scroll to top of recipe
                recipeContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
            } catch (error) {
                console.error('Error generating recipe:', error);
                alert('Sorry, there was an error generating your recipe. Please try again.');
            } finally {
                // Hide loading overlay
                showLoading(false);
            }
        }, 1500);
    }
    
    // Generate recipe locally (no API calls)
    async function generateRecipeLocally(prompt) {
        // This is a comprehensive local recipe generator
        // It uses keyword matching and rule-based logic to create detailed recipes
        
        // Extract keywords from prompt
        const keywords = extractKeywords(prompt);
        
        // Determine recipe type based on keywords
        const recipeType = determineRecipeType(keywords);
        
        // Generate recipe based on type and keywords
        const recipe = generateRecipeByType(recipeType, keywords, prompt);
        
        // Add personalized elements
        personalizeRecipe(recipe);
        
        // Add timestamp
        recipe.generatedAt = new Date().toISOString();
        recipe.id = Date.now().toString();
        
        return recipe;
    }
    
    // Extract keywords from user prompt
    function extractKeywords(prompt) {
        const promptLower = prompt.toLowerCase();
        const keywords = [];
        
        // Meal types
        if (promptLower.includes('breakfast')) keywords.push('breakfast');
        if (promptLower.includes('lunch')) keywords.push('lunch');
        if (promptLower.includes('dinner')) keywords.push('dinner');
        if (promptLower.includes('dessert')) keywords.push('dessert');
        if (promptLower.includes('snack')) keywords.push('snack');
        if (promptLower.includes('appetizer') || promptLower.includes('starter')) keywords.push('appetizer');
        
        // Dietary preferences
        if (promptLower.includes('vegetarian') || promptLower.includes('veggie')) keywords.push('vegetarian');
        if (promptLower.includes('vegan')) keywords.push('vegan');
        if (promptLower.includes('keto')) keywords.push('keto');
        if (promptLower.includes('gluten') || promptLower.includes('gluten-free')) keywords.push('gluten-free');
        if (promptLower.includes('healthy') || promptLower.includes('light')) keywords.push('healthy');
        if (promptLower.includes('comfort') || promptLower.includes('hearty')) keywords.push('comfort');
        if (promptLower.includes('quick') || promptLower.includes('easy') || promptLower.includes('fast')) keywords.push('quick');
        
        // Cuisine types
        if (promptLower.includes('italian') || promptLower.includes('pasta') || promptLower.includes('pizza')) keywords.push('italian');
        if (promptLower.includes('mexican') || promptLower.includes('taco') || promptLower.includes('burrito')) keywords.push('mexican');
        if (promptLower.includes('asian') || promptLower.includes('chinese') || promptLower.includes('thai') || promptLower.includes('japanese') || promptLower.includes('indian')) keywords.push('asian');
        if (promptLower.includes('mediterranean')) keywords.push('mediterranean');
        if (promptLower.includes('american')) keywords.push('american');
        
        // Cooking methods
        if (promptLower.includes('bake') || promptLower.includes('oven')) keywords.push('baked');
        if (promptLower.includes('grill') || promptLower.includes('bbq')) keywords.push('grilled');
        if (promptLower.includes('stir') || promptLower.includes('fry')) keywords.push('stir-fry');
        if (promptLower.includes('roast')) keywords.push('roasted');
        if (promptLower.includes('slow') || promptLower.includes('cooker')) keywords.push('slow-cooked');
        
        // Main ingredients (simplified detection)
        const ingredientKeywords = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'tofu', 'egg', 'cheese', 'pasta', 'rice', 'potato', 'tomato', 'chocolate', 'berry', 'apple', 'banana'];
        ingredientKeywords.forEach(ingredient => {
            if (promptLower.includes(ingredient)) keywords.push(ingredient);
        });
        
        // If no keywords found, add generic ones
        if (keywords.length === 0) {
            keywords.push('general', 'balanced', 'flavorful');
        }
        
        return keywords;
    }
    
    // Determine recipe type based on keywords
    function determineRecipeType(keywords) {
        // Priority mapping
        if (keywords.includes('dessert')) return 'dessert';
        if (keywords.includes('breakfast')) return 'breakfast';
        if (keywords.includes('appetizer')) return 'appetizer';
        if (keywords.includes('pasta')) return 'pasta';
        if (keywords.includes('soup') || keywords.includes('stew')) return 'soup';
        if (keywords.includes('salad')) return 'salad';
        if (keywords.includes('stir-fry')) return 'stir-fry';
        if (keywords.includes('roasted')) return 'roast';
        if (keywords.includes('grilled')) return 'grill';
        if (keywords.includes('baked')) return 'bake';
        
        // Default to main course
        return 'main';
    }
    
    // Generate recipe by type
    function generateRecipeByType(type, keywords, originalPrompt) {
        // Recipe template
        const recipe = {
            title: '',
            intro: '',
            cuisine: '',
            culturalStory: '',
            prepTime: '',
            cookTime: '',
            difficulty: '',
            servings: 0,
            calories: 0,
            nutrition: {},
            ingredients: [],
            substitutions: [],
            instructions: [],
            chefTips: [],
            commonMistakes: [],
            flavorProfile: '',
            pairings: [],
            storage: '',
            reheating: '',
            variations: [],
            healthNotes: '',
            personalMessage: ''
        };
        
        // Get recipe base based on type
        const recipeBase = getRecipeBase(type, keywords);
        
        // Merge base with template
        Object.assign(recipe, recipeBase);
        
        // Customize based on keywords
        customizeRecipe(recipe, keywords, originalPrompt);
        
        return recipe;
    }
    
    // Get recipe base by type
    function getRecipeBase(type, keywords) {
        // This is a simplified version - in a full app, this would be much more comprehensive
        const bases = {
            'main': {
                title: 'Herb-Roasted Chicken with Seasonal Vegetables',
                intro: 'A perfectly balanced main course that brings together simple ingredients in extraordinary ways.',
                cuisine: 'Modern European',
                culturalStory: 'Roasted meats with seasonal vegetables have been a cornerstone of European cooking for centuries, representing the harmony between human cultivation and nature\'s bounty.',
                prepTime: '20 minutes',
                cookTime: '45 minutes',
                difficulty: 'Intermediate',
                servings: 4,
                calories: 420,
                nutrition: {
                    protein: '35g',
                    carbs: '22g',
                    fat: '18g',
                    fiber: '6g'
                },
                ingredients: [
                    { amount: '4 pieces', name: 'Chicken thighs, bone-in, skin-on' },
                    { amount: '3 tbsp', name: 'Olive oil' },
                    { amount: '4 cloves', name: 'Garlic, minced' },
                    { amount: '1 tbsp', name: 'Fresh rosemary, chopped' },
                    { amount: '1 tbsp', name: 'Fresh thyme leaves' },
                    { amount: '2 cups', name: 'Mixed vegetables (carrots, potatoes, onions)' },
                    { amount: '1 tsp', name: 'Sea salt' },
                    { amount: '½ tsp', name: 'Black pepper' },
                    { amount: '½ cup', name: 'Chicken broth' }
                ],
                substitutions: [
                    'Chicken thighs can be replaced with chicken breasts (reduce cooking time)',
                    'Mixed vegetables can be any seasonal vegetables you have on hand',
                    'Fresh herbs can be substituted with dried herbs (use 1/3 amount)'
                ],
                instructions: [
                    { step: 1, text: 'Preheat oven to 400°F (200°C).' },
                    { step: 2, text: 'Pat chicken thighs dry with paper towels and season with salt and pepper.' },
                    { step: 3, text: 'In a small bowl, mix olive oil, garlic, rosemary, and thyme.' },
                    { step: 4, text: 'Rub the herb mixture all over the chicken thighs.' },
                    { step: 5, text: 'Arrange vegetables in a roasting pan and place chicken on top.' },
                    { step: 6, text: 'Pour chicken broth around the vegetables.' },
                    { step: 7, text: 'Roast for 40-45 minutes until chicken is golden and cooked through.' },
                    { step: 8, text: 'Let rest for 5 minutes before serving.' }
                ],
                chefTips: [
                    'Bring chicken to room temperature before roasting for even cooking',
                    'Use a meat thermometer to ensure chicken reaches 165°F internally'
                ],
                commonMistakes: [
                    'Overcrowding the pan prevents proper browning',
                    'Not letting the chicken rest causes juices to run out'
                ],
                flavorProfile: 'Savory, herby, with caramelized notes from roasted vegetables',
                pairings: [
                    'Creamy mashed potatoes',
                    'Crusty bread to soak up juices',
                    'Light red wine like Pinot Noir'
                ],
                storage: 'Refrigerate in airtight container for up to 3 days',
                reheating: 'Reheat in oven at 350°F for 15 minutes or until warmed through',
                variations: [
                    { type: 'Mediterranean', desc: 'Add olives, cherry tomatoes, and feta cheese' },
                    { type: 'Spicy', desc: 'Add chili flakes and smoked paprika to the herb mix' },
                    { type: 'Creamy', desc: 'Stir in ½ cup heavy cream to the pan juices before serving' }
                ],
                healthNotes: 'High in protein, contains vitamins from vegetables. For lower fat, remove chicken skin before cooking.',
                personalMessage: 'This recipe celebrates simplicity - sometimes the most memorable meals come from letting quality ingredients speak for themselves.'
            },
            'vegetarian': {
                title: 'Hearty Mushroom and Lentil Shepherd\'s Pie',
                intro: 'A comforting vegetarian twist on a classic that will satisfy even the most devout meat lovers.',
                cuisine: 'British with modern twist',
                culturalStory: 'Shepherd\'s pie originated in the UK as a practical way to use leftover roasted meat. This vegetarian version honors that tradition of resourcefulness while embracing modern plant-based cooking.',
                prepTime: '25 minutes',
                cookTime: '35 minutes',
                difficulty: 'Intermediate',
                servings: 6,
                calories: 380,
                nutrition: {
                    protein: '18g',
                    carbs: '45g',
                    fat: '12g',
                    fiber: '14g'
                },
                ingredients: [
                    { amount: '2 cups', name: 'Brown lentils, cooked' },
                    { amount: '1 lb', name: 'Mixed mushrooms, chopped' },
                    { amount: '2', name: 'Carrots, diced' },
                    { amount: '2 stalks', name: 'Celery, diced' },
                    { amount: '1', name: 'Onion, finely chopped' },
                    { amount: '3 cloves', name: 'Garlic, minced' },
                    { amount: '2 tbsp', name: 'Tomato paste' },
                    { amount: '2 cups', name: 'Vegetable broth' },
                    { amount: '2 lbs', name: 'Potatoes, peeled and cubed' },
                    { amount: '¼ cup', name: 'Butter or olive oil' },
                    { amount: '½ cup', name: 'Milk or plant-based milk' }
                ],
                substitutions: [
                    'Lentils can be replaced with cooked brown rice or quinoa',
                    'Any mushrooms work - cremini, button, or shiitake',
                    'For vegan version, use olive oil and plant-based milk'
                ],
                instructions: [
                    { step: 1, text: 'Boil potatoes until tender, about 15 minutes.' },
                    { step: 2, text: 'Mash potatoes with butter and milk until smooth. Season with salt and pepper.' },
                    { step: 3, text: 'Sauté onions, carrots, and celery until softened, about 8 minutes.' },
                    { step: 4, text: 'Add mushrooms and garlic, cook until mushrooms release their liquid.' },
                    { step: 5, text: 'Stir in tomato paste and cook for 1 minute.' },
                    { step: 6, text: 'Add cooked lentils and vegetable broth. Simmer for 10 minutes.' },
                    { step: 7, text: 'Transfer lentil mixture to baking dish and top with mashed potatoes.' },
                    { step: 8, text: 'Bake at 400°F for 20-25 minutes until golden and bubbly.' }
                ],
                chefTips: [
                    'Use a mix of mushrooms for deeper flavor',
                    'Let the pie rest for 10 minutes after baking for easier slicing'
                ],
                commonMistakes: [
                    'Making potato topping too thin - it should be thick enough to hold its shape',
                    'Not cooking the filling long enough to develop deep flavors'
                ],
                flavorProfile: 'Earthy, savory, umami-rich with creamy potato topping',
                pairings: [
                    'Simple green salad with vinaigrette',
                    'Roasted Brussels sprouts',
                    'Full-bodied red wine like Syrah'
                ],
                storage: 'Refrigerate for up to 4 days or freeze for up to 3 months',
                reheating: 'Reheat in oven at 350°F for 20-25 minutes or until heated through',
                variations: [
                    { type: 'Vegan', desc: 'Use olive oil and plant-based milk, omit butter' },
                    { type: 'Spicy', desc: 'Add 1 tsp smoked paprika and ½ tsp cayenne to filling' },
                    { type: 'Cheesy', desc: 'Mix 1 cup grated cheddar into potato topping' }
                ],
                healthNotes: 'High in fiber and plant-based protein. Lentils provide iron and folate.',
                personalMessage: 'This dish proves that comfort food doesn\'t need meat to be deeply satisfying and nourishing.'
            }
            // Additional recipe bases would be defined here for other types
        };
        
        // Return the base or default to main if type not found
        return bases[type] || bases['main'];
    }
    
    // Customize recipe based on keywords and original prompt
    function customizeRecipe(recipe, keywords, originalPrompt) {
        // Customize title based on keywords
        if (keywords.includes('quick')) {
            recipe.title = 'Quick ' + recipe.title;
            recipe.prepTime = '10 minutes';
        }
        
        if (keywords.includes('healthy')) {
            recipe.title = 'Healthy ' + recipe.title;
            recipe.calories = Math.floor(recipe.calories * 0.8);
        }
        
        if (keywords.includes('italian')) {
            recipe.cuisine = 'Italian';
            recipe.title = recipe.title.replace('with', 'al');
        }
        
        // Add ingredient based on keywords
        if (keywords.includes('chicken')) {
            recipe.ingredients.unshift({ amount: '1.5 lbs', name: 'Chicken breast, cubed' });
        }
        
        if (keywords.includes('chocolate') && recipe.title.toLowerCase().includes('dessert')) {
            recipe.ingredients.push({ amount: '8 oz', name: 'Dark chocolate, chopped' });
        }
        
        // Adjust servings if specified in prompt
        const servingMatch = originalPrompt.match(/\b(\d+)\s*(serving|portion|person)/i);
        if (servingMatch) {
            recipe.servings = parseInt(servingMatch[1]);
        }
        
        // Update intro to reference original prompt
        recipe.intro = `Inspired by your request for "${originalPrompt}", this recipe combines traditional techniques with modern sensibilities to create something truly special.`;
    }
    
    // Personalize recipe with user name
    function personalizeRecipe(recipe) {
        if (userName) {
            recipe.personalMessage = `${userName}, ${recipe.personalMessage}`;
            recipe.intro = `${recipe.intro} I've tailored it just for you, ${userName}, with attention to the details that make cooking personal and joyful.`;
        }
    }
    
    // Display recipe in the UI
    function displayRecipe(recipe) {
        const recipeHTML = `
            <div class="recipe-content">
                <div class="recipe-header">
                    <h1 class="recipe-title">${recipe.title}</h1>
                    <p class="recipe-intro">${recipe.intro}</p>
                </div>
                
                <div class="recipe-meta">
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-globe-americas"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Cuisine</div>
                            <div class="meta-value">${recipe.cuisine}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-clock"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Prep Time</div>
                            <div class="meta-value">${recipe.prepTime}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-fire"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Cook Time</div>
                            <div class="meta-value">${recipe.cookTime}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Difficulty</div>
                            <div class="meta-value">${recipe.difficulty}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-utensils"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Servings</div>
                            <div class="meta-value">${recipe.servings}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-burn"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Calories</div>
                            <div class="meta-value">${recipe.calories} per serving</div>
                        </div>
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-book"></i> Cultural Background</h3>
                    <p>${recipe.culturalStory}</p>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-apple-alt"></i> Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li>
                                <span class="ingredient-amount">${ing.amount}</span>
                                <span class="ingredient-name">${ing.name}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <h4 class="section-title" style="margin-top: 1.5rem; font-size: 1.2rem;"><i class="fas fa-exchange-alt"></i> Substitutions</h4>
                    <ul>
                        ${recipe.substitutions.map(sub => `<li>${sub}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-list-ol"></i> Instructions</h3>
                    <ol class="instructions-list">
                        ${recipe.instructions.map(inst => `
                            <li>
                                <span class="instruction-step">${inst.step}.</span>
                                <span class="instruction-text">${inst.text}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-seedling"></i> Nutrition Information</h3>
                    <div class="nutrition-grid">
                        ${Object.entries(recipe.nutrition).map(([key, value]) => `
                            <div class="nutrition-item">
                                <div class="nutrition-value">${value}</div>
                                <div class="nutrition-label">${key}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-lightbulb"></i> Pro Chef Tips</h3>
                    <div class="tips-list">
                        ${recipe.chefTips.map(tip => `
                            <div class="tip-card">
                                <i class="fas fa-star"></i>
                                <div class="tip-title">Expert Tip</div>
                                <div class="tip-desc">${tip}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-exclamation-triangle"></i> Common Mistakes to Avoid</h3>
                    <div class="mistakes-list">
                        ${recipe.commonMistakes.map(mistake => `
                            <div class="mistake-card">
                                <i class="fas fa-times-circle"></i>
                                <div class="mistake-title">Watch Out</div>
                                <div class="mistake-desc">${mistake}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-wine-glass-alt"></i> Pairings & Serving Suggestions</h3>
                    <p><strong>Flavor Profile:</strong> ${recipe.flavorProfile}</p>
                    <div class="pairings-list" style="margin-top: 1rem;">
                        ${recipe.pairings.map(pairing => `
                            <div class="pairing-card">
                                <i class="fas fa-check-circle"></i>
                                <div class="pairing-title">Perfect Match</div>
                                <div class="pairing-desc">${pairing}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-box"></i> Storage & Reheating</h3>
                    <p><strong>Storage:</strong> ${recipe.storage}</p>
                    <p><strong>Reheating:</strong> ${recipe.reheating}</p>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-random"></i> Variations</h3>
                    <div class="variation-grid">
                        ${recipe.variations.map(variation => `
                            <div class="variation-card">
                                <div class="variation-type">${variation.type}</div>
                                <div class="variation-desc">${variation.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-heart"></i> Health Notes</h3>
                    <p>${recipe.healthNotes}</p>
                </div>
                
                <div class="recipe-section" style="background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%); border-left-color: var(--color-saffron);">
                    <h3 class="section-title"><i class="fas fa-comment"></i> Personal Message</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">${recipe.personalMessage}</p>
                    <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                        <i class="fas fa-calendar"></i> Generated on ${new Date(recipe.generatedAt).toLocaleDateString()} at ${new Date(recipe.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>
            </div>
        `;
        
        recipeContainer.innerHTML = recipeHTML;
    }
    
    // Save recipe to history
    function saveToHistory(prompt, recipe) {
        const historyItem = {
            id: recipe.id,
            prompt: prompt,
            title: recipe.title,
            date: new Date().toISOString(),
            recipe: recipe
        };
        
        // Add to beginning of array (most recent first)
        userHistory.unshift(historyItem);
        
        // Keep only last 50 items
        if (userHistory.length > 50) {
            userHistory = userHistory.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('celestique_history', JSON.stringify(userHistory));
        
        // Update history display
        renderHistory();
    }
    
    // Render history items
    function renderHistory() {
        if (userHistory.length === 0) {
            historyContent.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-utensils"></i>
                    <p>Your recipe history will appear here</p>
                </div>
            `;
            return;
        }
        
        const historyHTML = userHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-title">${item.title}</div>
                <div class="history-meta">
                    <span>${new Date(item.date).toLocaleDateString()}</span>
                    <span>${item.prompt.substring(0, 30)}${item.prompt.length > 30 ? '...' : ''}</span>
                </div>
            </div>
        `).join('');
        
        historyContent.innerHTML = historyHTML;
        
        // Add click listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                loadRecipeFromHistory(id);
                
                // Close history drawer on mobile
                if (window.innerWidth < 768) {
                    toggleHistoryDrawer();
                }
            });
        });
    }
    
    // Load recipe from history
    function loadRecipeFromHistory(id) {
        const historyItem = userHistory.find(item => item.id === id);
        if (!historyItem) return;
        
        currentRecipe = historyItem.recipe;
        displayRecipe(currentRecipe);
        
        // Show export button
        exportPDFBtn.classList.add('active');
        exportPDFBtn.style.display = 'flex';
        
        // Hide empty state
        emptyState.style.display = 'none';
        recipeContainer.style.display = 'block';
        
        // Scroll to top of recipe
        recipeContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight active history item
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.history-item[data-id="${id}"]`).classList.add('active');
    }
    
    // Toggle history drawer
    function toggleHistoryDrawer() {
        const isActive = historyDrawer.classList.toggle('active');
        historyOverlay.classList.toggle('active', isActive);
        
        // Prevent body scrolling when drawer is open
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
    
    // Show/hide loading overlay
    function showLoading(show) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('celestique_theme', currentTheme);
        updateThemeIcon();
    }
    
    // Update theme icon
    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (currentTheme === 'light') {
            icon.className = 'fas fa-moon';
            themeToggle.setAttribute('title', 'Switch to dark theme');
        } else {
            icon.className = 'fas fa-sun';
            themeToggle.setAttribute('title', 'Switch to light theme');
        }
    }
    
    // Export recipe to PDF
    function exportToPDF() {
        if (!currentRecipe) return;
        
        // Create a new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set initial y position
        let yPos = 20;
        
        // Add header
        doc.setFillColor(138, 154, 91); // Olive color
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Celestique AI', 105, 18, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('World\'s Most Advanced Recipe Generator', 105, 25, { align: 'center' });
        
        // Reset text color for content
        doc.setTextColor(0, 0, 0);
        
        // Add recipe title
        yPos = 40;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(currentRecipe.title, 105, yPos, { align: 'center' });
        yPos += 10;
        
        // Add intro
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        const introLines = doc.splitTextToSize(currentRecipe.intro, 180);
        doc.text(introLines, 15, yPos);
        yPos += introLines.length * 5 + 10;
        
        // Add metadata table
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const metaData = [
            ['Cuisine:', currentRecipe.cuisine],
            ['Prep Time:', currentRecipe.prepTime],
            ['Cook Time:', currentRecipe.cookTime],
            ['Difficulty:', currentRecipe.difficulty],
            ['Servings:', currentRecipe.servings.toString()],
            ['Calories:', `${currentRecipe.calories} per serving`]
        ];
        
        // Simple table implementation
        metaData.forEach((row, i) => {
            doc.setFont('helvetica', 'bold');
            doc.text(row[0], 15, yPos + (i * 6));
            doc.setFont('helvetica', 'normal');
            doc.text(row[1], 50, yPos + (i * 6));
        });
        
        yPos += metaData.length * 6 + 15;
        
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        // Add ingredients section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ingredients', 15, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        currentRecipe.ingredients.forEach((ing, i) => {
            doc.text(`${ing.amount} ${ing.name}`, 20, yPos + (i * 5));
        });
        
        yPos += currentRecipe.ingredients.length * 5 + 10;
        
        // Add instructions section
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions', 15, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        currentRecipe.instructions.forEach((inst, i) => {
            const instructionText = `${inst.step}. ${inst.text}`;
            const instructionLines = doc.splitTextToSize(instructionText, 170);
            doc.text(instructionLines, 20, yPos);
            yPos += instructionLines.length * 5 + 3;
            
            // Check if we need a new page
            if (yPos > 270 && i < currentRecipe.instructions.length - 1) {
                doc.addPage();
                yPos = 20;
            }
        });
        
        // Add footer on last page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('Powered by Sooban Talha Technologies', 105, 295, { align: 'center' });
        }
        
        // Save the PDF
        doc.save(`${currentRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`);
    }
    
    // Initialize the app
    initApp();
});