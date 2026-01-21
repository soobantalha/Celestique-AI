/**
 * CELESTIQUE AI v4.0 - ADVANCED CONTROLLER
 * Property of Sooban Talha Technologies
 * * Features:
 * - Robust Welcome Flow
 * - Magazine-Style DOM Generation
 * - Favorites & History Management
 * - Toast Notification System
 * - Theme Management
 */

class CelestiqueApp {
    constructor() {
        // State Management
        this.user = {
            name: localStorage.getItem('celestique_name') || null,
            history: JSON.parse(localStorage.getItem('celestique_history') || '[]'),
            favorites: JSON.parse(localStorage.getItem('celestique_favorites') || '[]')
        };
        this.currentRecipe = null;
        this.isDark = localStorage.getItem('celestique_theme') !== 'light';

        // DOM Map
        this.dom = {
            welcomeOverlay: document.getElementById('welcome-overlay'),
            welcomeMsg: document.getElementById('welcome-message'),
            inputWrapper: document.getElementById('name-input-wrapper'),
            nameInput: document.getElementById('user-name-input'),
            confirmNameBtn: document.getElementById('btn-confirm-name'),
            appRoot: document.getElementById('app-root'),
            greeting: document.getElementById('dynamic-greeting'),
            promptInput: document.getElementById('prompt-input'),
            generateBtn: document.getElementById('btn-generate'),
            processingView: document.getElementById('processing-view'),
            resultView: document.getElementById('result-view'),
            recipeContainer: document.getElementById('recipe-container'),
            loadingBar: document.querySelector('.progress-fill'),
            loadingStatus: document.getElementById('loading-status'),
            drawers: {
                history: document.getElementById('drawer-history'),
                favorites: document.getElementById('drawer-favorites')
            },
            lists: {
                history: document.getElementById('history-list'),
                favorites: document.getElementById('favorites-list')
            },
            backdrop: document.getElementById('backdrop'),
            toastContainer: document.getElementById('toast-container')
        };

        this.init();
    }

    init() {
        this.applyTheme();
        this.checkWelcome();
        this.setupListeners();
        this.renderLists();
    }

    // --- WELCOME FLOW (FIXED) ---
    checkWelcome() {
        if (this.user.name) {
            this.dom.welcomeOverlay.classList.add('hidden');
            this.dom.appRoot.classList.remove('blur-state');
            this.updateGreeting();
        } else {
            // Typing effect then show input
            this.typewriter("Hello. Before we create magic... what is your name?", this.dom.welcomeMsg, () => {
                this.dom.inputWrapper.classList.add('visible');
                this.dom.nameInput.focus();
            });
        }
    }

    saveName() {
        const name = this.dom.nameInput.value.trim();
        if (name) {
            this.user.name = name;
            localStorage.setItem('celestique_name', name);
            
            // Animation out
            this.dom.welcomeOverlay.style.opacity = '0';
            setTimeout(() => {
                this.dom.welcomeOverlay.classList.add('hidden');
                this.dom.appRoot.classList.remove('blur-state');
                this.updateGreeting();
                this.showToast(`Welcome, Chef ${name}`);
            }, 800);
        } else {
            this.dom.nameInput.style.borderColor = 'var(--primary)';
            setTimeout(() => this.dom.nameInput.style.borderColor = 'rgba(255,255,255,0.2)', 1000);
        }
    }

    updateGreeting() {
        const h = new Date().getHours();
        const time = h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
        this.dom.greeting.innerText = `Good ${time}, Chef ${this.user.name}.`;
    }

    // --- GENERATION LOGIC ---
    async handleGenerate() {
        const prompt = this.dom.promptInput.value.trim();
        if (!prompt) {
            this.showToast("Please describe a recipe first!", "error");
            return;
        }

        // UI State: Loading
        this.dom.resultView.classList.add('hidden');
        this.dom.processingView.classList.remove('hidden');
        this.dom.promptInput.value = ''; // clear
        
        // Progress Simulation
        let width = 0;
        const statusMsgs = ["Sourcing ingredients...", "Consulting culinary history...", "Balancing flavors...", "Plating dish..."];
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            this.dom.loadingBar.style.width = width + '%';
            this.dom.loadingStatus.innerText = statusMsgs[Math.floor((width/100) * statusMsgs.length)] || "Finishing up...";
        }, 300);

        // Wait (Fake API delay)
        await new Promise(r => setTimeout(r, 2500));
        clearInterval(interval);

        // Generate
        if (!window.CelestiqueEngine) return alert("Engine Error");
        const recipe = window.CelestiqueEngine.generate(prompt, this.user.name);
        
        // Save
        this.addToHistory(recipe);
        
        // Render
        this.renderRecipePremium(recipe);
        
        // UI Switch
        this.dom.processingView.classList.add('hidden');
        this.dom.resultView.classList.remove('hidden');
        this.dom.loadingBar.style.width = '0%';
        
        // Scroll to result
        this.dom.resultView.scrollIntoView({ behavior: 'smooth' });
    }

    // --- PREMIUM RENDERING (The Magazine Layout) ---
    renderRecipePremium(data) {
        this.currentRecipe = data;
        
        // Dynamic HTML Construction
        const html = `
            <div class="recipe-header-block">
                <div class="meta-pill-container">
                    <span class="meta-pill"><i class="fa-solid fa-earth-americas"></i> ${data.cuisine}</span>
                    <span class="meta-pill"><i class="fa-solid fa-fire"></i> ${data.calories}</span>
                    <span class="meta-pill"><i class="fa-regular fa-clock"></i> ${data.totalTime}</span>
                </div>
                <h1 class="recipe-super-title">${data.title}</h1>
                <p class="recipe-quote">"${data.intro}"</p>
            </div>

            <div class="recipe-body-grid">
                <div class="col-main">
                    <div style="background:rgba(255,255,255,0.03); padding:2rem; border-radius:16px; margin-bottom:3rem; border-left:4px solid var(--primary);">
                        <h3 class="section-head" style="margin-top:0; border:none; font-size:1.4rem;">Story & Origin</h3>
                        <p style="color:var(--text-muted); line-height:1.8;">${data.story}</p>
                    </div>

                    <h3 class="section-head"><i class="fa-solid fa-list-ol"></i> Preparation Journey</h3>
                    <div class="steps-container">
                        ${data.steps.map((step, i) => `
                            <div class="step-row">
                                <div class="step-marker">${i+1}</div>
                                <div class="step-content">
                                    <h4>Step ${i+1}</h4>
                                    <p>${step}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="pro-tips-box" style="margin-top:3rem; background: rgba(255, 107, 107, 0.08); border: 1px solid rgba(255, 107, 107, 0.2); padding: 2rem; border-radius: 16px;">
                        <h4 style="color:var(--primary); margin-bottom:1rem;"><i class="fa-solid fa-lightbulb"></i> Chef's Secrets</h4>
                        <ul style="padding-left:20px; color:var(--text-muted);">
                            ${data.tips.map(t => `<li style="margin-bottom:8px;">${t}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="col-sidebar">
                    <div class="ingredients-card">
                        <h3 class="section-head"><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>
                        <div class="ingredients-grid" style="grid-template-columns: 1fr;">
                            ${data.ingredients.map(ing => `
                                <div class="ingredient-check-item" onclick="this.classList.toggle('checked')">
                                    <div class="custom-checkbox"><i class="fa-solid fa-check" style="font-size:10px; color:white;"></i></div>
                                    <span>${ing}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p style="margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
                            <strong>Substitutions:</strong> ${data.substitutions}
                        </p>
                    </div>

                    <div style="margin-top:2rem;">
                        <h3 class="section-head" style="font-size:1.4rem;">Nutrition</h3>
                        <div class="nutrition-row">
                            <div class="macro-circle">
                                <div class="macro-val">${data.macros.protein}g</div>
                                <div class="macro-label">Protein</div>
                            </div>
                            <div class="macro-circle">
                                <div class="macro-val">${data.macros.carbs}g</div>
                                <div class="macro-label">Carbs</div>
                            </div>
                            <div class="macro-circle">
                                <div class="macro-val">${data.macros.fats}g</div>
                                <div class="macro-label">Fats</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top:2rem; text-align:center; padding:1.5rem; border:1px solid var(--glass-border); border-radius:16px;">
                        <div style="font-weight:bold; color:var(--primary);">Pairing Suggestion</div>
                        <div style="font-size:0.9rem; color:var(--text-muted); margin-top:5px;">${data.pairings}</div>
                    </div>
                </div>
            </div>

            <div style="text-align:center; margin-top:4rem; color:var(--text-muted); font-style:italic;">
                "${data.finalMessage}"
            </div>
        `;
        
        this.dom.recipeContainer.innerHTML = html;
    }

    // --- PDF GENERATION ---
    generatePDF() {
        if (!this.currentRecipe) return;
        const r = this.currentRecipe;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;

        // Brand Header
        doc.setFillColor(255, 107, 107);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("Celestique AI", 105, 25, null, null, "center");
        doc.setFontSize(10);
        doc.text("Sooban Talha Technologies", 105, 35, null, null, "center");

        y = 60;
        // Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.text(r.title, 20, y);
        y += 10;
        
        // Intro
        doc.setFontSize(11);
        doc.setTextColor(80);
        const intro = doc.splitTextToSize(r.intro, 170);
        doc.text(intro, 20, y);
        y += intro.length * 6 + 10;

        // Stats
        doc.setDrawColor(200);
        doc.line(20, y, 190, y);
        y += 7;
        doc.setFontSize(10);
        doc.text(`Time: ${r.totalTime}  |  Cuisine: ${r.cuisine}  |  Calories: ${r.calories}`, 20, y);
        y += 10;
        doc.line(20, y, 190, y);
        y += 15;

        // Ingredients
        doc.setFontSize(14);
        doc.setTextColor(255, 107, 107);
        doc.text("Ingredients", 20, y);
        y += 8;
        doc.setFontSize(11);
        doc.setTextColor(0);
        r.ingredients.forEach(ing => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`• ${ing}`, 25, y);
            y += 6;
        });

        // Steps
        y += 10;
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(255, 107, 107);
        doc.text("Method", 20, y);
        y += 10;
        doc.setTextColor(0);
        doc.setFontSize(11);
        r.steps.forEach((step, i) => {
            const txt = `${i+1}. ${step}`;
            const lines = doc.splitTextToSize(txt, 170);
            if (y + (lines.length * 6) > 280) { doc.addPage(); y = 20; }
            doc.text(lines, 25, y);
            y += (lines.length * 6) + 4;
        });

        doc.save(`Celestique_${r.title.substr(0, 10)}.pdf`);
        this.showToast("PDF Downloaded successfully!");
    }

    // --- DATA MANAGEMENT ---
    addToHistory(item) {
        this.user.history.unshift(item);
        if (this.user.history.length > 20) this.user.history.pop();
        localStorage.setItem('celestique_history', JSON.stringify(this.user.history));
        this.renderLists();
    }

    addToFavorites() {
        if (!this.currentRecipe) return;
        this.user.favorites.unshift(this.currentRecipe);
        localStorage.setItem('celestique_favorites', JSON.stringify(this.user.favorites));
        this.renderLists();
        this.showToast("Saved to Favorites", "success");
    }

    renderLists() {
        const render = (list, container) => {
            container.innerHTML = '';
            if (list.length === 0) {
                container.innerHTML = '<div style="text-align:center; color:var(--text-muted); margin-top:2rem;">Nothing here yet.</div>';
                return;
            }
            list.forEach(item => {
                const el = document.createElement('div');
                el.className = 'history-item';
                el.innerHTML = `
                    <div style="font-weight:bold; color:var(--primary)">${item.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted)">${item.cuisine}</div>
                `;
                el.onclick = () => {
                    this.renderRecipePremium(item);
                    this.closeDrawers();
                    this.dom.resultView.classList.remove('hidden');
                    this.dom.processingView.classList.add('hidden');
                    this.dom.resultView.scrollIntoView();
                };
                container.appendChild(el);
            });
        };
        render(this.user.history, this.dom.lists.history);
        render(this.user.favorites, this.dom.lists.favorites);
    }

    // --- UTILS ---
    showToast(msg, type='info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
        this.dom.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    applyTheme() {
        if (this.isDark) document.body.removeAttribute('data-theme');
        else document.body.setAttribute('data-theme', 'light');
    }

    typewriter(text, el, cb) {
        let i = 0; el.innerText = '';
        const t = setInterval(() => {
            el.innerText += text.charAt(i); i++;
            if (i >= text.length) { clearInterval(t); if(cb) cb(); }
        }, 35);
    }

    closeDrawers() {
        Object.values(this.dom.drawers).forEach(d => d.classList.remove('open'));
        this.dom.backdrop.classList.remove('active');
    }

    setupListeners() {
        this.dom.confirmNameBtn.addEventListener('click', () => this.saveName());
        this.dom.nameInput.addEventListener('keypress', e => { if(e.key === 'Enter') this.saveName(); });
        this.dom.generateBtn.addEventListener('click', () => this.handleGenerate());
        document.getElementById('btn-back').addEventListener('click', () => {
            this.dom.resultView.classList.add('hidden');
            window.scrollTo({top:0, behavior:'smooth'});
        });
        document.getElementById('btn-download-pdf').addEventListener('click', () => this.generatePDF());
        document.getElementById('btn-save-fav').addEventListener('click', () => this.addToFavorites());
        
        // Chips
        document.querySelectorAll('.chip').forEach(c => {
            c.addEventListener('click', () => {
                this.dom.promptInput.value = c.dataset.val;
                this.handleGenerate();
            });
        });

        // Drawers
        const toggle = (id) => {
            this.dom.drawers[id].classList.add('open');
            this.dom.backdrop.classList.add('active');
        };
        document.getElementById('btn-history').addEventListener('click', () => toggle('history'));
        document.getElementById('btn-favorites').addEventListener('click', () => toggle('favorites'));
        document.querySelectorAll('.close-drawer-btn').forEach(b => b.addEventListener('click', () => this.closeDrawers()));
        this.dom.backdrop.addEventListener('click', () => this.closeDrawers());
        
        // Theme
        document.getElementById('btn-theme').addEventListener('click', () => {
            this.isDark = !this.isDark;
            localStorage.setItem('celestique_theme', this.isDark ? 'dark' : 'light');
            this.applyTheme();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new CelestiqueApp(); });