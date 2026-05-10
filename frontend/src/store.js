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
    updateNodeField: (nodeId, fieldName, fieldValue) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    node.data = { ...node.data, [fieldName]: fieldValue };
                }
                return node;
            }),
        });
    },

    // Delete a node by id — also cleans up any edges connected to it
    deleteNode: (nodeId) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            // Remove all edges where this node is either the source or target
            edges: get().edges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId
            ),
        });
    },

    // Delete a single edge by id
    deleteEdge: (edgeId) => {
        set({
            edges: get().edges.filter((e) => e.id !== edgeId),
        });
    },

    // Used by TextNode when a variable chip is removed —
    // removes the specific edge that was created for that variable connection
    deleteEdgeByHandle: (targetNodeId, targetHandle) => {
        set({
            edges: get().edges.filter(
                (e) => !(e.target === targetNodeId && e.targetHandle === targetHandle)
            ),
        });
    },

    // Add a specific edge — used by TextNode to programmatically connect nodes
    // when user selects a variable from the dropdown
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
