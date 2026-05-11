# Pipeline Builder

A visual AI pipeline builder inspired by tools like n8n and LangFlow. Drag, connect, and configure nodes to build data processing workflows — then submit to validate and analyze your pipeline. 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

![Pipeline Builder](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

## Features

- **Visual Pipeline Canvas** — drag and drop nodes, connect them with edges, pan and zoom
- **9 Node Types** — Input, Output, LLM, Text, API Call, Condition, Transform, Timer, Note
- **Smart Text Node** — type `{{` to reference other nodes via a two-step dropdown, auto-connects edges
- **Node Abstraction** — all nodes share a `BaseNode` component, making new nodes trivial to add
- **Pipeline Validation** — submit your pipeline to check node/edge count and DAG detection (no loops)
- **Save & Load** — persist pipelines to MongoDB, load them back onto the canvas
- **Submit History** — every pipeline submission is logged with results
- **Delete Support** — select any node or edge and press Backspace/Delete to remove

## Tech Stack

- **Frontend** — React, ReactFlow, Zustand
- **Backend** — Node.js, Express, MongoDB, Mongoose
- **Hosting** — Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
# create a .env file with:
# MONGODB_URI=your_mongodb_connection_string
# PORT=5000
npm run dev
```

## Project Structure

```
pipeline-builder/
├── frontend/
│   └── src/
│       ├── nodes/          # All node components
│       │   ├── baseNode.js # Core node abstraction
│       │   ├── inputNode.js
│       │   ├── outputNode.js
│       │   ├── llmNode.js
│       │   ├── textNode.js
│       │   └── ...5 more
│       ├── store.js        # Zustand state management
│       ├── ui.js           # ReactFlow canvas
│       ├── toolbar.js      # Node toolbar
│       └── submit.js       # Pipeline submission
└── backend/
    ├── server.js           # Express app
    ├── routes/
    │   └── pipelines.js    # Pipeline endpoints
    └── models/
        └── Pipeline.js     # Mongoose schema
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/pipelines/parse` | Validate pipeline, check DAG |
| POST | `/pipelines/save` | Save pipeline to MongoDB |
| GET | `/pipelines` | Get all saved pipelines |
| GET | `/pipelines/:id` | Load a specific pipeline |

## How DAG Detection Works

The backend uses **Kahn's Algorithm** to detect cycles in the pipeline graph. It counts incoming edges per node (in-degree), processes nodes with zero incoming edges first, and checks if all nodes can be processed. If any nodes remain unprocessed, a cycle exists.
