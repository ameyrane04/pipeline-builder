// draggableNode.js
// A single draggable chip in the toolbar.
// When dragged onto the canvas, it triggers the onDrop in ui.js which creates the actual node.
// Now accepts a `color` prop so each node type can have its own colour.

export const DraggableNode = ({ type, label, color = '#1C2536' }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable-node"
      style={{ backgroundColor: color }}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {label}
    </div>
  );
};
