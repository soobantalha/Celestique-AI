const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import recipe handler
const recipeHandler = require('./recipe');

// API Routes
app.post('/api/recipe', recipeHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Celestique AI Server Running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from public directory
app.use(express.static('public'));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;