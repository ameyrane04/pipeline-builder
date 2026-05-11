// submit.

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { showToast } from './toast';
import { ExecutePanel } from './executePanel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    currentPipelineId: state.currentPipelineId,
});

export const SubmitButton = () => {
    const { nodes, edges, currentPipelineId } = useStore(selector, shallow);
    const [showExecute, setShowExecute] = useState(false);

    const handleSubmit = async () => {
        if (nodes.length === 0) {
            showToast('Add some nodes to the canvas first', 'warning');
            return;
        }
        try {
            const res = await fetch(`${API_URL}/pipelines/parse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges, pipelineId: currentPipelineId }),
            });
            if (!res.ok) {
                showToast('Backend error — check the server', 'error');
                return;
            }
            const data = await res.json();
            showToast(
                `${data.num_nodes} nodes · ${data.num_edges} edges · ${data.is_dag ? 'Valid DAG ✅' : 'Has cycles ❌'}`,
                data.is_dag ? 'success' : 'warning',
                6000
            );
        } catch {
            showToast('Could not connect to backend', 'error');
        }
    };

    return (
        <div className="submit-area">
            {/* Execute panel slides up when toggled */}
            {showExecute && <ExecutePanel />}

            <div className="submit-buttons">
                {/* Validate pipeline — DAG check */}
                <button className="submit-btn-secondary" onClick={handleSubmit}>
                    ✓ Validate
                </button>

                {/* Toggle execute panel */}
                <button
                    className="submit-btn"
                    onClick={() => setShowExecute(v => !v)}
                >
                    {showExecute ? '✕ Close' : '▶ Execute Pipeline'}
                </button>
            </div>
        </div>
    );
};