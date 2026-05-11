// transformNode.js
import { useState } from 'react';
import { BaseNode } from './baseNode';


const OPERATIONS = {
    uppercase:  (text) => text.toUpperCase(),
    lowercase:  (text) => text.toLowerCase(),
    trim:       (text) => text.trim(),
    reverse:    (text) => text.split('').reverse().join(''),
    length:     (text) => `Character count: ${text.length}`,
    capitalize: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
    snake_case: (text) => text.toLowerCase().replace(/\s+/g, '_'),
    camel_case: (text) => text.toLowerCase().replace(/\s+(.)/g, (_, c) => c.toUpperCase()),
};

export const TransformNode = ({ id, data }) => {
    const [operation, setOperation] = useState(data?.operation || 'uppercase');
    const [inputText, setInputText] = useState('');

    const result = inputText ? OPERATIONS[operation](inputText) : '';

    const inputs = [{ id: 'text', label: 'text' }];
    const outputs = [{ id: 'result', label: 'result' }];

    return (
        <BaseNode id={id} title="🔄 Transform" inputs={inputs} outputs={outputs}>
            <div style={{ paddingLeft: '48px', paddingRight: '56px' }}>

                <label className="node-label">
                    Operation:
                    <select className="node-select" value={operation}
                        onChange={(e) => setOperation(e.target.value)}>
                        <option value="uppercase">Uppercase</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="capitalize">Capitalize</option>
                        <option value="trim">Trim whitespace</option>
                        <option value="reverse">Reverse</option>
                        <option value="length">Get length</option>
                        <option value="snake_case">snake_case</option>
                        <option value="camel_case">camelCase</option>
                    </select>
                </label>

                <label className="node-label">
                    Input text:
                    <input
                        className="node-input"
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type to preview..."
                    />
                </label>

                {/* only show when there's input */}
                {result && (
                    <div className="node-result node-result-success">
                        <div className="node-result-label">Result:</div>
                        <div className="node-result-text">{result}</div>
                    </div>
                )}

            </div>
        </BaseNode>
    );
};