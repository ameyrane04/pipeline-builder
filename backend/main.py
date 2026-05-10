# main.py — FastAPI backend for the VectorShift pipeline builder
# 
# FastAPI is a Python web framework — think of it like Express in Node.js.
# You define "routes" (URLs) with decorators like @app.get() or @app.post()
# and FastAPI handles all the HTTP stuff for you.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any

app = FastAPI()

# CORS = Cross-Origin Resource Sharing
# Without this, the browser will BLOCK requests from localhost:3000 (React)
# to localhost:8000 (FastAPI) because they're on different ports.
# This middleware tells FastAPI to allow requests from our React app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models define the shape of the JSON we expect to receive.
# FastAPI uses these to automatically validate and parse the request body.
# If the request doesn't match the shape, FastAPI returns a 422 error automatically.

class Node(BaseModel):
    id: str
    type: str
    # 'data' and 'position' can be any structure, so we use Any
    data: Any = None
    position: Any = None

class Edge(BaseModel):
    id: str = ""
    source: str       # id of the node where this edge starts
    target: str       # id of the node where this edge ends
    sourceHandle: str = ""
    targetHandle: str = ""

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Check if the pipeline graph is a Directed Acyclic Graph (DAG).
    
    A DAG has no cycles — data can only flow forward, never loop back.
    
    We use Kahn's algorithm (topological sort):
    1. Count how many edges point INTO each node (in-degree)
    2. Start with nodes that have 0 incoming edges (nothing points to them)
    3. Process them one by one — when we process a node, reduce the in-degree
       of all nodes it points to
    4. If we process ALL nodes, it's a DAG (no cycles)
       If we get stuck before processing all nodes, there's a cycle
    """
    # Build a set of all node ids
    node_ids = {node.id for node in nodes}

    # in_degree = how many edges point INTO each node
    in_degree = {node.id: 0 for node in nodes}

    # adjacency list = for each node, which nodes does it point to?
    adj = {node.id: [] for node in nodes}

    for edge in edges:
        # Only count edges between nodes that exist in our node list
        if edge.source in node_ids and edge.target in node_ids:
            adj[edge.source].append(edge.target)
            in_degree[edge.target] += 1

    # Start with all nodes that have no incoming edges
    queue = [nid for nid, deg in in_degree.items() if deg == 0]
    visited = 0

    while queue:
        node = queue.pop(0)
        visited += 1
        # For each neighbour of this node, reduce their in-degree
        for neighbour in adj[node]:
            in_degree[neighbour] -= 1
            # If in-degree hits 0, this node is now "free" to process
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    # If we visited every node, no cycle exists
    return visited == len(nodes)


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    """
    Receives the pipeline from the frontend.
    Returns the count of nodes and edges, and whether the graph is a DAG.
    """
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(pipeline.nodes, pipeline.edges)

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': dag
    }
