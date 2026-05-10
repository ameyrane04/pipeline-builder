// submit.js
// Sends pipeline to backend for DAG analysis.
// Shows result as a toast notification instead of a plain alert.

import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { showToast } from './toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    currentPipelineId: state.currentPipelineId,
});

export const SubmitButton = () => {
    const { nodes, edges, currentPipelineId } = useStore(selector, shallow);

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

            // Show result as individual toasts so it doesn't feel like a wall of text
            showToast(
                `Pipeline: ${data.num_nodes} nodes · ${data.num_edges} edges · ${data.is_dag ? 'Valid DAG ✅' : 'Has cycles ❌'}`,
                data.is_dag ? 'success' : 'warning',
                6000
            );

        } catch {
            showToast('Could not connect to backend. Is the server running?', 'error');
        }
    };

    return (
        <div className="submit-area">
            <button className="submit-btn" onClick={handleSubmit}>
                ▶ Run Pipeline
            </button>
        </div>
    );
};