// llmNode.js
// Fixed: added actual textarea fields for system prompt and user prompt.
// Fixed: handle labels and content no longer overlap.

import { useState } from 'react';
import { BaseNode } from './baseNode';

export const LLMNode = ({ id, data }) => {
    const [systemPrompt, setSystemPrompt] = useState(data?.systemPrompt || '');
    const [userPrompt, setUserPrompt] = useState(data?.userPrompt || '');
    const [model, setModel] = useState(data?.model || 'gpt-4o');

    // Two inputs on the left — system at top, prompt below
    // Positioned at 40% and 75% so they align with the fields visually
    const inputs = [
        { id: 'system', label: 'system', style: { top: '38%' } },
        { id: 'prompt', label: 'prompt', style: { top: '68%' } },
    ];

    const outputs = [
        { id: 'response', label: 'response', style: { top: '50%' } }
    ];

    return (
        <BaseNode id={id} title="LLM" inputs={inputs} outputs={outputs}>
            <label className="node-label">
                Model:
                <select
                    className="node-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                </select>
            </label>

            {/* 
                Left padding on these fields so the handle labels
                (system / prompt) don't overlap with the field content.
                The handles sit on the left edge, labels are ~12px in,
                so we give the fields 70px left padding to clear them.
            */}
            <label className="node-label" style={{ paddingLeft: '70px' }}>
                System Prompt:
                <textarea
                    className="node-textarea"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    style={{ minHeight: '60px', resize: 'vertical' }}
                />
            </label>

            <label className="node-label" style={{ paddingLeft: '70px' }}>
                User Prompt:
                <textarea
                    className="node-textarea"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Type {{ to use variables..."
                    style={{ minHeight: '60px', resize: 'vertical' }}
                />
            </label>
        </BaseNode>
    );
};
