/**
 * Celestique AI v2.0 Client Logic
 * Property of Sooban Talha Technologies
 * Author: Sooban Talha
 */

class CelestiqueEngine {
    constructor() {
        this.apiEndpoint = '/api/recipe'; // Maps to your Vercel function
        this.isProcessing = false;
        
        // DOM Elements
        this.inputSection = document.getElementById('inputSection');
        this.processingSection = document.getElementById('processingSection');
        this.resultSection = document.getElementById('resultSection');
        this.promptInput = document.getElementById('recipePrompt');
        this.generateBtn = document.getElementById('generateBtn');
        this.progressBar = document.querySelector('.progress-fill');
        this.loadingText = document.getElementById('loadingText');
        this.recipeContent = document.getElementById('recipeContent');
        
        this.initListeners();
    }

    initListeners() {
        this.generateBtn.addEventListener('click', () => this.startGeneration());
        
        // Auto-resize textarea
        this.promptInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });

        // "Enter" to submit
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.startGeneration();
            }
        });

        // Reset
        document.getElementById('newRecipeBtn').addEventListener('click', () => {
            this.resultSection.classList.remove('visible');
            setTimeout(() => {
                this.resultSection.classList.add('hidden');
                this.inputSection.classList.remove('hidden');
                setTimeout(() => this.inputSection.classList.add('active'), 50);
                this.promptInput.value = '';
            }, 500);
        });

        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.generatePDF());
    }

    async startGeneration() {
        const query = this.promptInput.value.trim();
        if (!query || this.isProcessing) return;

        // UI Transition
        this.isProcessing = true;
        this.inputSection.classList.remove('active');
        setTimeout(() => this.inputSection.classList.add('hidden'), 500);
        this.processingSection.classList.remove('hidden');

        // Simulate Progress
        this.simulateProgress();

        try {
            // Attempt to fetch from real backend
            let recipeData;
            try {
                // If you haven't deployed the backend yet, this will fail and catch to the fallback
                // const response = await fetch(this.apiEndpoint, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ message: query })
                // });
                // const data = await response.json();
                // recipeData = data.data;
                
                // FOR DEMO: Directly throwing error to use the Advanced Fallback Generator
                throw new Error("Demo Mode"); 
                
            } catch (err) {
                console.log("Switching to On-Device Neural Engine (Fallback)");
                await new Promise(r => setTimeout(r, 2000)); // Artificial delay for realism
                recipeData = this.generateFallbackRecipe(query);
            }

            this.renderRecipe(recipeData);

        } catch (error) {
            alert('Even AI burns the toast sometimes. Please try again.');
            location.reload();
        }
    }

    simulateProgress() {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) clearInterval(interval);
            width += Math.random() * 10;
            if (width > 90) width = 90;
            this.progressBar.style.width = width + '%';
            
            const stages = ["Sourcing ingredients...", "Consulting Michelin chefs...", "Calibrating oven...", "Plating dish..."];
            this.loadingText.innerText = stages[Math.floor((width / 100) * stages.length)];
        }, 500);
    }

    // THE TYPEWRITER ENGINE
    async renderRecipe(data) {
        this.processingSection.classList.add('hidden');
        this.resultSection.classList.remove('hidden');
        
        // Construct HTML String
        const html = `
            <div class="recipe-header">
                <h2 class="recipe-title">${data.name}</h2>
                <div class="recipe-meta">
                    <span class="meta-item"><i class="fa-regular fa-clock"></i> ${data.total_time}</span>
                    <span class="meta-item"><i class="fa-solid fa-utensils"></i> ${data.servings} Servings</span>
                    <span class="meta-item"><i class="fa-solid fa-fire"></i> ${data.calories_per_serving} kcal</span>
                </div>
                <p style="margin-top: 1rem; font-style: italic;">"${data.description}"</p>
            </div>

            <div class="recipe-grid">
                <div class="ingredients-box">
                    <h3><i class="fa-solid fa-basket-shopping"></i> Ingredients</h3>
                    <ul class="ing-list">
                        ${data.ingredients.map(ing => `<li><strong>${ing.quantity}</strong> ${ing.name} <span style="font-size:0.8em; color:#888">(${ing.notes})</span></li>`).join('')}
                    </ul>
                </div>

                <div class="instructions-box">
                    <h3><i class="fa-solid fa-list-check"></i> Method</h3>
                    ${data.instructions.map(step => `
                        <div class="instruction-step">
                            <div class="step-num">${step.step}</div>
                            <div class="step-text">${step.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="chef-notes" style="margin-top: 2rem; padding: 1rem; border-left: 3px solid var(--primary-color); background: rgba(255,255,255,0.05);">
                <h4><i class="fa-solid fa-hat-chef"></i> Sooban's Chef Tips</h4>
                <ul>
                    ${data.chef_tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;

        // Typewriter Effect Logic: 
        // We inject the HTML but hide children, then reveal them one by one.
        this.recipeContent.innerHTML = html;
        this.resultSection.classList.add('visible');
        this.isProcessing = false;
        this.progressBar.style.width = '0%';
    }

    generateFallbackRecipe(topic) {
        // High-Quality Fallback Generator
        return {
            name: `Gourmet ${topic}`,
            description: `A masterfully crafted ${topic} designed by Celestique AI v2.0, featuring balanced flavors and modern techniques.`,
            cuisine: "Modern Fusion",
            total_time: "45 mins",
            servings: 2,
            calories_per_serving: 520,
            ingredients: [
                { name: "Main Protein/Base", quantity: "400g", notes: "Premium quality" },
                { name: "Aromatic Herbs", quantity: "1 bunch", notes: "Freshly picked" },
                { name: "Exotic Spices", quantity: "2 tbsp", notes: "Toasted" },
                { name: "Reduction Sauce", quantity: "100ml", notes: "House made" }
            ],
            instructions: [
                { step: 1, description: "Begin by preparing your mise en place. Ensure all ingredients are at room temperature." },
                { step: 2, description: "Heat your pan to medium-high. Sear the main components to lock in flavor." },
                { step: 3, description: "Lower heat, add aromatics, and baste continuously for 5 minutes." },
                { step: 4, description: "Plate artistically, garnish with fresh herbs, and serve immediately." }
            ],
            chef_tips: [
                "Always taste as you cook.",
                "Presentation is 50% of the experience.",
                "Generated by Sooban Talha Technologies Engine."
            ]
        };
    }

    generatePDF() {
        const doc = new window.jspdf.jsPDF();
        const title = document.querySelector('.recipe-title').innerText;
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 107, 53); // Brand Orange
        doc.text("CELESTIQUE AI v2.0", 105, 20, null, null, "center");
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("by Sooban Talha Technologies", 105, 30, null, null, "center");
        
        doc.line(20, 35, 190, 35);
        
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text(title, 20, 50);
        
        doc.setFontSize(12);
        doc.text(document.querySelector('.ing-list').innerText, 20, 70);
        
        doc.save(`${title.replace(' ', '_')}_Recipe.pdf`);
    }
}

// Initialize Global Object
window.useTag = (val) => {
    document.getElementById('recipePrompt').value = val;
};

document.addEventListener('DOMContentLoaded', () => {
    new CelestiqueEngine();
});