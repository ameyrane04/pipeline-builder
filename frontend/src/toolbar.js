// toolbar.js
import { DraggableNode } from './draggableNode';
import { PipelineControls } from './pipelineControls';

export const PipelineToolbar = () => {
    return (
        <div className="toolbar">
            <span className="toolbar-logo">⚡ FlowCraft</span>
            <div className="toolbar-divider" />
            <div className="toolbar-nodes">
                <DraggableNode type='customInput' label='Input' color='#065f46' />
                <DraggableNode type='customOutput' label='Output' color='#7f1d1d' />
                <DraggableNode type='llm' label='LLM' color='#1e3a5f' />
                <DraggableNode type='text' label='Text' color='#3b1f6b' />
                <DraggableNode type='note' label='📝 Note' color='#713f12' />
                <DraggableNode type='api' label='🌐 API' color='#164e63' />
                <DraggableNode type='condition' label='⚡ Condition' color='#4c1d95' />
                <DraggableNode type='transform' label='🔄 Transform' color='#1e3a5f' />
                <DraggableNode type='timer' label='⏱ Timer' color='#3b0764' />
            </div>
            <div className="toolbar-divider" />
            {/* Save / Load / Clear controls */}
            <PipelineControls />
        </div>
    );
};