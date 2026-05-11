const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const pipelineRoutes = require('./routes/pipelines');
const executeRoutes = require('./routes/execute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'Pipeline Builder API is running' });
});

app.use('/pipelines', pipelineRoutes);
app.use('/execute', executeRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });