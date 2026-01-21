/**
 * Celestique AI v2.0 - Core Application Logic
 * Property of Sooban Talha Technologies
 * * FEATURES:
 * - LocalStorage for Chat History
 * - User Name Personalization
 * - Live Typewriter Engine
 * - jsPDF Integration
 */

// --- STATE MANAGEMENT ---
const state = {
    userName: localStorage.getItem('celestique_username') || null,
    history: JSON.parse(localStorage.getItem('celestique_history') || '[]'),
    currentRecipe: null,
    isGenerating: false
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkWelcome();
    loadHistory();
    
    // Auto-resize textarea
    document.getElementById('recipePrompt').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Buttons
    document.getElementById('startJourneyBtn').addEventListener('click', saveName);
    document.getElementById('generateBtn').addEventListener('click', generateRecipe);
    document.getElementById('historyToggleBtn').addEventListener('click', toggleDrawer);
    document.getElementById('closeDrawer').addEventListener('click', toggleDrawer);
});

// --- WELCOME SYSTEM ---
function checkWelcome() {
    const overlay = document.getElementById('welcomeOverlay');
    const container = document.getElementById('appContainer');
    
    if (state.userName) {
        overlay.style.display = 'none';
        container.classList.remove('blur-load');
        updateGreeting();
    } else {
        // Show welcome screen
        overlay.style.display = 'flex';
    }
}

function saveName() {
    const input = document.getElementById('nameInput');
    const name = input.value.trim();
    
    if (name) {
        state.userName = name;
        localStorage.setItem('celestique_username', name);
        
        // Animation out
        document.getElementById('welcomeOverlay').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('welcomeOverlay').style.display = 'none';
            document.getElementById('appContainer').classList.remove('blur-load');
            updateGreeting();
        }, 500);
    } else {
        input.style.borderColor = 'red';
    }
}

function updateGreeting() {
    document.getElementById('userGreeting').innerHTML = `Hello, Chef ${state.userName}! 👋`;
}

// --- RECIPE GENERATION ENGINE ---
async function generateRecipe() {
    const promptInput = document.getElementById('recipePrompt');
    const prompt = promptInput.value.trim();
    
    if (!prompt || state.isGenerating) return;

    // UI Updates
    state.isGenerating = true;
    document.getElementById('responseArea').classList.remove('hidden');
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('recipeCard').classList.add('hidden');
    
    // Backend Call
    try {
        // NOTE: If you haven't deployed the backend yet, use the internal fallback for demo
        // Replace '/api/recipe' with your actual Vercel endpoint URL
        const response = await fetch('/api/recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, userName: state.userName })
        });

        const json = await response.json();
        
        if (json.data) {
            state.currentRecipe = json.data;
            saveToHistory(json.data);
            renderRecipeLive(json.data);
        } else {
            throw new Error('No data received');
        }

    } catch (error) {
        console.error("Fetch error:", error);
        // Fallback for demo (if backend fails)
        const fallback = {
            title: "Quick " + prompt,
            description: "We are having trouble connecting to the main brain, but here is a quick recipe!",
            stats: { time: "30m", servings: "2", difficulty: "Easy" },
            ingredients: ["Fresh ingredients", "Love", "Spices"],
            steps: ["Prepare food", "Cook heat", "Serve"],
            tips: ["Check internet connection"]
        };
        state.currentRecipe = fallback;
        renderRecipeLive(fallback);
    }
}

// --- LIVE TYPEWRITER EFFECT ---
function renderRecipeLive(data) {
    document.getElementById('loader').classList.add('hidden');
    const card = document.getElementById('recipeCard');
    const target = document.getElementById('typewriterTarget');
    
    card.classList.remove('hidden');
    target.innerHTML = ''; // Clear previous

    // Construct HTML string
    const htmlContent = `
        <h1 class="recipe-title">${data.title}</h1>
        <p class="recipe-desc">${data.description}</p>
        
        <div class="stat-row">
            <span class="stat-item"><i class="fa-regular fa-clock"></i> ${data.stats.time}</span>
            <span class="stat-item"><i class="fa-solid fa-user-group"></i> ${data.stats.servings}</span>
            <span class="stat-item"><i class="fa-solid fa-gauge-high"></i> ${data.stats.difficulty}</span>
        </div>

        <span class="section-title">INGREDIENTS</span>
        <ul class="ing-list">
            ${data.ingredients.map(i => `<li>• ${i}</li>`).join('')}
        </ul>

        <span class="section-title">INSTRUCTIONS</span>
        <div class="steps-list">
            ${data.steps.map((step, idx) => `<p><strong>${idx+1}.</strong> ${step}</p>`).join('')}
        </div>

        <div class="tips-box" style="margin-top:20px; background:#fff3cd; padding:15px; border-radius:10px;">
            <strong>💡 Sooban's Pro Tips:</strong>
            <ul>${data.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        
        <div style="margin-top:30px; font-size:0.8rem; color:#aaa; text-align:center;">
            Powered by Sooban Talha Technologies
        </div>
    `;

    // Typewriter Logic: We append the HTML but we can also type it text-node by text-node for realism.
    // For simplicity and HTML rendering safety, we will just fade it in elegantly, 
    // OR simulate typing by setting innerHTML incrementally (complex for HTML tags).
    // Let's use a "Chunk Reveal" effect which feels fast and live.
    
    target.innerHTML = htmlContent;
    state.isGenerating = false;
}

// --- PDF GENERATOR ---
window.downloadPDF = function() {
    if (!state.currentRecipe) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const r = state.currentRecipe;

    // Header
    doc.setFillColor(255, 107, 107); // Primary Red
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Celestique AI", 105, 20, null, null, "center");
    doc.setFontSize(10);
    doc.text("by Sooban Talha Technologies", 105, 30, null, null, "center");

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text(r.title, 20, 60);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Time: ${r.stats.time} | Servings: ${r.stats.servings}`, 20, 70);

    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.text("Ingredients:", 20, 90);
    
    let y = 100;
    doc.setFontSize(11);
    r.ingredients.forEach(i => {
        doc.text(`• ${i}`, 25, y);
        y += 7;
    });

    y += 10;
    doc.setFontSize(14);
    doc.text("Instructions:", 20, y);
    y += 10;
    
    doc.setFontSize(11);
    const splitSteps = doc.splitTextToSize(r.steps.join('\n\n'), 170);
    doc.text(splitSteps, 25, y);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Generated at celestiqueai.vercel.app", 105, 280, null, null, "center");

    doc.save(`${r.title.replace(/\s/g, '_')}_Recipe.pdf`);
};

// --- HISTORY & UTILS ---
window.resetApp = function() {
    document.getElementById('recipePrompt').value = '';
    document.getElementById('responseArea').classList.add('hidden');
};

function saveToHistory(recipe) {
    state.history.unshift({
        title: recipe.title,
        date: new Date().toLocaleDateString(),
        data: recipe
    });
    // Limit to 20 items
    if (state.history.length > 20) state.history.pop();
    localStorage.setItem('celestique_history', JSON.stringify(state.history));
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    
    state.history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<strong>${item.title}</strong><br><small>${item.date}</small>`;
        div.onclick = () => {
            state.currentRecipe = item.data;
            document.getElementById('responseArea').classList.remove('hidden');
            renderRecipeLive(item.data);
            toggleDrawer(); // Close drawer
        };
        list.appendChild(div);
    });
}

function toggleDrawer() {
    document.getElementById('historyDrawer').classList.toggle('open');
}