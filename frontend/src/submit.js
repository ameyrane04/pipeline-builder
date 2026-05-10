// submit.js
// Part 4: Sends the current pipeline (nodes + edges) to the FastAPI backend.
// The backend counts them and checks if it's a DAG, then we show an alert.

import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);

  const handleSubmit = async () => {
    try {
      // Send nodes and edges as JSON in the request body
      // The backend endpoint is /pipelines/parse
      const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        alert('Something went wrong. Make sure the backend is running.');
        return;
      }

      const data = await response.json();

      // Show user-friendly alert with the results
      alert(
        `✅ Pipeline Analysis\n\n` +
        `📦 Nodes: ${data.num_nodes}\n` +
        `🔗 Edges: ${data.num_edges}\n` +
        `🔄 Is DAG (no loops): ${data.is_dag ? 'Yes ✅' : 'No ❌'}`
      );
    } catch (err) {
      // This usually means the backend server isn't running
      alert('Could not connect to the backend. Is the FastAPI server running?');
    }
  };

  return (
    <div className="submit-area">
      <button className="submit-btn" onClick={handleSubmit}>
        Submit Pipeline
      </button>
    </div>
  );
};
