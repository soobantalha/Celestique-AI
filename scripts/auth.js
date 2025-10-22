// Professional Authentication System
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
        // Form switching
        document.querySelectorAll('.switch-form').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm(e.target.dataset.form);
            });
        });

        // Login form
        document.querySelector('#loginForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.querySelector('#signupForm form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });
    }

    switchForm(formType) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        // Show target form
        document.getElementById(formType + 'Form').classList.add('active');
    }

    handleLogin() {
        const form = document.querySelector('#loginForm form');
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

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
        const form = document.querySelector('#signupForm form');
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('User already exists with this email', 'error');
            return;
        }

        const newUser = {
            id: this.generateId(),
            name,
            email,
            password,
            joinDate: new Date().toISOString(),
            preferences: {
                defaultModel: 'deepseek',
                theme: 'dark'
            },
            stats: {
                recipesGenerated: 0,
                totalChats: 0
            },
            chatHistory: []
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
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    }

    showApp() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        this.updateUserInterface();
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user info
        document.getElementById('sidebarUserName').textContent = this.currentUser.name;
        
        // Update settings form
        const defaultModelSelect = document.getElementById('defaultModelSelect');
        if (defaultModelSelect) {
            defaultModelSelect.value = this.currentUser.preferences.defaultModel;
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    backdrop-filter: blur(20px);
                    max-width: 300px;
                }
                .notification-success { border-left: 4px solid var(--accent); }
                .notification-error { border-left: 4px solid var(--error); }
                .notification-info { border-left: 4px solid var(--primary); }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

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
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});