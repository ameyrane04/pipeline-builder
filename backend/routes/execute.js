
const express = require('express');
const router = express.Router();

// Topological Sort 
const topologicalSort = (nodes, edges) => {
    const nodeMap = {};
    nodes.forEach(n => nodeMap[n.id] = n);

    const inDegree = {};
    const adj = {};
    nodes.forEach(n => {
        inDegree[n.id] = 0;
        adj[n.id] = [];
    });

    edges.forEach(e => {
        if (nodeMap[e.source] && nodeMap[e.target]) {
            adj[e.source].push(e.target);
            inDegree[e.target]++;
        }
    });

    const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const sorted = [];

    while (queue.length > 0) {
        const nodeId = queue.shift();
        sorted.push(nodeMap[nodeId]);
        adj[nodeId].forEach(neighbourId => {
            inDegree[neighbourId]--;
            if (inDegree[neighbourId] === 0) queue.push(neighbourId);
        });
    }

    return sorted;
};

//Get upstream result for a node
const getUpstreamValue = (nodeId, handleSuffix, edges, results) => {
    const edge = edges.find(e =>
        e.target === nodeId &&
        e.targetHandle &&
        e.targetHandle.endsWith(handleSuffix)
    );
    if (!edge) return null;
    return results[edge.source] || null;
};

// ── Execute a single node ──
const executeNode = async (node, edges, results, apiKey, provider) => {
    const type = node.type;
    const data = node.data || {};

    switch (type) {

        // Input node — just returns whatever the user typed as its value
        case 'customInput': {
            return data.inputValue || '';
        }

        // Text node — fills in {{variable}} placeholders with upstream values
        case 'text': {
            let text = data.currText || '';
            // Find all {{varKey}} patterns and replace with upstream results
            const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
            matches.forEach(match => {
                const varKey = match.slice(2, -2); // strip {{ and }}
                // The handle id contains the varKey — find matching edge
                const edge = edges.find(e =>
                    e.target === node.id &&
                    e.targetHandle &&
                    e.targetHandle.includes(varKey)
                );
                if (edge && results[edge.source] !== undefined) {
                    text = text.replace(match, results[edge.source]);
                }
            });
            return text;
        }

        // LLM node — calls Groq or OpenAI with the prompts
        case 'llm': {
            if (!apiKey) return 'Error: No API key provided';

            // Get system and user prompt from upstream nodes or node's own fields
            const upstreamSystem = getUpstreamValue(node.id, 'system', edges, results);
            const upstreamPrompt = getUpstreamValue(node.id, 'prompt', edges, results);

            const systemPrompt = upstreamSystem || data.systemPrompt || '';
            const userPrompt = upstreamPrompt || data.userPrompt || '';

            // if (!userPrompt) return 'Error: No user prompt provided';

            // Build the API URL based on provider
            const isGroq = provider === 'groq';
            const apiUrl = isGroq
                ? 'https://api.groq.com/openai/v1/chat/completions'
                : 'https://api.openai.com/v1/chat/completions';

            const model = isGroq
                ? (data.model || 'openai/gpt-oss-120b')
                : (data.model || 'gpt-4o');

            // Dynamic import of node-fetch or use built-in fetch (Node 18+)
            const fetchFn = globalThis.fetch;

            const response = await fetchFn(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                        { role: 'user', content: userPrompt },
                    ],
                    max_tokens: 1000,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                return `Error: ${result.error?.message || 'API call failed'}`;
            }
            return result.choices[0].message.content;
        }

        // Transform node — applies text operation to upstream value
        case 'transform': {
            const upstream = getUpstreamValue(node.id, 'text', edges, results);
            const text = upstream || data.inputText || '';
            if (!text) return '';

            const op = data.operation || 'uppercase';
            switch (op) {
                case 'uppercase':  return text.toUpperCase();
                case 'lowercase':  return text.toLowerCase();
                case 'trim':       return text.trim();
                case 'reverse':    return text.split('').reverse().join('');
                case 'length':     return `Character count: ${text.length}`;
                case 'capitalize': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                case 'snake_case': return text.toLowerCase().replace(/\s+/g, '_');
                case 'camel_case': return text.toLowerCase().replace(/\s+(.)/g, (_, c) => c.toUpperCase());
                default: return text;
            }
        }

        // Condition node — returns 'true' or 'false' based on condition check
        case 'condition': {
            const upstream = getUpstreamValue(node.id, 'value', edges, results);
            const value = upstream || '';
            const condition = data.condition || '';
            const passed = value.toLowerCase().includes(condition.toLowerCase());
            return passed ? 'true' : 'false';
        }

        // Output node — just passes through whatever comes in
        case 'customOutput': {
            const upstream = getUpstreamValue(node.id, 'value', edges, results);
            return upstream || '';
        }

        // API node — makes a real HTTP request
        case 'api': {
            const method = data.method || 'GET';
            const url = data.url || '';
            if (!url || url === 'https://') return 'Error: No URL provided';

            try {
                const upstream = getUpstreamValue(node.id, 'body', edges, results);
                const fetchOptions = {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                };
                if (method !== 'GET' && upstream) {
                    fetchOptions.body = JSON.stringify({ data: upstream });
                }
                const res = await globalThis.fetch(url, fetchOptions);
                const text = await res.text();
                // Try to parse as JSON for cleaner output
                try {
                    const json = JSON.parse(text);
                    return JSON.stringify(json, null, 2);
                } catch {
                    return text;
                }
            } catch (err) {
                return `Error: ${err.message}`;
            }
        }

        // Timer node — just passes through with a delay label
        case 'timer': {
            const upstream = getUpstreamValue(node.id, 'trigger', edges, results);
            const delay = data.delay || 1000;
            const unit = data.unit || 'ms';
            return `[Delayed ${delay}${unit}] ${upstream || ''}`;
        }

        case 'note':
        default:
            return null;
    }
};

// ── POST /execute ──
router.post('/', async (req, res) => {
    try {
        const { nodes = [], edges = [], apiKey, provider = 'groq' } = req.body;

        if (nodes.length === 0) {
            return res.status(400).json({ error: 'No nodes to execute' });
        }

        // Sort nodes in execution order
        const sorted = topologicalSort(nodes, edges);

        // results map: nodeId → output value
        const results = {};

        // Execute each node in order
        for (const node of sorted) {
            const output = await executeNode(node, edges, results, apiKey, provider);
            if (output !== null) {
                results[node.id] = output;
            }
        }

        res.json({ success: true, results });

    } catch (err) {
        console.error('Execution error:', err);
        res.status(500).json({ error: 'Pipeline execution failed', details: err.message });
    }
});

module.exports = router;