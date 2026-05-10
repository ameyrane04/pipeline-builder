import { useState } from 'react';
import { BaseNode } from './baseNode';

export const TimerNode = ({ id, data }) => {
    const [delay, setDelay] = useState(data?.delay || 1000);
    const [unit, setUnit] = useState(data?.unit || 'ms');

    const inputs = [{ id: 'trigger', label: 'trigger' }];
    const outputs = [{ id: 'done', label: 'done' }];

    return (
        <BaseNode id={id} title="⏱ Timer" inputs={inputs} outputs={outputs}>
            <div style={{ paddingLeft: '48px', paddingRight: '56px' }}>
                <label className="node-label">
                    Delay:
                    <input className="node-input" type="number" value={delay}
                        onChange={(e) => setDelay(e.target.value)} min="0" />
                </label>
                <label className="node-label">
                    Unit:
                    <select className="node-select" value={unit}
                        onChange={(e) => setUnit(e.target.value)}>
                        <option value="ms">Milliseconds</option>
                        <option value="s">Seconds</option>
                        <option value="m">Minutes</option>
                    </select>
                </label>
            </div>
        </BaseNode>
    );
};
