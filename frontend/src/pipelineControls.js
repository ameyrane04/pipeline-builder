// pipelineControls.js
// Save, Load, and Clear pipeline controls.
// Sits in the toolbar alongside the node chips.

import { useState, useEffect } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { showToast } from './toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    currentPipelineId: state.currentPipelineId,
    currentPipelineName: state.currentPipelineName,
    setPipelineName: state.setPipelineName,
    loadPipeline: state.loadPipeline,
    clearCanvas: state.clearCanvas,
});

export const PipelineControls = () => {
    const {
        nodes, edges,
        currentPipelineId, currentPipelineName,
        setPipelineName, loadPipeline, clearCanvas
    } = useStore(selector, shallow);

    const [savedPipelines, setSavedPipelines] = useState([]);
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch saved pipelines when load menu opens
    useEffect(() => {
        if (showLoadMenu) fetchPipelines();
    }, [showLoadMenu]);

    const fetchPipelines = async () => {
        try {
            const res = await fetch(`${API_URL}/pipelines`);
            const data = await res.json();
            setSavedPipelines(data.pipelines || []);
        } catch {
            showToast('Could not fetch saved pipelines', 'error');
        }
    };

    const handleSave = async () => {
        if (!currentPipelineName.trim()) {
            showToast('Please enter a pipeline name first', 'warning');
            return;
        }
        setSaving(true);
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
                // Update store with new pipeline id if it was a fresh save
                loadPipeline(data.pipeline);
                showToast(`"${data.pipeline.name}" saved successfully`, 'success');
            } else {
                showToast(data.error || 'Save failed', 'error');
            }
        } catch {
            showToast('Could not connect to backend', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLoad = async (id) => {
        try {
            const res = await fetch(`${API_URL}/pipelines/${id}`);
            const data = await res.json();
            if (data.pipeline) {
                loadPipeline(data.pipeline);
                showToast(`"${data.pipeline.name}" loaded`, 'success');
                setShowLoadMenu(false);
            }
        } catch {
            showToast('Failed to load pipeline', 'error');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // don't trigger load when clicking delete
        try {
            await fetch(`${API_URL}/pipelines/${id}`, { method: 'DELETE' });
            setSavedPipelines(prev => prev.filter(p => p._id !== id));
            showToast('Pipeline deleted', 'info');
        } catch {
            showToast('Failed to delete pipeline', 'error');
        }
    };

    const handleClear = () => {
        if (nodes.length === 0) return;
        if (window.confirm('Clear the canvas? Unsaved changes will be lost.')) {
            clearCanvas();
            showToast('Canvas cleared', 'info');
        }
    };

    return (
        <div className="pipeline-controls">
            {/* Pipeline name input */}
            <input
                className="pipeline-name-input"
                type="text"
                placeholder="Pipeline name..."
                value={currentPipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
            />

            {/* Save button */}
            <button className="ctrl-btn ctrl-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? '...' : '💾 Save'}
            </button>

            {/* Load button + dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    className="ctrl-btn ctrl-btn-load"
                    onClick={() => setShowLoadMenu(v => !v)}
                >
                    📂 Load
                </button>

                {showLoadMenu && (
                    <div className="load-dropdown">
                        <div className="load-dropdown-header">Saved Pipelines</div>
                        {savedPipelines.length === 0
                            ? <div className="load-dropdown-empty">No saved pipelines yet</div>
                            : savedPipelines.map(p => (
                                <div key={p._id} className="load-dropdown-item"
                                    onClick={() => handleLoad(p._id)}>
                                    <div>
                                        <div className="load-item-name">{p.name}</div>
                                        <div className="load-item-date">
                                            {new Date(p.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        className="load-item-delete"
                                        onClick={(e) => handleDelete(e, p._id)}
                                    >×</button>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>

            {/* Clear canvas */}
            <button className="ctrl-btn ctrl-btn-clear" onClick={handleClear}>
                🗑 Clear
            </button>
        </div>
    );
};