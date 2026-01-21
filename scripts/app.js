/**
 * Celestique AI v2.0 Client Core
 * Developed by Sooban Talha Technologies
 * Lead Architect: Sooban Talha
 * * MODULES:
 * 1. UI Controller
 * 2. Typewriter Engine
 * 3. Network Handler
 * 4. Background Animation
 */

class CelestiqueApp {
    constructor() {
        this.config = {
            company: "Sooban Talha Technologies",
            api_url: "/api/recipe",
            typingSpeed: 25 // ms per character
        };
        
        this.state = {
            isGenerating: false,
            history: []
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.initCanvas();
        console.log(`%c Celestique AI v2.0 initialized by ${this.config.company}`, "color: #00f3ff; font-size: 16px; font-weight: bold;");
    }

    bindEvents() {
        // Tab Switching
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget));
        });

        // Generation
        document.getElementById('generateBtn').addEventListener('click', () => this.startGeneration());
    }

    switchTab(btn) {
        // Update UI classes
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === target) content.classList.add('active');
        });
    }

    quickFill(text) {
        document.getElementById('promptInput').value = text;
    }

    async startGeneration() {
        if (this.state.isGenerating) return;
        
        const prompt = document.getElementById('promptInput').value;
        if (!prompt) return alert("Please enter a command for the Neural Engine.");

        this.state.isGenerating = true;
        this.setLoadingUI(true);
        document.getElementById('terminalOutput').classList.remove('hidden');
        document.getElementById('streamContent').innerHTML = ''; // Clear previous

        try {
            // 1. Send Request
            // In a real deployed Vercel env, this fetches from api/recipe.js
            // For this demo code to work standalone without backend, we trigger fallback logic if fetch fails
            let data;
            try {
                // Uncomment this for real backend
                // const res = await fetch(this.config.api_url, {
                //     method: 'POST',
                //     headers: {'Content-Type': 'application/json'},
                //     body: JSON.stringify({ query: prompt })
                // });
                // const json = await res.json();
                // data = json.data;
                throw new Error("Demo Fallback Trigger");
            } catch (e) {
                // Use Client-Side Logic for Demo
                data = this.generateLocalResponse(prompt);
            }

            // 2. Format Data for Typewriter
            const formattedText = this.formatRecipeForTerminal(data);
            
            // 3. Start Live Typing
            await this.typewriterEffect(formattedText);
            
            // 4. Save to History
            this.addToHistory(data.title);

        } catch (err) {
            this.typewriterEffect(`CRITICAL ERROR: ${err.message}`);
        } finally {
            this.state.isGenerating = false;
            this.setLoadingUI(false);
        }
    }

    // --- TYPEWRITER ENGINE (The "Live" Logic) ---
    async typewriterEffect(htmlContent) {
        const target = document.getElementById('streamContent');
        target.innerHTML = ''; // Clear
        
        // We split by HTML tags to preserve structure while typing text
        // Simple regex split for demo purposes (robust parsing would be more complex)
        // For visual simplicity in this demo, we treat whole chunks as typed units
        
        const lines = htmlContent.split('<br>');
        
        for (let line of lines) {
            const lineDiv = document.createElement('div');
            lineDiv.style.marginBottom = '10px';
            target.appendChild(lineDiv);
            
            const chars = line.split('');
            for (let char of chars) {
                lineDiv.innerHTML += char;
                await new Promise(r => setTimeout(r, Math.random() * 20 + 10)); // Random typing jitter
                this.scrollToBottom();
            }
        }
    }

    formatRecipeForTerminal(data) {
        // Convert JSON to HTML string for the terminal
        return `
            <strong style="color:white; font-size:1.4em">>> RECIPE_FOUND: ${data.title}</strong><br>
            ------------------------------------------------<br>
            <span style="color:#888">${data.description}</span><br>
            <br>
            <strong>[STATS]</strong><br>
            ⏱️ Prep: ${data.stats.prep} | 🔥 Cook: ${data.stats.cook} | ⚡ Cals: ${data.stats.cals}<br>
            <br>
            <strong>[INGREDIENTS]</strong><br>
            ${data.ingredients.map(i => `> ${i.amount} ${i.item} (${i.note})`).join('<br>')}<br>
            <br>
            <strong>[EXECUTION_PROTOCOL]</strong><br>
            ${data.steps.map((s, i) => `${i+1}. ${s}`).join('<br>')}<br>
            <br>
            <strong>[SOOBAN_TALHA_TECH_NOTES]</strong><br>
            ${data.chef_tips.map(t => `* ${t}`).join('<br>')}<br>
            <br>
            >> END_OF_TRANSMISSION
        `;
    }

    generateLocalResponse(query) {
        return {
            title: `Neural ${query}`,
            description: `A Sooban Talha Technologies optimized recipe for ${query}.`,
            stats: { prep: "15m", cook: "20m", cals: "320" },
            ingredients: [
                { item: "Main Ingredient", amount: "200g", note: "Fresh" },
                { item: "Sooban's Spice Mix", amount: "1 tbsp", note: "Secret" }
            ],
            steps: ["Prepare ingredients.", "Cook with passion.", "Serve."],
            chef_tips: ["Generated by local fallback engine."]
        };
    }

    setLoadingUI(isLoading) {
        const btn = document.getElementById('generateBtn');
        if (isLoading) {
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> PROCESSING...';
            btn.style.opacity = '0.7';
        } else {
            btn.innerHTML = '<span class="btn-text">INITIATE GENERATION</span><span class="glitch-effect"></span>';
            btn.style.opacity = '1';
        }
    }

    scrollToBottom() {
        const terminal = document.querySelector('.terminal-body');
        terminal.scrollTop = terminal.scrollHeight;
    }

    reset() {
        document.getElementById('terminalOutput').classList.add('hidden');
        document.getElementById('promptInput').value = '';
    }

    downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Celestique AI Recipe", 10, 10);
        doc.text("By Sooban Talha Technologies", 10, 20);
        doc.text(document.getElementById('streamContent').innerText, 10, 30);
        doc.save("Celestique_Recipe.pdf");
    }

    addToHistory(title) {
        const historyList = document.getElementById('historyList');
        const entry = document.createElement('div');
        entry.className = 'history-item';
        entry.innerText = `${new Date().toLocaleTimeString()} - ${title}`;
        historyList.prepend(entry);
    }

    // --- BACKGROUND VISUALIZER ---
    initCanvas() {
        const canvas = document.getElementById('neuralCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let particles = [];
        for(let i=0; i<50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00f3ff';
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// Instantiate
const app = new CelestiqueApp();
window.app = app;