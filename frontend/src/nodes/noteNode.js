// noteNode.js
// A simple sticky note — no handles, no connections.
// Used to leave comments or labels on the canvas for documentation purposes.

import { useState } from 'react';
import { BaseNode } from './baseNode';

export const NoteNode = ({ id, data }) => {
  const [text, setText] = useState(data?.text || 'Add a note...');

  // No inputs, no outputs — this node is purely visual/informational
  return (
    <BaseNode id={id} title="📝 Note" inputs={[]} outputs={[]}>
      <textarea
        className="node-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a note..."
        style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
      />
    </BaseNode>
  );
};
