import { useState } from 'react';
import { BaseNode } from './baseNode';

export const OutputNode = ({ id, data }) => {
    const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
    const [outputType, setOutputType] = useState(data?.outputType || 'Text');

    if (data) {
        data.outputName = currName;
        data.outputType = outputType;
    }

    const inputs = [{ id: 'value', label: 'value' }];

    return (
        <BaseNode id={id} title="Output" inputs={inputs} outputs={[]}>
            <div style={{ paddingLeft: '48px' }}>
                <label className="node-label">
                    Name:
                    <input className="node-input" type="text" value={currName}
                        onChange={(e) => setCurrName(e.target.value)} />
                </label>
                <label className="node-label">
                    Type:
                    <select className="node-select" value={outputType}
                        onChange={(e) => setOutputType(e.target.value)}>
                        <option value="Text">Text</option>
                        <option value="Image">Image</option>
                    </select>
                </label>
            </div>

            {/* This shows the final pipeline result after execution */}
            {data?.executionResult && (
                <div className="node-result node-result-success" style={{ margin: '0 12px 12px' }}>
                    <div className="node-result-label">Pipeline Result:</div>
                    <div className="node-result-text">{data.executionResult}</div>
                </div>
            )}
        </BaseNode>
    );
};