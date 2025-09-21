// Add this to the top of your app.js file
// Initialize EmailJS with your Public Key
(function() {
  emailjs.init("bOlKnGmxZdWtgo00b"); // Replace with your EmailJS public key
})();

// Add this function to handle the welcome modal and email sending
function initWelcomeModal() {
  const welcomeModal = document.getElementById('welcome-modal');
  const userForm = document.getElementById('user-form');
  const userNameInput = document.getElementById('user-name');
  const userEmailInput = document.getElementById('user-email');
  
  // Check if user has already submitted name
  const userName = localStorage.getItem('celestiqueUserName');
  
  if (userName) {
    // User already submitted name, hide modal
    welcomeModal.classList.add('hidden');
    showPersonalizedWelcome(userName);
  } else {
    // Show modal for new users
    welcomeModal.classList.remove('hidden');
  }
  
  // Handle form submission
  userForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();
    
    if (!userName) return;
    
    // Save to localStorage
    localStorage.setItem('celestiqueUserName', userName);
    if (userEmail) {
      localStorage.setItem('celestiqueUserEmail', userEmail);
    }
    
    // Send email notification
    try {
      await sendUserNotification(userName, userEmail);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
    
    // Hide modal
    welcomeModal.classList.add('hidden');
    
    // Show personalized welcome
    showPersonalizedWelcome(userName);
  });
}

// Function to send email notification
async function sendUserNotification(userName, userEmail) {
  const templateParams = {
    to_name: 'Sooban Talha',
    from_name: userName,
    user_email: userEmail || 'Not provided',
    message: `New user registration: ${userName} has joined Célestique AI!`,
    reply_to: userEmail || 'no-reply@celestiqueai.com'
  };
  
  try {
    await emailjs.send('service_4cw0qrk', 'template_wdom6g5', templateParams);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Function to show personalized welcome message
function showPersonalizedWelcome(userName) {
  const welcomeMessage = `
    <div class="personalized-welcome">
      <h3>🌟 Welcome back, ${userName}!</h3>
      <p>We're delighted to have you back at Célestique AI. What culinary masterpiece shall we create today?</p>
      
      <div class="example-prompts">
        <h4>Try asking me:</h4>
        <div class="prompt-suggestions">
          <button class="suggestion-btn" onclick="userInput.value='chocolate lava cake'; sendMessage();">🍫 Chocolate Lava Cake</button>
          <button class="suggestion-btn" onclick="userInput.value='seafood pasta'; sendMessage();">🦐 Seafood Pasta</button>
          <button class="suggestion-btn" onclick="userInput.value='healthy salad'; sendMessage();">🥗 Healthy Salad</button>
          <button class="suggestion-btn" onclick="userInput.value='homemade pizza'; sendMessage();">🍕 Homemade Pizza</button>
        </div>
      </div>
    </div>
  `;
  
  // Add welcome message to chat
  addMessage(welcomeMessage);
}

// Add this CSS for the personalized welcome
const welcomeStyles = `
  .personalized-welcome {
    background: linear-gradient(135deg, rgba(110, 69, 226, 0.1), rgba(255, 107, 107, 0.1));
    border-radius: 15px;
    padding: 20px;
    border: 1px solid rgba(212, 175, 55, 0.2);
    margin: 10px 0;
  }
  
  .personalized-welcome h3 {
    color: var(--gold);
    margin-bottom: 10px;
    font-family: 'Cinzel', serif;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = welcomeStyles;
document.head.appendChild(styleSheet);

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  initLuxuryEffects();
  initWelcomeModal(); // Add this line
  
  // ... rest of your existing code
});
// Guaranteed working recipe generator
module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try to generate recipe with AI
    let recipe;
    try {
      recipe = await generateRecipeWithAI(message);
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      recipe = generateFallbackRecipe(message);
    }

    res.status(200).json(recipe);

  } catch (error) {
    console.error('Unexpected error:', error);
    // Use fallback recipe
    const fallbackRecipe = generateFallbackRecipe(message);
    res.status(200).json(fallbackRecipe);
  }
};

// Generate recipe using AI
async function generateRecipeWithAI(userInput) {
  // Check if API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('API key not configured');
  }

  // Simple prompt that works reliably
  const prompt = `Create a recipe for: ${userInput}. 
  Respond with JSON in this format: 
  {
    "name": "Recipe name",
    "cuisine": "Cuisine type",
    "difficulty": "Easy/Medium/Hard",
    "prep_time": "X minutes",
    "cook_time": "X minutes",
    "serves": "X people",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "chef_tips": ["tip 1", "tip 2"],
    "score": 85
  }`;

  try {
    // Try multiple models in sequence
    const models = [
      'x-ai/grok-4-fast:free',
      'deepseek/deepseek-chat-v3.1:free',
      'deepseek/deepseek-r1-0528:free'
    ];

    for (const model of models) {
      try {
        const recipe = await tryModel(model, prompt);
        if (recipe) return recipe;
      } catch (error) {
        console.log(`Model ${model} failed, trying next`);
      }
    }

    throw new Error('All models failed');

  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

// Try a specific model
async function tryModel(model, prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://celestiqueai.vercel.app',
      'X-Title': 'Célestique AI'
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`Model ${model} failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const recipe = JSON.parse(jsonMatch[0]);
    recipe.powered_by = 'Célestique AI';
    recipe.generated_at = new Date().toISOString();
    return recipe;
  }

  throw new Error('No JSON found in response');
}

// Enhanced fallback recipe generator
function generateFallbackRecipe(input) {
  const recipes = {
    'pasta': {
      name: 'Gourmet Pasta Carbonara',
      cuisine: 'Italian',
      difficulty: 'Medium',
      prep_time: '15 minutes',
      cook_time: '15 minutes',
      serves: '4 people',
      ingredients: [
        '400g spaghetti',
        '200g pancetta or guanciale, diced',
        '4 large eggs',
        '100g Pecorino Romano, grated',
        'Black pepper, freshly cracked',
        'Salt to taste'
      ],
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti until al dente',
        'Meanwhile, cook pancetta in a large pan until crispy',
        'Whisk eggs with Pecorino Romano and black pepper',
        'Drain pasta, reserving 1 cup cooking water',
        'Add hot pasta to pancetta pan, remove from heat',
        'Quickly stir in egg mixture, adding pasta water as needed',
        'Serve immediately with extra cheese and pepper'
      ],
      chef_tips: [
        'Remove pan from heat before adding eggs to prevent scrambling',
        'Use freshly grated cheese for best flavor'
      ],
      score: 88,
      powered_by: 'Célestique AI Fallback'
    },
    'chicken': {
      name: 'Herb-Roasted Chicken',
      cuisine: 'International',
      difficulty: 'Easy',
      prep_time: '10 minutes',
      cook_time: '45 minutes',
      serves: '4 people',
      ingredients: [
        '1 whole chicken (1.5kg)',
        '2 tbsp olive oil',
        '1 lemon, halved',
        '4 garlic cloves, crushed',
        '1 tbsp fresh rosemary, chopped',
        '1 tbsp fresh thyme, chopped',
        'Salt and pepper to taste'
      ],
      instructions: [
        'Preheat oven to 200°C (400°F)',
        'Pat chicken dry and rub with olive oil',
        'Season inside and out with salt, pepper, and herbs',
        'Place lemon halves and garlic inside cavity',
        'Roast for 45-60 minutes until golden and juices run clear',
        'Let rest for 10 minutes before carving'
      ],
      chef_tips: [
        'Let chicken come to room temperature before roasting',
        'Use a meat thermometer to ensure perfect doneness'
      ],
      score: 85,
      powered_by: 'Célestique AI Fallback'
    }
  };

  // Find the best matching recipe
  const lowerInput = input.toLowerCase();
  for (const [key, recipe] of Object.entries(recipes)) {
    if (lowerInput.includes(key)) {
      return recipe;
    }
  }

  // Default fallback
  return {
    name: 'Gourmet ' + input,
    cuisine: 'International',
    difficulty: 'Medium',
    prep_time: '30 minutes',
    cook_time: '30 minutes',
    serves: '4 people',
    ingredients: ['Check back soon for this recipe!'],
    instructions: ['Our AI chef is perfecting this recipe for you.'],
    chef_tips: ['Try asking for a different recipe in the meantime'],
    score: 0,
    powered_by: 'Célestique AI Fallback'
  };
}
// Add this code to your existing app.js file

// Mobile-specific improvements
function initMobileOptimizations() {
  // Check if mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Add mobile class to body for CSS targeting
    document.body.classList.add('mobile-device');
    
    // Improve touch experience
    document.querySelectorAll('button').forEach(btn => {
      btn.style.minHeight = '44px';
    });
    
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        document.body.style.zoom = '100%';
      });
    });
    
    // Adjust chat messages padding for mobile
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.style.paddingBottom = '80px';
    }
  }
}

// Call this function in your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  initLuxuryEffects();
  initMobileOptimizations(); // Add this line
  
  // ... rest of your existing code
});