// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('celestique_users')) || [];
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('celestique_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
        }
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserDropdown();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Profile menu item
        document.querySelector('.dropdown-item[href="#profile"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProfileModal();
        });

        // Close profile modal
        document.getElementById('closeProfileModal').addEventListener('click', () => {
            this.hideProfileModal();
        });

        document.getElementById('cancelProfileEdit').addEventListener('click', () => {
            this.hideProfileModal();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeUserDropdown();
        });
    }

    switchAuthTab(tab) {
        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // Show active form
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('celestique_current_user', JSON.stringify(user));
            this.showApp();
            this.showNotification('Welcome back!', 'success');
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const preferences = Array.from(document.getElementById('signupPreferences').selectedOptions)
            .map(option => option.value);

        // Check if user already exists
        if (this.users.find(u => u.email === email)) {
            this.showNotification('User already exists with this email', 'error');
            return;
        }

        const newUser = {
            id: this.generateId(),
            name,
            email,
            password,
            preferences,
            avatar: this.generateAvatar(name),
            joinDate: new Date().toISOString(),
            stats: {
                recipesGenerated: 0,
                favorites: 0,
                timeSaved: 0,
                level: 'Beginner'
            },
            recipeHistory: []
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        
        localStorage.setItem('celestique_users', JSON.stringify(this.users));
        localStorage.setItem('celestique_current_user', JSON.stringify(newUser));
        
        this.showApp();
        this.showNotification('Account created successfully!', 'success');
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('celestique_current_user');
        this.showAuth();
        this.showNotification('Logged out successfully', 'info');
    }

    showAuth() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }

    showApp() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        this.updateUserInterface();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user info in header
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        
        // Update dashboard stats
        document.getElementById('userRecipesCount').textContent = this.currentUser.stats.recipesGenerated;
        document.getElementById('userFavoritesCount').textContent = this.currentUser.stats.favorites;
        document.getElementById('userTimeSaved').textContent = `${this.currentUser.stats.timeSaved}h`;
        document.getElementById('userLevel').textContent = this.currentUser.stats.level;

        // Update profile modal if open
        this.updateProfileModal();
    }

    updateProfileModal() {
        document.getElementById('profileName').value = this.currentUser.name;
        document.getElementById('profileEmail').value = this.currentUser.email;
        
        const preferencesSelect = document.getElementById('profilePreferences');
        Array.from(preferencesSelect.options).forEach(option => {
            option.selected = this.currentUser.preferences.includes(option.value);
        });
        
        document.getElementById('profileAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    closeUserDropdown() {
        document.getElementById('userDropdown').classList.remove('show');
    }

    showProfileModal() {
        this.updateProfileModal();
        document.getElementById('profileModal').classList.add('show');
    }

    hideProfileModal() {
        document.getElementById('profileModal').classList.remove('show');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateAvatar(name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=fff`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // User data management methods
    addRecipeToHistory(recipe) {
        if (!this.currentUser) return;

        const recipeHistoryItem = {
            id: this.generateId(),
            recipe,
            generatedAt: new Date().toISOString(),
            model: recipe.model || 'deepseek',
            favorite: false
        };

        this.currentUser.recipeHistory.unshift(recipeHistoryItem);
        this.currentUser.stats.recipesGenerated++;
        
        // Update time saved (estimate 30 minutes per recipe)
        this.currentUser.stats.timeSaved += 0.5;
        
        // Update level based on recipes generated
        this.updateUserLevel();
        
        this.saveUserData();
        this.updateUserInterface();
    }

    updateUserLevel() {
        const recipes = this.currentUser.stats.recipesGenerated;
        if (recipes >= 50) this.currentUser.stats.level = 'Master Chef';
        else if (recipes >= 25) this.currentUser.stats.level = 'Expert';
        else if (recipes >= 10) this.currentUser.stats.level = 'Intermediate';
        else this.currentUser.stats.level = 'Beginner';
    }

    saveUserData() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('celestique_users', JSON.stringify(this.users));
            localStorage.setItem('celestique_current_user', JSON.stringify(this.currentUser));
        }
    }

    getRecipeHistory() {
        return this.currentUser ? this.currentUser.recipeHistory : [];
    }

    toggleFavorite(recipeId) {
        if (!this.currentUser) return;

        const recipe = this.currentUser.recipeHistory.find(r => r.id === recipeId);
        if (recipe) {
            recipe.favorite = !recipe.favorite;
            this.currentUser.stats.favorites += recipe.favorite ? 1 : -1;
            this.saveUserData();
            this.updateUserInterface();
        }
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});