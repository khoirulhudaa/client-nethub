import {
    Background,
    Handle,
    MiniMap,
    Position,
    ReactFlow,
    addEdge,
    useEdgesState,
    useNodesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Eraser, Trash2, Type } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const shapeStyle = {
  padding: "10px 16px",
  border: "2px solid #64748b",
  background: "#1e293b",          // gelap
  color: "#f8fafc",               // teks putih
  fontSize: 13,
  fontWeight: 500,
  textAlign: "center",
  minWidth: 100,
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
};

function StartEndNode({ data, selected }) {
  return (
    <div
      style={{
        ...shapeStyle,
        borderRadius: 999,
        borderColor: selected ? "#3b82f6" : "#64748b",
        background: selected ? "#1e3a5f" : "#1e293b",
        color: "#f8fafc",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div style={{ color: "#f8fafc" }}>{data.label || "Start / End"}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

function ProcessNode({ data, selected }) {
  return (
    <div
      style={{
        ...shapeStyle,
        borderRadius: 6,
        borderColor: selected ? "#3b82f6" : "#64748b",
        background: selected ? "#1e3a5f" : "#1e293b",
        color: "#f8fafc",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div style={{ color: "#f8fafc" }}>{data.label || "Process"}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

function DecisionNode({ data, selected }) {
  return (
    <div
      style={{
        ...shapeStyle,
        width: 110,
        height: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(45deg)",
        borderColor: selected ? "#3b82f6" : "#64748b",
        background: selected ? "#1e3a5f" : "#1e293b",
        color: "#f8fafc",
        padding: 0,
      }}
    >
      {/* handles tetap sama */}
      <div style={{ transform: "rotate(-45deg)", fontSize: 12, maxWidth: 70, color: "#f8fafc" }}>
        {data.label || "Decision"}
      </div>
      {/* handles lainnya */}
    </div>
  );
}

function InputOutputNode({ data, selected }) {
  return (
    <div
      style={{
        ...shapeStyle,
        clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
        border: "none",
        boxShadow: selected ? "0 0 0 2px #3b82f6" : "0 0 0 2px #64748b",
        background: selected ? "#1e3a5f" : "#1e293b",
        color: "#f8fafc",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div style={{ color: "#f8fafc" }}>{data.label || "Input / Output"}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

const nodeTypes = {
  startEnd: StartEndNode,
  process: ProcessNode,
  decision: DecisionNode,
  inputOutput: InputOutputNode,
};

/* ===== Palette ===== */
const PALETTE = [
  { type: "startEnd", label: "Start / End", color: "#64748b" },
  { type: "process", label: "Process", color: "#3b82f6" },
  { type: "decision", label: "Decision", color: "#f59e0b" },
  { type: "inputOutput", label: "Input / Output", color: "#10b981" },
];

export default function FlowchartCanvas({ value, onChange, readOnly = false, height }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(value?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(value?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);

  // ← TAMBAHKAN INI: sync ulang state internal saat prop `value` berubah dari luar
  const hasInitialized = useRef(false);
  useEffect(() => {
    // Skip di render pertama karena useNodesState/useEdgesState sudah handle itu
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    setNodes(value?.nodes || []);
    setEdges(value?.edges || []);
  }, [value]); 

  // Sync ke parent
  const sync = useCallback(
    (newNodes, newEdges) => {
      onChange?.({ nodes: newNodes, edges: newEdges });
    },
    [onChange]
  );

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(
        { ...params, animated: true, style: { stroke: "#64748b" } },
        edges
      );
      setEdges(newEdges);
      sync(nodes, newEdges);
    },
    [edges, nodes, setEdges, sync]
  );

  const onNodesChangeInternal = useCallback(
    (changes) => {
      onNodesChange(changes);
      // setelah change, ambil state terbaru via timeout kecil
      setTimeout(() => {
        setNodes((nds) => {
          sync(nds, edges);
          return nds;
        });
      }, 0);
    },
    [onNodesChange, edges, setNodes, sync]
  );

  const onEdgesChangeInternal = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((eds) => {
          sync(nodes, eds);
          return eds;
        });
      }, 0);
    },
    [onEdgesChange, nodes, setEdges, sync]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Drag dari palette
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("label");
      if (!type) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 60,
        y: event.clientY - bounds.top - 30,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label },
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      sync(newNodes, edges);
    },
    [nodes, edges, setNodes, sync]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const updateLabel = (newLabel) => {
    if (!selectedNode) return;
    const newNodes = nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n
    );
    setNodes(newNodes);
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: newLabel } });
    sync(newNodes, edges);
  };

  const deleteSelected = () => {
    if (!selectedNode) return;
    const newNodes = nodes.filter((n) => n.id !== selectedNode.id);
    const newEdges = edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    sync(newNodes, newEdges);
  };

  const clearAll = () => {
    if (!confirm("Hapus semua node & edge?")) return;
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    sync([], []);
  };

  return (
    <div className="flex flex-col gap-3">
        {
        !readOnly && (
        <div className="flex flex-wrap items-center gap-2">
            {PALETTE.map((item) => (
                <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.label)}
                    className="cursor-grab rounded-lg border bg-white px-3 py-1.5 text-xs font-medium shadow-sm active:cursor-grabbing dark:bg-white/5 dark:border-white/10"
                    style={{ borderColor: item.color }}
                >
                    {item.label}
                </div>
            ))}
            <button
                type="button"
                onClick={clearAll}
                className="ml-auto hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white hover:text-slate-200 active:scale-[0.99]"
            >
            Clear All
            <Eraser size={12} className="relative top-[-1px]" />
            </button>
        </div>
        )}

      {/* Canvas */}
    <div
        className="h-full min-h-[500px] rounded-xl border border-slate-400/60 overflow-hidden dark:border-white/10"
        style={{ height: height ? `${height}px` : "420px" }}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        >
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeInternal}
            onEdgesChange={onEdgesChangeInternal}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            >
            {/* Background dots */}
            <Background 
                variant="dots" 
                gap={16} 
                size={1.2} 
                color="#64748b" 
                className="opacity-40"
            />
            <MiniMap />
            </ReactFlow>
      </div>

      {/* Edit selected node */}
      {selectedNode && (
        <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-3 dark:bg-white/5">
          <Type size={16} className="text-gray-500" />
          <input
            className="input-field flex-1"
            value={selectedNode.data?.label || ""}
            onChange={(e) => updateLabel(e.target.value)}
            placeholder="Label node..."
          />
          <button
            type="button"
            onClick={deleteSelected}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      )}
    </div>
  );
}