import { useState } from 'react';
import { BaseNode } from './baseNode';

export const ApiNode = ({ id, data }) => {
    const [url, setUrl] = useState(data?.url || 'https://');
    const [method, setMethod] = useState(data?.method || 'GET');

    const inputs = [{ id: 'body', label: 'body' }];
    const outputs = [{ id: 'response', label: 'response' }];

    return (
        <BaseNode id={id} title="🌐 API Call" inputs={inputs} outputs={outputs}>
            <div style={{ paddingLeft: '48px', paddingRight: '64px' }}>
                <label className="node-label">
                    Method:
                    <select className="node-select" value={method}
                        onChange={(e) => setMethod(e.target.value)}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </label>
                <label className="node-label">
                    URL:
                    <input className="node-input" type="text" value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.example.com/data" />
                </label>
            </div>
        </BaseNode>
    );
};
