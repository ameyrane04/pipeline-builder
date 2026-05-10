import { create } from "zustand";
import {
    addEdge as rfAddEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
} from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},

    // Current saved pipeline id — set when user saves or loads a pipeline
    // Used to update the correct pipeline on subsequent saves/submits
    currentPipelineId: null,
    currentPipelineName: '',

    getNodeID: (type) => {
        const newIDs = { ...get().nodeIDs };
        if (newIDs[type] === undefined) newIDs[type] = 0;
        newIDs[type] += 1;
        set({ nodeIDs: newIDs });
        return `${type}-${newIDs[type]}`;
    },

    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
    },

    onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection) => {
        set({
            edges: rfAddEdge({
                ...connection,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
            }, get().edges),
        });
    },

    // Load a full pipeline onto the canvas — replaces current nodes/edges
    loadPipeline: (pipeline) => {
        set({
            nodes: pipeline.nodes || [],
            edges: pipeline.edges || [],
            currentPipelineId: pipeline._id,
            currentPipelineName: pipeline.name,
        });
    },

    // Clear canvas completely
    clearCanvas: () => {
        set({
            nodes: [],
            edges: [],
            currentPipelineId: null,
            currentPipelineName: '',
            nodeIDs: {},
        });
    },

    setPipelineName: (name) => set({ currentPipelineName: name }),

    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            edges: get().edges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId
            ),
        });
    },

    deleteEdge: (edgeId) => {
        set({ edges: get().edges.filter((e) => e.id !== edgeId) });
    },

    deleteEdgeByHandle: (targetNodeId, targetHandle) => {
        set({
            edges: get().edges.filter(
                (e) => !(e.target === targetNodeId && e.targetHandle === targetHandle)
            ),
        });
    },

    addEdge: (edge) => {
        set({
            edges: rfAddEdge({
                ...edge,
                type: 'smoothstep',
                animated: true,
                markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' }
            }, get().edges),
        });
    },
}));