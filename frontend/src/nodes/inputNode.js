import { useState } from 'react';
import { BaseNode } from './baseNode';

export const InputNode = ({ id, data }) => {
    const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
    const [inputType, setInputType] = useState(data?.inputType || 'Text');
    const [inputValue, setInputValue] = useState(data?.inputValue || '');

    // Directly mutate data object so ReactFlow always has latest values
    // This is the simplest way to keep node data in sync with local state
    if (data) {
        data.inputName = currName;
        data.inputType = inputType;
        data.inputValue = inputValue;
    }

    const outputs = [{ id: 'value', label: 'value' }];

    return (
        <BaseNode id={id} title="Input" inputs={[]} outputs={outputs}>
            <label className="node-label">
                Name:
                <input className="node-input" type="text" value={currName}
                    onChange={(e) => setCurrName(e.target.value)} />
            </label>
            <label className="node-label">
                Type:
                <select className="node-select" value={inputType}
                    onChange={(e) => setInputType(e.target.value)}>
                    <option value="Text">Text</option>
                    <option value="File">File</option>
                </select>
            </label>
            <label className="node-label">
                Value:
                <textarea
                    className="node-textarea"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter input for the pipeline..."
                    style={{ minHeight: '50px', resize: 'vertical' }}
                />
            </label>
            {data?.executionResult && (
                <div className="node-result node-result-success">
                    <div className="node-result-label">Output:</div>
                    <div className="node-result-text">{data.executionResult}</div>
                </div>
            )}
        </BaseNode>
    );
};