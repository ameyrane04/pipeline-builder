import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';

const NODE_OUTPUTS = {
    customInput: ['text'],
    llm: ['response'],
    text: ['output'],
    api: ['response'],
    condition: ['true', 'false'],
    transform: ['result'],
    timer: ['done'],
};

const selector = (state) => ({
    nodes: state.nodes,
    addEdge: state.addEdge,
    deleteEdgeByHandle: state.deleteEdgeByHandle,
});

export const TextNode = ({ id, data }) => {
    const [currText, setCurrText] = useState('');
    const [variables, setVariables] = useState([]); // [{ varKey, handleId, nodeId, field }]
    const [dropdownStep, setDropdownStep] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);

    const { nodes, addEdge, deleteEdgeByHandle } = useStore(selector, shallow);

    const availableNodes = nodes.filter(n => n.id !== id && NODE_OUTPUTS[n.type]);

    // Auto-resize height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [currText]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownStep(null);
                setSelectedNode(null);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleTextChange = (e) => {
        const val = e.target.value;
        setCurrText(val);
        if (val.endsWith('{{')) {
            setCurrText(val.slice(0, -2));
            setDropdownStep('node');
        }
    };

    const handleNodeSelect = (node) => {
        setSelectedNode(node);
        setDropdownStep('field');
    };

    const handleFieldSelect = (field) => {
        const varKey = `${selectedNode.id}.${field}`;
        const handleId = `${id}-var-${varKey}`;

        // Don't add duplicate
        if (variables.find(v => v.varKey === varKey)) {
            setDropdownStep(null);
            setSelectedNode(null);
            return;
        }

        setVariables(prev => [...prev, { varKey, handleId, nodeId: selectedNode.id, field }]);

        // Insert chip label into textarea text at cursor position
        setCurrText(prev => prev + `{{${varKey}}}`);

        addEdge({
            id: `edge-${selectedNode.id}-${id}-${field}`,
            source: selectedNode.id,
            sourceHandle: `${selectedNode.id}-${field}`,
            target: id,
            targetHandle: handleId,
        });

        setDropdownStep(null);
        setSelectedNode(null);
    };

    const removeVariable = (varKey, handleId) => {
        setVariables(prev => prev.filter(v => v.varKey !== varKey));
        setCurrText(prev => prev.replace(`{{${varKey}}}`, ''));
        deleteEdgeByHandle(id, handleId);
    };

    // Width based on longest line
    const nodeWidth = Math.max(220, Math.min(500, Math.max(...currText.split('\n').map(l => l.length), 20) * 8 + 60));

    return (
        <div className="base-node" style={{ width: `${nodeWidth}px` }}>
            <div className="base-node-header"><span>Text</span></div>

            <div className="base-node-content" style={{ position: 'relative' }}>
                <label className="node-label">Text:</label>

                {/* Variable chips */}
                {variables.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                        {variables.map(v => (
                            <span key={v.varKey} className="text-node-chip">
                                <span className="chip-icon">⬡</span>
                                {v.varKey}
                                <button className="chip-remove" onClick={() => removeVariable(v.varKey, v.handleId)}>×</button>
                            </span>
                        ))}
                    </div>
                )}

                {/* Textarea — normal editing, {{ triggers dropdown */}
                <textarea
                    ref={textareaRef}
                    className="node-textarea"
                    value={currText}
                    onChange={handleTextChange}
                    placeholder="Type here, use {{ to add variables..."
                    style={{ width: '100%', overflow: 'hidden', resize: 'none', minHeight: '60px' }}
                />

                {/* Two-step dropdown */}
                {dropdownStep && (
                    <div className="variable-dropdown" ref={dropdownRef}>
                        {dropdownStep === 'node' && (
                            <>
                                <div className="dropdown-header">
                                    <span className="dropdown-step">Step 1</span>
                                    <span>Select Node</span>
                                </div>
                                {availableNodes.length === 0
                                    ? <div className="dropdown-empty">No other nodes on canvas</div>
                                    : availableNodes.map(node => (
                                        <div key={node.id} className="dropdown-item" onClick={() => handleNodeSelect(node)}>
                                            <span className="dropdown-item-id">{node.id}</span>
                                            <span className="dropdown-item-type">{node.type}</span>
                                        </div>
                                    ))
                                }
                            </>
                        )}
                        {dropdownStep === 'field' && selectedNode && (
                            <>
                                <div className="dropdown-header">
                                    <span className="dropdown-back" onClick={() => { setDropdownStep('node'); setSelectedNode(null); }}>← Back</span>
                                    <span className="dropdown-step">Step 2</span>
                                    <span>Select Output</span>
                                </div>
                                {(NODE_OUTPUTS[selectedNode.type] || []).map(field => (
                                    <div key={field} className="dropdown-item" onClick={() => handleFieldSelect(field)}>
                                        <span className="dropdown-item-id">{field}</span>
                                        <span className="dropdown-item-type">Output</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Dynamic handles per variable */}
            {variables.map((v, index) => (
                <div key={v.varKey}>
                    <span className="handle-label handle-label-left"
                        style={{ top: `${((index + 1) / (variables.length + 1)) * 100}%` }}>
                        {v.varKey}
                    </span>
                    <Handle type="target" position={Position.Left} id={v.handleId}
                        style={{ top: `${((index + 1) / (variables.length + 1)) * 100}%` }} />
                </div>
            ))}

            <span className="handle-label handle-label-right" style={{ top: '50%' }}>output</span>
            <Handle type="source" position={Position.Right} id={`${id}-output`} />
        </div>
    );
};
