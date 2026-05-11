// baseNode.js

import { Handle, Position } from 'reactflow';

export const BaseNode = ({ id, title, children, inputs = [], outputs = [] }) => {
  return (
    <div className="base-node">
      {/* Top header bar with the node title */}
      <div className="base-node-header">
        <span>{title}</span>
      </div>

      {/* Main content area — each node passes its own fields here */}
      <div className="base-node-content">
        {children}
      </div>

      {/* 
        Input handles — these appear on the LEFT side of the node.
      */}
      {inputs.map((input, index) => (
        <div key={input.id}>
          {/* Small label next to the handle so user knows what it's for */}
          <span className="handle-label handle-label-left" style={{
            top: input.style?.top || `${((index + 1) / (inputs.length + 1)) * 100}%`
          }}>
            {input.label}
          </span>
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-${input.id}`}
            style={input.style || { top: `${((index + 1) / (inputs.length + 1)) * 100}%` }}
          />
        </div>
      ))}

      {/* 
        Output handles — these appear on the RIGHT side of the node.  */}
      {outputs.map((output, index) => (
        <div key={output.id}>
          <span className="handle-label handle-label-right" style={{
            top: output.style?.top || `${((index + 1) / (outputs.length + 1)) * 100}%`
          }}>
            {output.label}
          </span>
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-${output.id}`}
            style={output.style || { top: `${((index + 1) / (outputs.length + 1)) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
};
