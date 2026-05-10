// inputNode.js
// Refactored to use BaseNode.
// All the wrapper/handle boilerplate is gone — we just define what's unique to this node.

import { useState } from 'react';
import { BaseNode } from './baseNode';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  // This node has NO input handles (it's the start of the pipeline)
  // and ONE output handle on the right called "value"
  const outputs = [{ id: 'value', label: 'value' }];

  return (
    <BaseNode id={id} title="Input" inputs={[]} outputs={outputs}>
      <label className="node-label">
        Name:
        <input
          className="node-input"
          type="text"
          value={currName}
          onChange={(e) => setCurrName(e.target.value)}
        />
      </label>
      <label className="node-label">
        Type:
        <select
          className="node-select"
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
        >
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </label>
    </BaseNode>
  );
};
