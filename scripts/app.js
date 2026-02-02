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
    
    // --- UPDATED: Generate Recipe Function (Connects to API) ---
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
        
        try {
            // FIXED: Calling the real API instead of fake timeout
            console.log('Sending request to AI...');
            
            // Note: This assumes recipe.js is located at /api/recipe.js in your project structure
            const response = await fetch('/api/recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: prompt,
                    userName: userName,
                    dietaryPreference: 'balanced', // You can make these dynamic later
                    cuisinePreference: 'international',
                    mealType: 'main'
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Use the data returned from the server
            currentRecipe = data;
            
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
            console.error('API Error, falling back to local generator:', error);
            
            // FALLBACK: If API fails (no key, or error), use local generator
            // This ensures the user always gets a recipe
            currentRecipe = await generateRecipeLocally(prompt);
            
            saveToHistory(prompt, currentRecipe);
            displayRecipe(currentRecipe);
            
            emptyState.style.display = 'none';
            recipeContainer.style.display = 'block';
            exportPDFBtn.classList.add('active');
            exportPDFBtn.style.display = 'flex';
            
        } finally {
            // Hide loading overlay
            showLoading(false);
        }
    }
    
    // Generate recipe locally (Fallback)
    async function generateRecipeLocally(prompt) {
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
        const bases = {
            'main': {
                title: 'Herb-Roasted Chicken with Seasonal Vegetables',
                intro: 'A perfectly balanced main course that brings together simple ingredients in extraordinary ways.',
                cuisine: 'Modern European',
                culturalStory: 'Roasted meats with seasonal vegetables have been a cornerstone of European cooking for centuries.',
                prepTime: '20 minutes',
                cookTime: '45 minutes',
                difficulty: 'Intermediate',
                servings: 4,
                calories: 420,
                nutrition: { protein: '35g', carbs: '22g', fat: '18g', fiber: '6g' },
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
                substitutions: ['Chicken breasts (reduce cooking time)', 'Dried herbs (1/3 amount)'],
                instructions: [
                    { step: 1, text: 'Preheat oven to 400°F (200°C).' },
                    { step: 2, text: 'Pat chicken thighs dry and season.' },
                    { step: 3, text: 'Mix oil, garlic, and herbs.' },
                    { step: 4, text: 'Rub herb mixture on chicken.' },
                    { step: 5, text: 'Arrange vegetables in pan, place chicken on top.' },
                    { step: 6, text: 'Roast for 40-45 minutes.' },
                    { step: 7, text: 'Let rest for 5 minutes.' }
                ],
                chefTips: ['Bring chicken to room temp before roasting'],
                commonMistakes: ['Overcrowding the pan'],
                flavorProfile: 'Savory, herby, roasted',
                pairings: ['Mashed potatoes', 'Pinot Noir'],
                storage: 'Refrigerate 3 days',
                reheating: 'Oven at 350°F',
                variations: [{ type: 'Spicy', desc: 'Add chili flakes' }],
                healthNotes: 'High protein',
                personalMessage: 'A classic made simple.'
            },
            'vegetarian': {
                title: 'Hearty Mushroom and Lentil Shepherd\'s Pie',
                intro: 'A comforting vegetarian twist on a classic.',
                cuisine: 'British Modern',
                culturalStory: 'A plant-based take on a traditional comfort food.',
                prepTime: '25 minutes',
                cookTime: '35 minutes',
                difficulty: 'Intermediate',
                servings: 6,
                calories: 380,
                nutrition: { protein: '18g', carbs: '45g', fat: '12g', fiber: '14g' },
                ingredients: [
                    { amount: '2 cups', name: 'Cooked lentils' },
                    { amount: '1 lb', name: 'Mixed mushrooms' },
                    { amount: '2', name: 'Carrots, diced' },
                    { amount: '1', name: 'Onion, chopped' },
                    { amount: '2 lbs', name: 'Potatoes, mashed' }
                ],
                substitutions: ['Walnuts for texture'],
                instructions: [
                    { step: 1, text: 'Prepare mashed potatoes.' },
                    { step: 2, text: 'Sauté veggies and mushrooms.' },
                    { step: 3, text: 'Mix in lentils and season.' },
                    { step: 4, text: 'Top with potatoes and bake at 400°F.' }
                ],
                chefTips: ['Brown mushrooms well'],
                commonMistakes: ['Too much liquid in filling'],
                flavorProfile: 'Earthy, savory',
                pairings: ['Green salad'],
                storage: 'Fridge 4 days',
                reheating: 'Oven 350°F',
                variations: [{ type: 'Vegan', desc: 'Use olive oil/plant milk' }],
                healthNotes: 'High fiber',
                personalMessage: 'Comfort in a bowl.'
            }
        };
        return bases[type] || bases['main'];
    }
    
    // Customize recipe based on keywords and original prompt
    function customizeRecipe(recipe, keywords, originalPrompt) {
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
        
        // Adjust servings if specified in prompt
        const servingMatch = originalPrompt.match(/\b(\d+)\s*(serving|portion|person)/i);
        if (servingMatch) {
            recipe.servings = parseInt(servingMatch[1]);
        }
        
        recipe.intro = `Inspired by your request for "${originalPrompt}", this recipe combines traditional techniques with modern sensibilities.`;
    }
    
    // Personalize recipe with user name
    function personalizeRecipe(recipe) {
        if (userName) {
            recipe.personalMessage = `${userName}, ${recipe.personalMessage}`;
            recipe.intro = `${recipe.intro} I've tailored it just for you, ${userName}.`;
        }
    }
    
    // Display recipe in the UI
    function displayRecipe(recipe) {
        const recipeHTML = `
            <div class="recipe-content">
                <div class="recipe-header">
                    <h1 class="recipe-title">${recipe.title || recipe.recipe_title}</h1>
                    <p class="recipe-intro">${recipe.intro || recipe.emotional_introduction}</p>
                </div>
                
                <div class="recipe-meta">
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-globe-americas"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Cuisine</div>
                            <div class="meta-value">${recipe.cuisine || recipe.cuisine_origin}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-clock"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Prep Time</div>
                            <div class="meta-value">${recipe.prepTime || recipe.preparation_time}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-fire"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Cook Time</div>
                            <div class="meta-value">${recipe.cookTime || recipe.cooking_time}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Difficulty</div>
                            <div class="meta-value">${recipe.difficulty || recipe.difficulty_level}</div>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-icon"><i class="fas fa-utensils"></i></div>
                        <div class="meta-text">
                            <div class="meta-label">Servings</div>
                            <div class="meta-value">${recipe.servings || recipe.serving_size}</div>
                        </div>
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-book"></i> Cultural Background</h3>
                    <p>${recipe.culturalStory || recipe.cultural_background}</p>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-apple-alt"></i> Ingredients</h3>
                    <ul class="ingredients-list">
                        ${(recipe.ingredients || recipe.ingredients_list).map(ing => `
                            <li>
                                <span class="ingredient-amount">${ing.amount}</span>
                                <span class="ingredient-name">${ing.name} ${ing.emotional_note ? `<br><small>(${ing.emotional_note})</small>` : ''}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-list-ol"></i> Instructions</h3>
                    <ol class="instructions-list">
                        ${(recipe.instructions || recipe.step_by_step_instructions).map(inst => `
                            <li>
                                <span class="instruction-step">${inst.step || ''}</span>
                                <span class="instruction-text">${inst.text || inst.instruction}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>

                 <div class="recipe-section">
                    <h3 class="section-title"><i class="fas fa-lightbulb"></i> Chef Tips</h3>
                    <div class="tips-list">
                        ${(recipe.chefTips || recipe.pro_chef_tips || []).map(tip => `
                            <div class="tip-card">
                                <i class="fas fa-star"></i>
                                <div class="tip-desc">${typeof tip === 'string' ? tip : tip.tip}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="recipe-section" style="background: linear-gradient(135deg, var(--color-cream) 0%, var(--color-cream-dark) 100%); border-left-color: var(--color-saffron);">
                    <h3 class="section-title"><i class="fas fa-comment"></i> Personal Message</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">${recipe.personalMessage || recipe.emotional_closing}</p>
                </div>
            </div>
        `;
        
        recipeContainer.innerHTML = recipeHTML;
    }
    
    // Save recipe to history
    function saveToHistory(prompt, recipe) {
        const historyItem = {
            id: recipe.id || recipe.recipe_id || Date.now().toString(),
            prompt: prompt,
            title: recipe.title || recipe.recipe_title,
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
        
        // Title logic for PDF
        const title = currentRecipe.title || currentRecipe.recipe_title;
        const ingredients = currentRecipe.ingredients || currentRecipe.ingredients_list;
        const instructions = currentRecipe.instructions || currentRecipe.step_by_step_instructions;
        
        // Set initial y position
        let yPos = 20;
        
        // Add header
        doc.setFillColor(138, 154, 91); // Olive color
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Celestique AI', 105, 18, { align: 'center' });
        
        // Reset text color for content
        doc.setTextColor(0, 0, 0);
        
        // Add recipe title
        yPos = 40;
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 105, yPos, { align: 'center' });
        yPos += 20;
        
        // Add ingredients
        doc.setFontSize(14);
        doc.text('Ingredients', 15, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        ingredients.forEach((ing, i) => {
            doc.text(`${ing.amount} ${ing.name}`, 20, yPos + (i * 5));
        });
        
        yPos += ingredients.length * 5 + 10;
        
        // Add instructions
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions', 15, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        instructions.forEach((inst, i) => {
            const txt = typeof inst === 'string' ? inst : `${inst.step || (i+1)}. ${inst.text || inst.instruction}`;
            const lines = doc.splitTextToSize(txt, 170);
            doc.text(lines, 20, yPos);
            yPos += lines.length * 5 + 3;
        });
        
        // Save the PDF
        doc.save('recipe.pdf');
    }
    
    // Initialize the app
    initApp();
});