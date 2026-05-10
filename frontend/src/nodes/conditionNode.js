import { useState } from 'react';
import { BaseNode } from './baseNode';

export const ConditionNode = ({ id, data }) => {
    const [condition, setCondition] = useState(data?.condition || '');

    const inputs = [{ id: 'value', label: 'value' }];
    const outputs = [
        { id: 'true', label: 'true', style: { top: '35%' } },
        { id: 'false', label: 'false', style: { top: '65%' } },
    ];

    return (
        <BaseNode id={id} title="⚡ Condition" inputs={inputs} outputs={outputs}>
            <div style={{ paddingLeft: '48px', paddingRight: '56px' }}>
                <label className="node-label">
                    If value contains:
                    <input className="node-input" type="text" value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="e.g. error" />
                </label>
            </div>
        </BaseNode>
    );
};
