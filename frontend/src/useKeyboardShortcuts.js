// useKeyboardShortcuts.js

import { useEffect } from 'react';
import { useStore } from './store';
import { showToast } from './toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useKeyboardShortcuts = () => {
    const { nodes, edges, currentPipelineId, currentPipelineName, clearCanvas } = useStore();

    useEffect(() => {
        const handleKeyDown = async (e) => {
            // Ignore shortcuts when user is typing in an input/textarea
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea') return;

            // Ctrl+S — Save pipeline
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (!currentPipelineName.trim()) {
                    showToast('Enter a pipeline name first', 'warning');
                    return;
                }
                try {
                    const res = await fetch(`${API_URL}/pipelines/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: currentPipelineId,
                            name: currentPipelineName,
                            nodes,
                            edges,
                        }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(`"${data.pipeline.name}" saved`, 'success');
                    }
                } catch {
                    showToast('Save failed', 'error');
                }
            }

            // Ctrl+Shift+X — Clear canvas
            if (e.ctrlKey && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                if (nodes.length === 0) return;
                clearCanvas();
                showToast('Canvas cleared', 'info');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);

    // Re-register when these values change so we always have fresh state
    }, [nodes, edges, currentPipelineId, currentPipelineName, clearCanvas]);
};