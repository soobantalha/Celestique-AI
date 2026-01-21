/**
 * CELESTIQUE AI - APPLICATION CONTROLLER
 * Property of Sooban Talha Technologies
 * * Manages UI State, User Persistence, PDF Generation, and Logic Binding.
 */

class CelestiqueApp {
    constructor() {
        // State
        this.user = {
            name: localStorage.getItem('celestique_user_name') || null,
            history: JSON.parse(localStorage.getItem('celestique_history') || '[]')
        };
        this.currentRecipe = null;
        
        // DOM Elements Map
        this.ui = {
            welcome: document.getElementById('welcome-overlay'),
            inputGroup: document.getElementById('name-input-group'),
            typingText: document.getElementById('welcome-message'),
            root: document.getElementById('app-root'),
            prompt: document.getElementById('recipe-prompt'),
            generateBtn: document.getElementById('btn-generate'),
            loader: document.getElementById('loader-state'),
            loaderText: document.getElementById('loader-text'),
            resultSection: document.getElementById('recipe-result'),
            recipeContent: document.getElementById('recipe-content'),
            greeting: document.getElementById('dynamic-greeting'),
            historyList: document.getElementById('history-list'),
            drawer: document.getElementById('history-drawer'),
            backdrop: document.getElementById('drawer-backdrop')
        };

        this.init();
    }

    init() {
        this.checkWelcomeFlow();
        this.setupEventListeners();
        this.renderHistory();
        
        // Theme Check
        if (localStorage.getItem('celestique_theme') === 'light') {
            document.body.setAttribute('data-theme', 'light');
        }
    }

    // --- WELCOME FLOW ---
    checkWelcomeFlow() {
        if (this.user.name) {
            // User exists - skip welcome
            this.ui.welcome.style.display = 'none';
            this.ui.root.classList.remove('blur-bg');
            this.updateGreeting();
        } else {
            // First time user - Typewriter effect
            this.typewriter("Hello. Before we cook memories together... what should I call you?", this.ui.typingText, () => {
                this.ui.inputGroup.classList.add('visible');
            });
        }
    }

    saveUserName() {
        const input = document.getElementById('user-name');
        const name = input.value.trim();
        if (name) {
            this.user.name = name;
            localStorage.setItem('celestique_user_name', name);
            
            // Fade out welcome
            this.ui.welcome.classList.add('fade-out');
            setTimeout(() => {
                this.ui.welcome.style.display = 'none';
                this.ui.root.classList.remove('blur-bg');
                this.updateGreeting();
            }, 1000);
        }
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let timeGreeting = "Hello";
        if (hour < 12) timeGreeting = "Good Morning";
        else if (hour < 18) timeGreeting = "Good Afternoon";
        else timeGreeting = "Good Evening";

        this.ui.greeting.innerText = `${timeGreeting}, Chef ${this.user.name}.`;
    }

    // --- RECIPE GENERATION ORCHESTRATION ---
    async handleGenerate() {
        const prompt = this.ui.prompt.value.trim();
        if (!prompt) return;

        // UI State: Loading
        this.ui.resultSection.classList.add('hidden');
        this.ui.loader.classList.remove('hidden');
        
        // Cycle loading messages
        const msgs = ["Gathering ingredients...", "Consulting culinary history...", "Balancing flavors...", "Plating your masterpiece..."];
        let msgIdx = 0;
        const msgInterval = setInterval(() => {
            this.ui.loaderText.innerText = msgs[msgIdx % msgs.length];
            msgIdx++;
        }, 800);
        
        // Simulate Processing Time (for realism and weight)
        await new Promise(r => setTimeout(r, 3000));
        clearInterval(msgInterval);

        // Use the Engine (from api/recipe.js)
        // Defensive check
        if (typeof window.CelestiqueEngine === 'undefined') {
            alert("Engine Error: Reload page.");
            return;
        }

        const recipe = window.CelestiqueEngine.generate(prompt, this.user.name);
        
        // Save to History
        this.addToHistory(recipe);
        
        // Render
        this.renderRecipe(recipe);
        
        // UI State: Show Result
        this.ui.loader.classList.add('hidden');
        this.ui.resultSection.classList.remove('hidden');
        
        // Smooth Scroll
        this.ui.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    renderRecipe(data) {
        this.currentRecipe = data; // Store for PDF
        
        // Helper for lists
        const listHTML = (items, icon="check") => items.map(i => `<div class="ingredient-item"><i class="fa-solid fa-${icon}" style="color:var(--primary)"></i> ${i}</div>`).join('');
        const stepHTML = (items) => items.map((step, i) => `<div class="step-item"><span class="step-num">Step ${i+1}:</span> ${step}</div>`).join('');
        const cardHTML = (obj) => Object.entries(obj).map(([k, v]) => `<div class="info-card"><strong>${k}</strong>${v}</div>`).join('');

        const html = `
            <div class="recipe-header">
                <h2 class="recipe-title-text">${data.title}</h2>
                <p class="recipe-emotional-desc">"${data.intro}"</p>
                <div class="recipe-meta-grid">
                    <div class="meta-item"><i class="fa-solid fa-earth-americas"></i> ${data.cuisine}</div>
                    <div class="meta-item"><i class="fa-regular fa-clock"></i> ${data.cookingTime}</div>
                    <div class="meta-item"><i class="fa-solid fa-fire"></i> ${data.calories}</div>
                    <div class="meta-item"><i class="fa-solid fa-layer-group"></i> ${data.difficulty}</div>
                </div>
            </div>

            <div class="recipe-body">
                <div style="margin-bottom:2rem; padding:1.5rem; background:rgba(255,255,255,0.03); border-radius:12px;">
                    <h3 class="recipe-section-title" style="margin-top:0"><i class="fa-solid fa-book-open"></i> Story & Origin</h3>
                    <p>${data.story}</p>
                </div>

                <h3 class="recipe-section-title"><i class="fa-solid fa-chart-pie"></i> Nutritional Profile</h3>
                <div class="info-grid">${cardHTML(data.macros)}</div>

                <h3 class="recipe-section-title"><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>
                <div class="ingredient-list">
                    ${listHTML(data.ingredients)}
                </div>
                <p style="margin-top:10px; font-size:0.9rem; color:var(--text-muted)"><strong>Substitutions:</strong> ${data.substitutions.join(', ')}</p>

                <h3 class="recipe-section-title"><i class="fa-solid fa-list-ol"></i> Preparation Method</h3>
                <div class="step-list">
                    ${stepHTML(data.steps)}
                </div>

                <div class="pro-tips-box">
                    <h4 style="margin-bottom:10px; color:var(--primary)"><i class="fa-solid fa-lightbulb"></i> Chef's Secret Tips</h4>
                    <ul>
                        ${data.chefSecrets.map(tip => `<li style="margin-bottom:5px">${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <h3 class="recipe-section-title"><i class="fa-solid fa-utensils"></i> Serving & Storage</h3>
                <div class="info-grid">
                    <div class="info-card"><strong>Pairing</strong>${data.pairings}</div>
                    <div class="info-card"><strong>Storage</strong>${data.storage}</div>
                </div>
                
                <div style="margin-top:3rem; text-align:center; font-style:italic; color:var(--text-muted); border-top:1px solid var(--border); padding-top:2rem;">
                    "${data.finalMessage}"
                </div>
            </div>
        `;

        this.ui.recipeContent.innerHTML = html;
        document.getElementById('result-actions').classList.remove('hidden');
    }

    // --- PDF SYSTEM ---
    generatePDF() {
        if (!this.currentRecipe) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const r = this.currentRecipe;
        let y = 20; // Vertical cursor

        // Branding Header
        doc.setFillColor(255, 107, 107); // Brand Color
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("times", "bold");
        doc.setFontSize(24);
        doc.text("Celestique AI", 105, 25, null, null, "center");
        doc.setFontSize(10);
        doc.text("Powered by Sooban Talha Technologies", 105, 35, null, null, "center");

        // Title & Intro
        y = 60;
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text(r.title, 20, y);
        
        y += 10;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(100);
        const splitIntro = doc.splitTextToSize(r.intro, 170);
        doc.text(splitIntro, 20, y);
        y += splitIntro.length * 5 + 10;

        // Meta Data Line
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        doc.text(`Time: ${r.cookingTime}  |  Servings: ${r.servingSize}  |  Calories: ${r.calories}`, 20, y);
        y += 15;

        // Ingredients
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text("Ingredients", 20, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        r.ingredients.forEach(ing => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`• ${ing}`, 25, y);
            y += 6;
        });

        // Steps
        y += 10;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Instructions", 20, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        
        r.steps.forEach((step, i) => {
            const stepText = `${i+1}. ${step}`;
            const splitStep = doc.splitTextToSize(stepText, 170);
            if (y + (splitStep.length * 6) > 280) { doc.addPage(); y = 20; }
            doc.text(splitStep, 25, y);
            y += (splitStep.length * 6) + 4;
        });

        // Chef Secrets
        y += 10;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setDrawColor(255, 107, 107);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Chef's Secrets", 20, y);
        y += 8;
        doc.setFont("helvetica", "italic");
        r.chefSecrets.forEach(tip => {
            doc.text(`* ${tip}`, 25, y);
            y += 6;
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Generated by Celestique AI | soobantalhatech.xyz", 105, 290, null, null, "center");

        // Save
        doc.save(`${r.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    }

    // --- HISTORY MANAGEMENT ---
    addToHistory(recipe) {
        // Add timestamp
        recipe.timestamp = new Date().toLocaleString();
        this.user.history.unshift(recipe);
        if (this.user.history.length > 20) this.user.history.pop(); // Max 20
        localStorage.setItem('celestique_history', JSON.stringify(this.user.history));
        this.renderHistory();
    }

    renderHistory() {
        this.ui.historyList.innerHTML = '';
        if (this.user.history.length === 0) {
            this.ui.historyList.innerHTML = '<div class="empty-state" style="padding:20px; text-align:center; color:var(--text-muted)">No recipes yet.</div>';
            return;
        }

        this.user.history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-card';
            el.innerHTML = `
                <div style="font-weight:bold; color:var(--primary); margin-bottom:4px;">${item.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted)">${item.cuisine} • ${item.cookingTime}</div>
                <div style="font-size:0.65rem; color:var(--text-muted); opacity:0.7; margin-top:4px;">${item.timestamp}</div>
            `;
            el.onclick = () => {
                this.renderRecipe(item);
                this.closeDrawer();
                this.ui.resultSection.classList.remove('hidden');
                this.ui.resultSection.scrollIntoView();
            };
            this.ui.historyList.appendChild(el);
        });
    }

    // --- UTILS & EVENT BINDING ---
    setupEventListeners() {
        // Start Journey
        document.getElementById('btn-start-journey').addEventListener('click', () => this.saveUserName());
        
        // Enter key on input
        document.getElementById('user-name').addEventListener('keydown', (e) => {
            if(e.key === 'Enter') this.saveUserName();
        });

        // Generate
        this.ui.generateBtn.addEventListener('click', () => this.handleGenerate());

        // Quick Chips
        document.querySelectorAll('.chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.ui.prompt.value = e.target.dataset.prompt;
                this.handleGenerate();
            });
        });

        // PDF & Reset
        document.getElementById('btn-download-pdf').addEventListener('click', () => this.generatePDF());
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.ui.resultSection.classList.add('hidden');
            this.ui.prompt.value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Drawer Logic
        const toggleDrawer = () => {
            this.ui.drawer.classList.add('open');
            this.ui.backdrop.classList.add('active');
        };
        document.getElementById('btn-history-toggle').addEventListener('click', toggleDrawer);
        document.getElementById('btn-close-drawer').addEventListener('click', () => this.closeDrawer());
        this.ui.backdrop.addEventListener('click', () => this.closeDrawer());

        // Theme Toggle
        document.getElementById('btn-theme-toggle').addEventListener('click', () => {
            const body = document.body;
            if (body.hasAttribute('data-theme')) {
                body.removeAttribute('data-theme');
                localStorage.setItem('celestique_theme', 'dark');
            } else {
                body.setAttribute('data-theme', 'light');
                localStorage.setItem('celestique_theme', 'light');
            }
        });
    }

    closeDrawer() {
        this.ui.drawer.classList.remove('open');
        this.ui.backdrop.classList.remove('active');
    }

    typewriter(text, element, callback) {
        let i = 0;
        element.innerHTML = '';
        const speed = 40; 
        
        const type = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        };
        type();
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CelestiqueApp();
});