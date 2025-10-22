// Professional Chat Application
class CelestiqueApp {
    constructor() {
        this.selectedModel = 'deepseek';
        this.currentChat = [];
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.updateModelDisplay();
    }

    setupEventListeners() {
        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.newChat();
        });

        // Send message
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in message input
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('messageInput').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
        });

        // Model selector
        document.getElementById('modelSelectorBtn').addEventListener('click', () => {
            this.showModelModal();
        });

        document.getElementById('confirmModelSelect').addEventListener('click', () => {
            this.confirmModelSelection();
        });

        document.getElementById('cancelModelSelect').addEventListener('click', () => {
            this.hideModelModal();
        });

        // Model options
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectModelOption(e.currentTarget.dataset.model);
            });
        });

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Clear chat
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearChat();
        });

        // Quick suggestions
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                document.getElementById('messageInput').value = prompt;
                this.sendMessage();
            });
        });
    }

    newChat() {
        this.currentChat = [];
        this.clearChatMessages();
        this.showWelcomeMessage();
    }

    clearChat() {
        if (this.currentChat.length > 0) {
            if (confirm('Are you sure you want to clear this chat?')) {
                this.newChat();
            }
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || this.isGenerating) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        messageInput.value = '';
        this.autoResizeTextarea(messageInput);

        // Show typing indicator
        this.showTypingIndicator();

        this.isGenerating = true;
        document.getElementById('sendButton').disabled = true;

        try {
            const response = await this.generateRecipe(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I encountered an error while generating your recipe. Please try again.', 'bot');
            console.error('Error:', error);
        }

        this.isGenerating = false;
        document.getElementById('sendButton').disabled = false;
    }

    async generateRecipe(message) {
        if (!window.authSystem || !window.authSystem.currentUser) {
            throw new Error('User not authenticated');
        }

        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message,
                model: this.selectedModel,
                userPreferences: []
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Format the recipe response
        return this.formatRecipeResponse(data);
    }

    formatRecipeResponse(recipe) {
        if (recipe.error) {
            return `I'm sorry, I couldn't generate a recipe. Error: ${recipe.error}`;
        }

        let response = `**${recipe.name}**\n\n`;
        
        if (recipe.cuisine) response += `*Cuisine: ${recipe.cuisine}*\n`;
        if (recipe.difficulty) response += `*Difficulty: ${recipe.difficulty}*\n`;
        if (recipe.prep_time) response += `*Prep Time: ${recipe.prep_time}*\n`;
        if (recipe.cook_time) response += `*Cook Time: ${recipe.cook_time}*\n`;
        if (recipe.serves) response += `*Serves: ${recipe.serves}*\n\n`;

        response += `## Ingredients\n`;
        recipe.ingredients.forEach(ingredient => {
            response += `• ${ingredient}\n`;
        });

        response += `\n## Instructions\n`;
        recipe.instructions.forEach((step, index) => {
            response += `${index + 1}. ${step}\n`;
        });

        if (recipe.chef_tips && recipe.chef_tips.length > 0) {
            response += `\n## Chef's Tips\n`;
            recipe.chef_tips.forEach(tip => {
                response += `💡 ${tip}\n`;
            });
        }

        response += `\n---\n*Powered by Célestique AI - Sooban Talha Productions*`;

        return response;
    }

    addMessage(content, role) {
        const chatMessages = document.getElementById('chatMessages');
        
        // Remove welcome message if it's the first user message
        if (role === 'user') {
            const welcomeMessage = chatMessages.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Convert markdown-like formatting to HTML
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to current chat
        this.currentChat.push({ role, content });
    }

    formatMessage(content) {
        // Simple markdown parsing
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/## (.*?)\n/g, '<h3>$1</h3>')
            .replace(/\n/g, '<br>')
            .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
            .replace(/(\d+)\. (.*?)(?=\n|$)/g, '<li>$2</li>')
            .replace(/<li>.*<\/li>/gs, '<ul>$&</ul>')
            .replace(/💡 (.*?)(?=\n|$)/g, '<div class="tip">💡 $1</div>')
            .replace(/---/g, '<hr>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content typing-indicator';
        messageContent.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>Célestique AI is cooking...</span>
        `;

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-utensils"></i>
                </div>
                <h1>Hello! I'm Célestique AI</h1>
                <p>Your personal AI chef. What would you like to cook today?</p>
                
                <div class="quick-suggestions">
                    <div class="suggestion-grid">
                        <button class="suggestion-card" data-prompt="Create a chocolate lava cake recipe">
                            <i class="fas fa-cookie"></i>
                            <span>Chocolate Lava Cake</span>
                        </button>
                        <button class="suggestion-card" data-prompt="Make a healthy chicken stir fry">
                            <i class="fas fa-drumstick-bite"></i>
                            <span>Chicken Stir Fry</span>
                        </button>
                        <button class="suggestion-card" data-prompt="Vegetarian pasta recipe">
                            <i class="fas fa-pasta"></i>
                            <span>Vegetarian Pasta</span>
                        </button>
                        <button class="suggestion-card" data-prompt="Traditional biryani recipe">
                            <i class="fas fa-utensil-spoon"></i>
                            <span>Biryani</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Re-attach event listeners to suggestion cards
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                document.getElementById('messageInput').value = prompt;
                this.sendMessage();
            });
        });
    }

    clearChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
    }

    showModelModal() {
        document.getElementById('modelModal').classList.add('show');
    }

    hideModelModal() {
        document.getElementById('modelModal').classList.remove('show');
    }

    selectModelOption(model) {
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.remove('active');
        });
        
        document.querySelector(`.model-option[data-model="${model}"]`).classList.add('active');
    }

    confirmModelSelection() {
        const selectedOption = document.querySelector('.model-option.active');
        if (selectedOption) {
            this.selectedModel = selectedOption.dataset.model;
            this.updateModelDisplay();
            this.hideModelModal();
            this.showNotification(`Switched to ${this.getModelName(this.selectedModel)}`, 'success');
        }
    }

    updateModelDisplay() {
        const modelName = this.getModelName(this.selectedModel);
        document.getElementById('currentModel').textContent = modelName;
        document.getElementById('currentModelBadge').textContent = modelName;
    }

    getModelName(model) {
        const models = {
            deepseek: 'DeepSeek Chef',
            gemini: 'Gemini Gourmet',
            claude: 'Claude Cuisine'
        };
        return models[model] || 'DeepSeek Chef';
    }

    showSettingsModal() {
        document.getElementById('settingsModal').classList.add('show');
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    saveSettings() {
        if (window.authSystem && window.authSystem.currentUser) {
            const defaultModel = document.getElementById('defaultModelSelect').value;
            window.authSystem.currentUser.preferences.defaultModel = defaultModel;
            window.authSystem.saveUserData();
            this.showNotification('Settings saved successfully', 'success');
            this.hideSettingsModal();
        }
    }

    loadChatHistory() {
        // Load user's chat history
        if (window.authSystem && window.authSystem.currentUser) {
            const historyList = document.getElementById('historyList');
            const history = window.authSystem.currentUser.chatHistory.slice(0, 10);
            
            if (history.length === 0) {
                historyList.innerHTML = '<div class="history-item">No recent chats</div>';
            } else {
                historyList.innerHTML = history.map(chat => `
                    <div class="history-item">${chat.title}</div>
                `).join('');
            }
        }
    }

    showNotification(message, type = 'info') {
        if (window.authSystem) {
            window.authSystem.showNotification(message, type);
        }
    }
}

// Add typing indicator styles
const typingStyles = document.createElement('style');
typingStyles.textContent = `
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-secondary);
    }
    
    .typing-dots {
        display: flex;
        gap: 4px;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-secondary);
        animation: typingBounce 1.4s infinite ease-in-out both;
    }
    
    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    .typing-dots span:nth-child(3) { animation-delay: 0s; }
    
    @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
    }
    
    .message-content .tip {
        background: rgba(16, 163, 127, 0.1);
        border: 1px solid rgba(16, 163, 127, 0.2);
        border-radius: 6px;
        padding: 8px 12px;
        margin: 8px 0;
    }
    
    .message-content ul {
        margin: 8px 0;
        padding-left: 20px;
    }
    
    .message-content li {
        margin: 4px 0;
    }
    
    .message-content h3 {
        margin: 16px 0 8px 0;
        font-size: 1.1em;
        font-weight: 600;
    }
    
    .message-content hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 16px 0;
    }
`;
document.head.appendChild(typingStyles);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CelestiqueApp();
});