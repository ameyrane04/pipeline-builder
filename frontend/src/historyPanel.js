// historyPanel.js
import { useState, useEffect } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const selector = (state) => ({
    currentPipelineId: state.currentPipelineId,
    currentPipelineName: state.currentPipelineName,
});

export const HistoryPanel = () => {
    const { currentPipelineId, currentPipelineName } = useStore(selector, shallow);
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentPipelineId) {
            fetchHistory();
        }
        if (!currentPipelineId) {
            setHistory([]);
        }
    }, [isOpen, currentPipelineId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/pipelines/${currentPipelineId}`);
            const data = await res.json();
            setHistory(data.pipeline?.history || []);
        } catch {
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle button — sits on the right edge of the canvas */}
            <button
                className="history-toggle"
                onClick={() => setIsOpen(v => !v)}
                title="Pipeline History"
            >
                {isOpen ? '✕' : '🕐'}
            </button>

            {/* Sliding panel */}
            <div className={`history-panel ${isOpen ? 'history-panel-open' : ''}`}>
                <div className="history-panel-header">
                    <span>📋 Submission History</span>
                    {currentPipelineName && (
                        <span className="history-pipeline-name">{currentPipelineName}</span>
                    )}
                </div>

                <div className="history-panel-body">
                    {!currentPipelineId ? (
                        <div className="history-empty">
                            Save a pipeline first to see its history
                        </div>
                    ) : loading ? (
                        <div className="history-empty">Loading...</div>
                    ) : history.length === 0 ? (
                        <div className="history-empty">
                            No submissions yet — click Run Pipeline
                        </div>
                    ) : (
                        // Most recent first
                        [...history].reverse().map((entry, i) => (
                            <div key={i} className="history-entry">
                                <div className="history-entry-top">
                                    <span className={`history-dag-badge ${entry.is_dag ? 'dag-yes' : 'dag-no'}`}>
                                        {entry.is_dag ? 'Valid DAG' : 'Has Cycle'}
                                    </span>
                                    <span className="history-date">
                                        {new Date(entry.submittedAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="history-entry-stats">
                                    <span>📦 {entry.num_nodes} nodes</span>
                                    <span>🔗 {entry.num_edges} edges</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};