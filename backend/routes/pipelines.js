// routes/pipelines.js
// All pipeline-related endpoints live here.

const express = require('express');
const router = express.Router();
const Pipeline = require('../models/Pipeline');

// ── DAG Detection — Kahn's Algorithm ──
// Check if the pipeline graph has no cycles (is a Directed Acyclic Graph).
const isDAG = (nodes, edges) => {
    const nodeIds = new Set(nodes.map(n => n.id));

    // in-degree = how many edges point INTO each node
    const inDegree = {};
    const adj = {};

    nodes.forEach(n => {
        inDegree[n.id] = 0;
        adj[n.id] = [];
    });

    edges.forEach(e => {
        // Only count edges between nodes that exist
        if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
            adj[e.source].push(e.target);
            inDegree[e.target] += 1;
        }
    });

    // Start with nodes that have nothing pointing to them
    const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
    let visited = 0;

    while (queue.length > 0) {
        const node = queue.shift();
        visited++;

        // Reduce in-degree of all neighbours
        // If any hit 0, they're now free to process
        adj[node].forEach(neighbour => {
            inDegree[neighbour]--;
            if (inDegree[neighbour] === 0) queue.push(neighbour);
        });
    }

    return visited === nodes.length;
};


// ── POST /pipelines/parse ──
// Validates the pipeline — counts nodes/edges and checks for cycles.
// Also logs the result to history if a pipeline id is provided.
router.post('/parse', async (req, res) => {
    try {
        const { nodes = [], edges = [], pipelineId } = req.body;

        const num_nodes = nodes.length;
        const num_edges = edges.length;
        const is_dag = isDAG(nodes, edges);

        // If a saved pipeline id was sent, log this submission to its history
        if (pipelineId) {
            await Pipeline.findByIdAndUpdate(pipelineId, {
                $push: {
                    history: { num_nodes, num_edges, is_dag }
                }
            });
        }

        res.json({ num_nodes, num_edges, is_dag });

    } catch (err) {
        console.error('Parse error:', err);
        res.status(500).json({ error: 'Failed to parse pipeline' });
    }
});


// ── POST /pipelines/save ──
// Saves a new pipeline or updates an existing one.
// If an id is sent, we update. If not, we create a new one.
router.post('/save', async (req, res) => {
    try {
        const { id, name, nodes, edges } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Pipeline name is required' });
        }

        let pipeline;

        if (id) {
            // Update existing pipeline
            pipeline = await Pipeline.findByIdAndUpdate(
                id,
                { name, nodes, edges },
                { new: true } // return the updated document
            );
            if (!pipeline) {
                return res.status(404).json({ error: 'Pipeline not found' });
            }
        } else {
            // Create new pipeline
            pipeline = await Pipeline.create({ name, nodes, edges });
        }

        res.json({ success: true, pipeline });

    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: 'Failed to save pipeline' });
    }
});


// ── GET /pipelines ──
// Returns all saved pipelines — just id, name, and timestamps.
// We don't send nodes/edges here to keep the response light.
router.get('/', async (req, res) => {
    try {
        const pipelines = await Pipeline.find()
            .select('name createdAt updatedAt')
            .sort({ updatedAt: -1 }); // most recently updated first

        res.json({ pipelines });

    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch pipelines' });
    }
});


// ── GET /pipelines/:id ──
// Returns a single pipeline with full nodes, edges, and history.
// Used when user selects a pipeline to load onto the canvas.
router.get('/:id', async (req, res) => {
    try {
        const pipeline = await Pipeline.findById(req.params.id);

        if (!pipeline) {
            return res.status(404).json({ error: 'Pipeline not found' });
        }

        res.json({ pipeline });

    } catch (err) {
        console.error('Load error:', err);
        res.status(500).json({ error: 'Failed to load pipeline' });
    }
});


// ── DELETE /pipelines/:id ──
// Deletes a saved pipeline permanently.
router.delete('/:id', async (req, res) => {
    try {
        const pipeline = await Pipeline.findByIdAndDelete(req.params.id);

        if (!pipeline) {
            return res.status(404).json({ error: 'Pipeline not found' });
        }

        res.json({ success: true });

    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete pipeline' });
    }
});


module.exports = router;