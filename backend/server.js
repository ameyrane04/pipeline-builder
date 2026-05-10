// server.js
// Entry point for the Express backend.
// Connects to MongoDB and starts the server.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const pipelineRoutes = require('./routes/pipelines');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean), // filter out undefined if FRONTEND_URL not set
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ── Routes ──
app.get('/', (req, res) => {
    res.json({ status: 'Pipeline Builder API is running' });
});

// All pipeline routes are prefixed with /pipelines
app.use('/pipelines', pipelineRoutes);

// ── 404 handler ──
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──
// Catches any errors thrown in route handlers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1); // Exit if DB fails — no point running without it
    });