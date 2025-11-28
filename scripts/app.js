// Celestique AI - Advanced Recipe Generator
class CelestiqueAI {
    constructor() {
        this.initializeApp();
        this.bindEvents();
        this.initializeAdvancedAnimations();
    }

    initializeApp() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.welcomeArea = document.getElementById('welcomeArea');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.thinkingIndicator = document.getElementById('thinkingIndicator');
        this.clearChatBtn = document.getElementById('clearChat');
        
        this.conversationHistory = [];
        this.isGenerating = false;
    }

    initializeAdvancedAnimations() {
        // Add intersection observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // Auto-resize textarea with animation
        this.messageInput.addEventListener('input', () => {
            this.autoResize();
            this.animateInput();
        });

        // Quick suggestion chips with enhanced animations
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.animateButton(e.target);
                const prompt = chip.getAttribute('data-prompt');
                this.messageInput.value = prompt;
                setTimeout(() => this.sendMessage(), 300);
            });
        });

        // Theme toggle with enhanced animation
        document.querySelector('.theme-toggle').addEventListener('click', (e) => {
            this.animateButton(e.target);
            setTimeout(() => this.toggleTheme(), 200);
        });

        // Input focus animations
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.classList.add('focused');
        });

        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.classList.remove('focused');
        });
    }

    animateInput() {
        this.messageInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.messageInput.style.transform = 'scale(1)';
        }, 150);
    }

    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isGenerating) return;

        // Hide welcome area, show messages with animation
        this.welcomeArea.style.display = 'none';
        this.messagesContainer.style.display = 'block';

        // Add user message with animation
        this.addMessage(message, 'user');

        // Clear input with animation
        this.animateClearInput();

        // Show thinking indicator
        this.showThinking();

        this.isGenerating = true;
        this.sendButton.disabled = true;

        try {
            const recipeData = await this.generateRecipe(message);
            this.hideThinking();
            this.displayRecipe(recipeData);
        } catch (error) {
            this.hideThinking();
            this.showError(error.message);
        }

        this.isGenerating = false;
        this.sendButton.disabled = false;
    }

    animateClearInput() {
        this.messageInput.style.opacity = '0';
        this.messageInput.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            this.messageInput.value = '';
            this.autoResize();
            this.messageInput.style.opacity = '1';
            this.messageInput.style.transform = 'translateX(0)';
        }, 300);
    }

    async generateRecipe(message) {
        console.log('Generating recipe for:', message);
        
        // In a real implementation, this would call an API
        // For demo purposes, we'll use a mock function
        return this.generateMockRecipe(message);
    }

    generateMockRecipe(userInput) {
        // This is a mock function - in a real app, this would call an AI API
        const recipes = {
            "italian pasta": {
                title: "Creamy Garlic Parmesan Pasta",
                description: "A rich and creamy pasta dish with garlic, parmesan, and fresh herbs",
                prepTime: "15 mins",
                cookTime: "20 mins",
                servings: 4,
                difficulty: "Easy",
                cuisine: "Italian",
                ingredients: [
                    "400g fettuccine pasta",
                    "4 cloves garlic, minced",
                    "1 cup heavy cream",
                    "1 cup grated parmesan cheese",
                    "3 tbsp butter",
                    "2 tbsp fresh parsley, chopped",
                    "Salt and black pepper to taste",
                    "1/4 tsp nutmeg (optional)"
                ],
                instructions: [
                    "Bring a large pot of salted water to boil and cook pasta according to package directions.",
                    "While pasta cooks, melt butter in a large skillet over medium heat.",
                    "Add minced garlic and sauté for 1-2 minutes until fragrant but not browned.",
                    "Pour in heavy cream and bring to a gentle simmer.",
                    "Gradually whisk in parmesan cheese until smooth and creamy.",
                    "Season with salt, pepper, and nutmeg if using.",
                    "Drain pasta, reserving 1/2 cup of pasta water.",
                    "Add cooked pasta to the sauce, tossing to coat evenly.",
                    "If sauce is too thick, add reserved pasta water 1 tbsp at a time.",
                    "Garnish with fresh parsley and extra parmesan before serving."
                ],
                tips: [
                    "Use freshly grated parmesan for best melting results",
                    "Don't let the garlic brown or it will become bitter",
                    "Reserve pasta water to adjust sauce consistency"
                ],
                nutrition: {
                    calories: 485,
                    protein: "18g",
                    carbs: "45g",
                    fat: "25g",
                    fiber: "2g"
                }
            },
            "vegan lunch": {
                title: "Rainbow Buddha Bowl with Tahini Dressing",
                description: "A vibrant, nutrient-packed vegan bowl with quinoa, roasted vegetables, and creamy tahini dressing",
                prepTime: "20 mins",
                cookTime: "25 mins",
                servings: 2,
                difficulty: "Medium",
                cuisine: "Mediterranean",
                ingredients: [
                    "1 cup quinoa, rinsed",
                    "1 sweet potato, cubed",
                    "1 red bell pepper, sliced",
                    "1 cup broccoli florets",
                    "1 avocado, sliced",
                    "1/4 cup chickpeas, drained and rinsed",
                    "2 tbsp olive oil",
                    "Salt and pepper to taste",
                    "For tahini dressing: 3 tbsp tahini, 2 tbsp lemon juice, 1 tbsp maple syrup, 3 tbsp water, 1 garlic clove minced"
                ],
                instructions: [
                    "Preheat oven to 400°F (200°C).",
                    "Cook quinoa according to package instructions.",
                    "Toss sweet potato, bell pepper, and broccoli with olive oil, salt, and pepper.",
                    "Roast vegetables for 20-25 minutes until tender and slightly caramelized.",
                    "While vegetables roast, whisk together all tahini dressing ingredients until smooth.",
                    "Assemble bowls: divide quinoa among bowls, top with roasted vegetables, avocado, and chickpeas.",
                    "Drizzle with tahini dressing and serve immediately."
                ],
                tips: [
                    "Roast vegetables until edges are slightly crispy for best flavor",
                    "Add a pinch of cumin to the tahini dressing for extra flavor",
                    "Can be meal prepped - store dressing separately"
                ],
                nutrition: {
                    calories: 420,
                    protein: "15g",
                    carbs: "58g",
                    fat: "16g",
                    fiber: "12g"
                }
            },
            "dessert recipe": {
                title: "Decadent Chocolate Lava Cakes",
                description: "Individual chocolate cakes with molten chocolate centers, perfect for special occasions",
                prepTime: "15 mins",
                cookTime: "12 mins",
                servings: 4,
                difficulty: "Medium",
                cuisine: "French",
                ingredients: [
                    "4 oz high-quality dark chocolate (70%)",
                    "1/2 cup unsalted butter",
                    "2 large eggs",
                    "2 large egg yolks",
                    "1/4 cup granulated sugar",
                    "2 tbsp all-purpose flour",
                    "1/4 tsp salt",
                    "Butter and cocoa powder for ramekins",
                    "Powdered sugar and berries for serving"
                ],
                instructions: [
                    "Preheat oven to 425°F (220°C). Butter 4 ramekins and dust with cocoa powder.",
                    "Melt chocolate and butter in double boiler or microwave, stirring until smooth.",
                    "In a separate bowl, whisk eggs, egg yolks, and sugar until pale and thick.",
                    "Fold melted chocolate into egg mixture until combined.",
                    "Gently fold in flour and salt until just incorporated.",
                    "Divide batter among prepared ramekins, filling about 3/4 full.",
                    "Bake for 10-12 minutes until edges are set but centers are still soft.",
                    "Let cool for 1 minute, then invert onto plates.",
                    "Dust with powdered sugar and serve immediately with berries."
                ],
                tips: [
                    "Don't overbake - centers should be molten",
                    "Use high-quality chocolate for best results",
                    "Can be prepared ahead and refrigerated before baking"
                ],
                nutrition: {
                    calories: 380,
                    protein: "7g",
                    carbs: "28g",
                    fat: "28g",
                    fiber: "3g"
                }
            },
            "quick breakfast": {
                title: "Speedy Veggie Breakfast Burritos",
                description: "Protein-packed breakfast burritos ready in under 15 minutes",
                prepTime: "5 mins",
                cookTime: "10 mins",
                servings: 2,
                difficulty: "Easy",
                cuisine: "Mexican",
                ingredients: [
                    "4 large eggs",
                    "2 large flour tortillas",
                    "1/4 cup black beans, drained",
                    "1/4 cup corn kernels",
                    "1/4 cup shredded cheese",
                    "2 tbsp salsa",
                    "1 tbsp olive oil",
                    "Salt and pepper to taste",
                    "Optional: avocado, hot sauce, cilantro"
                ],
                instructions: [
                    "Heat olive oil in a non-stick skillet over medium heat.",
                    "Whisk eggs with salt and pepper, then pour into skillet.",
                    "Scramble eggs until almost set, then add black beans and corn.",
                    "Continue cooking until eggs are fully set.",
                    "Warm tortillas in a dry skillet or microwave.",
                    "Divide egg mixture between tortillas, top with cheese and salsa.",
                    "Fold sides and roll tightly into burritos.",
                    "Serve immediately or wrap in foil for on-the-go."
                ],
                tips: [
                    "Make ahead and freeze for quick breakfasts",
                    "Customize with your favorite veggies and proteins",
                    "Add a dollop of Greek yogurt instead of sour cream for protein"
                ],
                nutrition: {
                    calories: 320,
                    protein: "18g",
                    carbs: "28g",
                    fat: "15g",
                    fiber: "4g"
                }
            }
        };

        // Find the best matching recipe based on user input
        const inputLower = userInput.toLowerCase();
        let matchedRecipe = null;
        
        for (const [key, recipe] of Object.entries(recipes)) {
            if (inputLower.includes(key)) {
                matchedRecipe = recipe;
                break;
            }
        }

        // Default recipe if no match found
        if (!matchedRecipe) {
            matchedRecipe = recipes["italian pasta"];
            matchedRecipe.title = `Custom ${userInput} Recipe`;
            matchedRecipe.description = `A delicious recipe based on your request: ${userInput}`;
        }

        return {
            ...matchedRecipe,
            generated_at: new Date().toISOString()
        };
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = type === 'user' ? 
            '<div class="message-avatar">👤</div>' : 
            '<div class="message-avatar"><div class="logo-background small"><img src="https://cdn-icons-png.flaticon.com/512/2921/2921815.png" alt="AI" class="logo-img"></div></div>';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (type === 'user') {
            messageDiv.innerHTML = `
                ${avatar}
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                ${avatar}
                <div class="message-content">
                    ${content}
                    <div class="message-time">${time}</div>
                </div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({ type, content, time });
    }

    displayRecipe(data) {
        const formattedContent = this.formatRecipeData(data);
        this.addMessage(formattedContent, 'ai');
        
        // Add scroll animations to new recipe sections
        setTimeout(() => {
            document.querySelectorAll('.recipe-section').forEach(section => {
                this.observer.observe(section);
            });
        }, 100);
    }

    formatRecipeData(data) {
        if (data.error) {
            return `
                <div class="error-message">
                    <h3>Unable to Generate Recipe</h3>
                    <p>${data.error}</p>
                    <p>Please try again or check your connection.</p>
                </div>
            `;
        }

        return `
            <div class="recipe-container" data-recipe="${this.escapeHtml(data.title)}">
                <!-- Header -->
                <div class="recipe-section">
                    <h1 class="recipe-title">${this.escapeHtml(data.title)}</h1>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">${this.escapeHtml(data.description)}</p>
                    <div class="powered-by">
                        Powered by Celestique AI • 
                        Cuisine: ${data.cuisine || 'Various'} • 
                        by Sooban Talha Technologies
                    </div>
                </div>

                <!-- Recipe Details -->
                <div class="recipe-section">
                    <div class="recipe-details">
                        <div class="detail-card">
                            <div class="detail-value">${data.prepTime}</div>
                            <div class="detail-label">Prep Time</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-value">${data.cookTime}</div>
                            <div class="detail-label">Cook Time</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-value">${data.servings}</div>
                            <div class="detail-label">Servings</div>
                        </div>
                        <div class="detail-card">
                            <div class="detail-value">${data.difficulty}</div>
                            <div class="detail-label">Difficulty</div>
                        </div>
                    </div>
                </div>

                <!-- Ingredients -->
                <div class="recipe-section">
                    <h2 class="section-title">📋 INGREDIENTS</h2>
                    <div class="ingredients-list">
                        ${data.ingredients.map(ingredient => `
                            <div class="ingredient-item">${this.escapeHtml(ingredient)}</div>
                        `).join('')}
                    </div>
                </div>

                <!-- Instructions -->
                <div class="recipe-section">
                    <h2 class="section-title">👨‍🍳 INSTRUCTIONS</h2>
                    <div class="instructions-list">
                        ${data.instructions.map((instruction, index) => `
                            <div class="instruction-item">
                                <div class="step-number">Step ${index + 1}</div>
                                <div class="step-text">${this.escapeHtml(instruction)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Tips & Tricks -->
                ${data.tips && data.tips.length > 0 ? `
                <div class="recipe-section">
                    <h2 class="section-title">💡 CHEF'S TIPS</h2>
                    <div class="tips-list">
                        ${data.tips.map(tip => `
                            <div class="tip-item">${this.escapeHtml(tip)}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Nutrition Information -->
                ${data.nutrition ? `
                <div class="recipe-section">
                    <h2 class="section-title">🥗 NUTRITION INFO</h2>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <div class="nutrition-value">${data.nutrition.calories}</div>
                            <div class="nutrition-label">Calories</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${data.nutrition.protein}</div>
                            <div class="nutrition-label">Protein</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${data.nutrition.carbs}</div>
                            <div class="nutrition-label">Carbs</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${data.nutrition.fat}</div>
                            <div class="nutrition-label">Fat</div>
                        </div>
                        ${data.nutrition.fiber ? `
                        <div class="nutrition-item">
                            <div class="nutrition-value">${data.nutrition.fiber}</div>
                            <div class="nutrition-label">Fiber</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- PDF Download Button -->
                <div class="recipe-section">
                    <div class="pdf-download-section">
                        <button class="download-btn" onclick="celestiqueAI.generateRecipePDF('${this.escapeHtml(data.title)}')">
                            <i class="fas fa-file-pdf"></i>
                            Download Recipe PDF 
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="recipe-section">
                    <div class="powered-by">
                        Generated by Celestique AI • by Sooban Talha Technologies •
                        ${data.generated_at ? new Date(data.generated_at).toLocaleString() : new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }

    generateRecipePDF(title) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Premium Header
        doc.setFillColor(255, 107, 53); // Orange background
        doc.rect(0, 0, 210, 45, 'F');
        
        // Main title in white
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('CELESTIQUE AI', 105, 20, { align: 'center' });
        
        // Subtitle
        doc.setFontSize(12);
        doc.text('PREMIUM RECIPE COLLECTION', 105, 28, { align: 'center' });
        
        // Production credit
        doc.setFontSize(10);
        doc.text('by Sooban Talha Technologies', 105, 34, { align: 'center' });
        
        // Recipe title section with black background and orange text
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 40, 210, 15, 'F');
        doc.setTextColor(255, 107, 53);
        doc.setFontSize(18);
        doc.text(title.toUpperCase(), 105, 50, { align: 'center' });
        
        let yPosition = 65;
        let pageNumber = 1;

        // Function to check page break
        const checkPageBreak = (requiredSpace = 20) => {
            if (yPosition > (287 - requiredSpace)) {
                doc.addPage();
                yPosition = 20;
                pageNumber++;
                return true;
            }
            return false;
        };

        // Function to add decorative section header
        const addSectionHeader = (title, emoji = '') => {
            checkPageBreak(15);
            
            // Orange background for header
            doc.setFillColor(255, 107, 53);
            doc.rect(15, yPosition - 3, 180, 10, 'F');
            
            // White text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(emoji + ' ' + title.toUpperCase(), 25, yPosition + 2);
            
            yPosition += 15;
        };

        // Function to add formatted paragraph
        const addFormattedParagraph = (text, options = {}) => {
            const {
                isBold = false,
                marginLeft = 20,
                fontSize = 10,
                spacing = 8
            } = options;

            checkPageBreak(30);

            doc.setFontSize(fontSize);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, isBold ? 'bold' : 'normal');

            const lines = doc.splitTextToSize(text, 170);
            doc.text(lines, marginLeft, yPosition);
            yPosition += (lines.length * (fontSize / 2.5)) + spacing;
        };

        // Function to add bullet points
        const addBulletList = (items, title = '') => {
            if (title) {
                addFormattedParagraph(title, { isBold: true, fontSize: 11, spacing: 4 });
            }

            items.forEach((item, index) => {
                checkPageBreak(15);

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                
                // Orange bullet
                doc.setTextColor(255, 107, 53);
                doc.setFont(undefined, 'bold');
                doc.text('➤', 22, yPosition);
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'normal');

                const lines = doc.splitTextToSize(item, 160);
                doc.text(lines, 30, yPosition);
                yPosition += (lines.length * 4) + 6;
            });
            yPosition += 8;
        };

        // Function to add numbered list
        const addNumberedList = (items, title = '') => {
            if (title) {
                addFormattedParagraph(title, { isBold: true, fontSize: 11, spacing: 4 });
            }

            items.forEach((item, index) => {
                checkPageBreak(15);

                // Orange number
                doc.setTextColor(255, 107, 53);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`${index + 1}.`, 22, yPosition);
                
                // Black text
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'normal');

                const lines = doc.splitTextToSize(item, 160);
                doc.text(lines, 30, yPosition);
                yPosition += (lines.length * 4) + 6;
            });
            yPosition += 10;
        };

        // Get recipe data from DOM
        const recipeContainer = document.querySelector('.recipe-container');
        
        // Add ingredients section
        addSectionHeader('INGREDIENTS', '📋');
        
        const ingredients = Array.from(recipeContainer.querySelectorAll('.ingredient-item'));
        if (ingredients.length > 0) {
            const ingredientTexts = ingredients.map(ingredient => ingredient.textContent);
            addBulletList(ingredientTexts);
        }

        // Add instructions section
        addSectionHeader('INSTRUCTIONS', '👨‍🍳');
        
        const instructions = Array.from(recipeContainer.querySelectorAll('.instruction-item'));
        if (instructions.length > 0) {
            const instructionTexts = instructions.map(instruction => {
                const stepText = instruction.querySelector('.step-text').textContent;
                return stepText;
            });
            addNumberedList(instructionTexts);
        }

        // Add tips section
        const tips = Array.from(recipeContainer.querySelectorAll('.tip-item'));
        if (tips.length > 0) {
            addSectionHeader("CHEF'S TIPS", '💡');
            const tipTexts = tips.map(tip => tip.textContent);
            addBulletList(tipTexts);
        }

        // Add nutrition section
        const nutritionItems = Array.from(recipeContainer.querySelectorAll('.nutrition-item'));
        if (nutritionItems.length > 0) {
            addSectionHeader('NUTRITION INFORMATION', '🥗');
            
            nutritionItems.forEach(item => {
                checkPageBreak(15);
                const value = item.querySelector('.nutrition-value').textContent;
                const label = item.querySelector('.nutrition-label').textContent;
                
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.setFont(undefined, 'bold');
                doc.text(`${label}:`, 22, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(value, 60, yPosition);
                yPosition += 8;
            });
        }

        // Add professional footer on each page
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Orange footer line
            doc.setDrawColor(255, 107, 53);
            doc.setLineWidth(0.5);
            doc.line(15, 280, 195, 280);
            
            // Page info
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${totalPages}`, 105, 285, { align: 'center' });
            
            // Generation info
            doc.setFontSize(7);
            doc.text(`Generated by Celestique AI Premium • ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
            doc.text(' •  Sooban Talha Technologies • ', 105, 295, { align: 'center' });
        }

        // Save the PDF
        doc.save(`CelestiqueAI_Recipe_${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    }

    showThinking() {
        this.thinkingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideThinking() {
        this.thinkingIndicator.style.display = 'none';
    }

    showError(message) {
        const errorMessage = `
            <div class="error-message">
                <h3>Connection Issue</h3>
                <p>${this.escapeHtml(message)}</p>
                <p>Please check your internet connection and try again.</p>
            </div>
        `;
        this.addMessage(errorMessage, 'ai');
    }

    clearChat() {
        this.animateButton(this.clearChatBtn);
        setTimeout(() => {
            this.chatMessages.innerHTML = '';
            this.conversationHistory = [];
            this.welcomeArea.style.display = 'block';
            this.messagesContainer.style.display = 'none';
        }, 300);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTo({
                top: this.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
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

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const icon = document.querySelector('.theme-toggle i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun';
            document.documentElement.style.setProperty('--primary-bg', '#ffffff');
            document.documentElement.style.setProperty('--secondary-bg', '#f8f9fa');
            document.documentElement.style.setProperty('--surface-bg', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#202124');
            document.documentElement.style.setProperty('--text-secondary', '#5f6368');
            document.documentElement.style.setProperty('--text-muted', '#80868b');
            document.documentElement.style.setProperty('--border-color', '#dadce0');
            document.documentElement.style.setProperty('--ai-message-bg', '#f8f9fa');
            document.documentElement.style.setProperty('--user-message-bg', '#e8f0fe');
        } else {
            icon.className = 'fas fa-moon';
            document.documentElement.style.setProperty('--primary-bg', '#0a0a0a');
            document.documentElement.style.setProperty('--secondary-bg', '#141414');
            document.documentElement.style.setProperty('--surface-bg', '#1f1f1f');
            document.documentElement.style.setProperty('--text-primary', '#f5f5f5');
            document.documentElement.style.setProperty('--text-secondary', '#cccccc');
            document.documentElement.style.setProperty('--text-muted', '#888888');
            document.documentElement.style.setProperty('--border-color', '#333333');
            document.documentElement.style.setProperty('--ai-message-bg', '#252525');
            document.documentElement.style.setProperty('--user-message-bg', '#1a1a1a');
        }
    }
}

// Initialize the app
const celestiqueAI = new CelestiqueAI();

// Make available globally
window.celestiqueAI = celestiqueAI;