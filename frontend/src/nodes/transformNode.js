import { useState } from 'react';
import { BaseNode } from './baseNode';

export const TransformNode = ({ id, data }) => {
    const [operation, setOperation] = useState(data?.operation || 'uppercase');

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
                        <option value="trim">Trim whitespace</option>
                        <option value="reverse">Reverse</option>
                        <option value="length">Get length</option>
                    </select>
                </label>
            </div>
        </BaseNode>
    );
};
