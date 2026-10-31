const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check if public folder exists before using it - THIS FIXES YOUR ERROR!
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Serving static files from public folder');
} else {
  console.log('⚠️ No public folder found - running API only mode');
}

// API Routes
app.get('/', (req, res) => {
  res.json({ 
    status: "XP Video Studio API is LIVE ✅",
    message: "Backend working perfectly!",
    version: "1.0",
    endpoints: {
      health: "/health",
      generate: "/api/generate"
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

app.post('/api/generate', (req, res) => {
  // Your video generation logic here
  res.json({ message: "Generate endpoint - add your logic here" });
});

// SAFE fallback - NO MORE ENOENT ERROR!
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  
  // Only send index.html if it exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If no frontend, send API message - NO CRASH!
    res.status(200).json({ 
      message: "Route not found, but API is running",
      availableRoutes: ["/", "/health", "/api/generate"],
      tip: "Deploy frontend separately on Vercel"
    });
  }
});

// Error handler - prevents crash
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error", details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server LIVE on port ${PORT}`);
});
