// ui.js
// Added: keyboard delete support for selected nodes/edges
// Added: onNodesDelete and onEdgesDelete handlers

import { useState, useRef, useCallback } from 'react';
import ReactFlow, {
    Controls, Background, MiniMap
} from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { NoteNode } from './nodes/noteNode';
import { ApiNode } from './nodes/apiNode';
import { ConditionNode } from './nodes/conditionNode';
import { TransformNode } from './nodes/transformNode';
import { TimerNode } from './nodes/timerNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
    customInput: InputNode,
    llm: LLMNode,
    customOutput: OutputNode,
    text: TextNode,
    note: NoteNode,
    api: ApiNode,
    condition: ConditionNode,
    transform: TransformNode,
    timer: TimerNode,
};

const selector = (state) => ({
    nodes: state.nodes,
    edges: state.edges,
    getNodeID: state.getNodeID,
    addNode: state.addNode,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    deleteNode: state.deleteNode,
    deleteEdge: state.deleteEdge,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const {
        nodes, edges, getNodeID, addNode,
        onNodesChange, onEdgesChange, onConnect,
        deleteNode, deleteEdge,
    } = useStore(selector, shallow);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

        if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
            if (!type) return;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
                id: nodeID,
                type,
                position,
                data: { id: nodeID, nodeType: type },
            };

            addNode(newNode);
        }
    }, [reactFlowInstance]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Called by ReactFlow when user presses Backspace/Delete on selected nodes
    const onNodesDelete = useCallback((deletedNodes) => {
        deletedNodes.forEach((node) => deleteNode(node.id));
    }, [deleteNode]);

    // Called by ReactFlow when user presses Backspace/Delete on selected edges
    const onEdgesDelete = useCallback((deletedEdges) => {
        deletedEdges.forEach((edge) => deleteEdge(edge.id));
    }, [deleteEdge]);

    return (
        <div className="pipeline-canvas" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Background color="#2d3748" gap={gridSize} />
                <Controls />
                <MiniMap
                    nodeColor={() => '#7c3aed'}
                    maskColor="rgba(0,0,0,0.6)"
                />
            </ReactFlow>
        </div>
    );
};
