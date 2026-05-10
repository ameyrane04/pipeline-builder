// toolbar.js
// The top bar of the app. Shows the logo and all draggable node chips.
// When you add a new node type, you just add one more <DraggableNode> line here.

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
  return (
    <div className="toolbar">
      <span className="toolbar-logo">⚡ VectorShift</span>
      <div className="toolbar-nodes">
        {/* Original 4 nodes */}
        <DraggableNode type='customInput' label='Input' color='#065f46' />
        <DraggableNode type='customOutput' label='Output' color='#7f1d1d' />
        <DraggableNode type='llm' label='LLM' color='#1e3a5f' />
        <DraggableNode type='text' label='Text' color='#3b1f6b' />

        {/* 5 new nodes */}
        <DraggableNode type='note' label='📝 Note' color='#713f12' />
        <DraggableNode type='api' label='🌐 API' color='#164e63' />
        <DraggableNode type='condition' label='⚡ Condition' color='#4c1d95' />
        <DraggableNode type='transform' label='🔄 Transform' color='#1e3a5f' />
        <DraggableNode type='timer' label='⏱ Timer' color='#3b0764' />
      </div>
    </div>
  );
};
