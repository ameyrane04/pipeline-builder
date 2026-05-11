// executePanel.j

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { showToast } from './toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    updateNodeExecutionResult: state.updateNodeExecutionResult,
});

export const ExecutePanel = () => {
    const { nodes, edges, updateNodeExecutionResult } = useStore(selector, shallow);
    const [apiKey, setApiKey] = useState('');
    const [provider, setProvider] = useState('groq');
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState({});

    const handleExecute = async () => {
        if (!apiKey.trim()) {
            showToast('Enter your API key first', 'warning');
            return;
        }
        if (nodes.length === 0) {
            showToast('Add some nodes to the canvas first', 'warning');
            return;
        }

        setRunning(true);
        setResults({});

        try {
            const res = await fetch(`${API_URL}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges, apiKey, provider }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Execution failed', 'error');
                return;
            }

            setResults(data.results);

            // Update each node's execution result in the store
            // so it shows up inside the node on the canvas
            Object.entries(data.results).forEach(([nodeId, result]) => {
                updateNodeExecutionResult(nodeId, result);
            });

            showToast('Pipeline executed successfully', 'success');

        } catch (err) {
            showToast('Could not connect to backend', 'error');
        } finally {
            setRunning(false);
        }
    };

    // Find node label for display
    const getNodeLabel = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? `${node.type} — ${nodeId}` : nodeId;
    };

    return (
        <div className="execute-panel">
            <div className="execute-panel-header">⚡ Execute Pipeline</div>

            <div className="execute-panel-body">
                {/* Provider selector */}
                <label className="node-label">
                    Provider:
                    <select className="node-select" value={provider}
                        onChange={(e) => setProvider(e.target.value)}>
                        <option value="groq">Groq (Free)</option>
                        <option value="openai">OpenAI</option>
                    </select>
                </label>

                {/* API Key input */}
                <label className="node-label">
                    API Key:
                    <input
                        className="node-input"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === 'groq' ? 'gsk_...' : 'sk-...'}
                    />
                </label>

                {/* Run button */}
                <button
                    className="node-test-btn"
                    onClick={handleExecute}
                    disabled={running}
                    style={{ marginTop: '8px' }}
                >
                    {running ? (
                        <span className="node-test-loading">
                            <span className="spinner" /> Running...
                        </span>
                    ) : '▶ Run Pipeline'}
                </button>

                {Object.keys(results).length > 0 && (
                    <div className="execute-results">
                        <div className="execute-results-label">Results</div>
                        {Object.entries(results).map(([nodeId, result]) => (
                            result && (
                                <div key={nodeId} className="execute-result-item">
                                    <div className="execute-result-node">{getNodeLabel(nodeId)}</div>
                                    <div className="execute-result-value">{result}</div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};