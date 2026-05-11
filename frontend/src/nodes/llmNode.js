import { useState } from 'react';
import { BaseNode } from './baseNode';

export const LLMNode = ({ id, data }) => {
    const [model, setModel] = useState(data?.model || 'openai/gpt-oss-120b');
    const [systemPrompt, setSystemPrompt] = useState(data?.systemPrompt || '');
    const [apiKey, setApiKey] = useState(data?.apiKey || '');

    // Sync state to data object so execution engine can read it
    if (data) {
        data.model = model;
        data.systemPrompt = systemPrompt;
        data.apiKey = apiKey;
    }

    const inputs = [
        { id: 'system', label: 'system', style: { top: '38%' } },
        { id: 'prompt', label: 'prompt', style: { top: '68%' } },
    ];
    const outputs = [
        { id: 'response', label: 'response', style: { top: '50%' } }
    ];

    return (
        <BaseNode id={id} title="LLM" inputs={inputs} outputs={outputs}>
            <div style={{ paddingLeft: '70px', paddingRight: '70px' }}>
                <label className="node-label">
                    Model:
                    <select className="node-select" value={model}
                        onChange={(e) => setModel(e.target.value)}>
                        {/* Groq models */}
                        <option value="openai/gpt-oss-120b">Llama3 8b (Groq)</option>
                        <option value="openai/gpt-oss-120b">Llama3 70b (Groq)</option>
                        <option value="openai/gpt-oss-120b">Mixtral 8x7b (Groq)</option>
                        {/* OpenAI models */}
                        <option value="gpt-4o">GPT-4o (OpenAI)</option>
                        <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
                    </select>
                </label>

                {/* 
                    System prompt stays here as an optional override.
                    If a node is connected to the system handle, that takes priority.
                    If nothing is connected, this field is used.
                */}
                <label className="node-label">
                    System Prompt (optional):
                    <textarea
                        className="node-textarea"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="You are a helpful assistant..."
                        style={{ minHeight: '50px', resize: 'vertical' }}
                    />
                </label>

                <p className="node-description" style={{ marginTop: '4px' }}>
                    Connect a node to <strong style={{color:'#a78bfa'}}>prompt</strong> handle to provide input.
                    Use Execute Panel below to run.
                </p>

                {/* Show execution result if available */}
                {data?.executionResult && (
                    <div className="node-result node-result-success">
                        <div className="node-result-label">Response:</div>
                        <div className="node-result-text">{data.executionResult}</div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};