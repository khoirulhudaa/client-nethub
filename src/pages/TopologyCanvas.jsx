import {
  Background,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import {
  AlertTriangle,
  Camera,
  Cloud,
  HardDrive,
  HardDriveDownload,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Network,
  Phone,
  Power,
  Printer,
  Router,
  Server,
  Shield,
  Smartphone,
  StickyNote,
  Trash2,
  Wifi,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { validateConnection } from "../utils/cableRules";

/* ====================== Custom Node ====================== */
const HardwareNode = ({ data, selected }) => {
  const Icon = data.icon || Router;

  // Device yang ingin ditampilkan berbeda (peripheral)
  const isPeripheral = ["Monitor", "Mouse", "Keyboard"].includes(data.type);

  // Warna khusus untuk peripheral (hijau)
  const peripheralColor = "#16a34a"; // green-600

  if (isPeripheral) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 bg-white p-2.5 shadow-md transition dark:bg-gray-900 ${
          selected
            ? "border-green-500 ring-2 ring-green-500/30"
            : "border-green-200 dark:border-green-500/30"
        }`}
        style={{ minWidth: 70, minHeight: 70 }}
      >
        <Handle type="target" position={Position.Top} className="!bg-green-500" />
        <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
        <Handle type="source" position={Position.Right} className="!bg-green-500" />
        <Handle type="target" position={Position.Left} className="!bg-green-500" />

        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${peripheralColor}15`, color: peripheralColor }}
        >
          <Icon size={22} />
        </div>

        {/* Label kecil di bawah (opsional, bisa dihapus kalau mau pure icon saja) */}
        {/* <p className="mt-1.5 text-[10px] font-medium text-green-700 dark:text-green-400">
          {data.label || data.type}
        </p> */}
      </div>
    );
  }

  // ===== Tampilan normal untuk hardware lain =====
  return (
    <div
      className={`min-w-[140px] rounded-xl border-2 bg-white p-3 shadow-md transition dark:bg-gray-900 ${
        selected
          ? "border-accent ring-2 ring-accent/30"
          : "border-gray-200 dark:border-white/10"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent" />
      <Handle type="source" position={Position.Right} className="!bg-accent" />
      <Handle type="target" position={Position.Left} className="!bg-accent" />

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight">{data.label}</p>
          <p className="text-[10px] text-gray-400">{data.type}</p>
        </div>
      </div>

      {data.note && (
        <div className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <div className="flex items-start gap-1">
            <StickyNote size={12} className="mt-0.5 shrink-0" />
            <span>{data.note}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  hardware: HardwareNode,
};

/* ====================== Hardware Types ====================== */
export const HARDWARE_TYPES = [
  // Core Network
  { type: "Router", icon: Router },
  { type: "MikroTik", icon: Router },
  { type: "Switch", icon: HardDrive },
  { type: "Switch PoE", icon: HardDrive },
  { type: "Hub", icon: Network },
  { type: "Bridge", icon: Network },
  { type: "Firewall", icon: Shield },
  { type: "Load Balancer", icon: Network },
  { type: "Modem", icon: Router },
  { type: "Media Converter", icon: Network },
  { type: "HTB", icon: Network },
  { type: "Wireless", icon: Wifi },

  // Server & Storage
  { type: "Server", icon: Server },
  { type: "NAS", icon: HardDrive },

  // End Devices
  { type: "PC", icon: Monitor },
  { type: "Laptop", icon: Laptop },
  { type: "Smartphone", icon: Smartphone },
  { type: "Monitor", icon: Monitor },
  { type: "Mouse", icon: Mouse },
  { type: "Keyboard", icon: Keyboard },

  // Wireless & Access
  { type: "Access Point", icon: Wifi },

  // CCTV & Security
  { type: "CCTV IP", icon: Camera },
  { type: "CCTV Analog", icon: Camera },
  { type: "DVR/DVR", icon: HardDriveDownload },
  { type: "PSU DVR", icon: Power },

  // Peripheral & Other
  { type: "Printer/FC", icon: Printer },
  { type: "Telepon", icon: Phone },
  { type: "UPS", icon: Zap },
  { type: "Cloud", icon: Cloud },
];

// ====================== Cable Types (SUPER LENGKAP) ======================
export const CABLE_TYPES = [
  { id: "utp", label: "LAN", color: "#22c55e", style: "solid" },
  { id: "fiber", label: "Fiber Optic", color: "#f59e0b", style: "dashed" },
  { id: "coaxial", label: "Coaxial (RG6)", color: "#ef4444", style: "solid" },
  { id: "rg59", label: "RG59", color: "#dc2626", style: "solid" },
  { id: "serial", label: "Console", color: "#8b5cf6", style: "dotted" },
  { id: "power", label: "Power", color: "#64748b", style: "solid" },
  { id: "bnc", label: "BNC", color: "#f97316", style: "solid" },
  { id: "hdmi", label: "HDMI", color: "#0ea5e9", style: "solid" },
  { id: "vga", label: "VGA", color: "#6366f1", style: "solid" },
  { id: "usb", label: "USB", color: "#14b8a6", style: "solid" },
  { id: "wireless", label: "Wireless", color: "#06b6d4", style: "dashed" },
];

/* ====================== Main Component ====================== */
export default function TopologyCanvas({
  value = { nodes: [], edges: [] },
  onChange,
  readOnly = false,
  mode = "editor", // "editor" | "quiz" | "review"
  allowedHardware = null, // array of type string, null = semua
  allowedCables = null, // array of cable id, null = semua
  showToolbar = true,
  height = 620,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(value.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(value.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedCable, setSelectedCable] = useState(CABLE_TYPES[0]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [connectionWarnings, setConnectionWarnings] = useState([]); // array of { edgeId, message }
  const [hardwareSearch, setHardwareSearch] = useState("");

  // Filter berdasarkan allowed*
  const availableHardware = allowedHardware
    ? HARDWARE_TYPES.filter((h) => allowedHardware.includes(h.type))
    : HARDWARE_TYPES;

  const availableCables = allowedCables
    ? CABLE_TYPES.filter((c) => allowedCables.includes(c.id))
    : CABLE_TYPES;

  // Pastikan selectedCable selalu valid
  useEffect(() => {
    if (availableCables.length > 0 && !availableCables.find((c) => c.id === selectedCable.id)) {
      setSelectedCable(availableCables[0]);
    }
  }, [availableCables, selectedCable]);

  // Sync dari parent
  useEffect(() => {
    setNodes(value.nodes || []);
    setEdges(value.edges || []);
  }, [value, setNodes, setEdges]);

  const updateParent = useCallback(
    (newNodes, newEdges) => {
      onChange?.({ nodes: newNodes, edges: newEdges });
    },
    [onChange]
  );

  const onConnect = useCallback(
    (params) => {
      if (readOnly) return;

      const cable = selectedCable;

      const newEdges = addEdge(
        {
          ...params,
          type: "smoothstep",
          animated: cable.id === "wireless" || cable.id === "fiber",
          style: {
            stroke: cable.color,
            strokeWidth: 2.5,
            strokeDasharray:
              cable.style === "dashed"
                ? "6 4"
                : cable.style === "dotted"
                ? "2 3"
                : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: cable.color,
          },
          label: cable.label,
          labelStyle: { fill: cable.color, fontSize: 10, fontWeight: 600 },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          data: { cableType: cable.id },
        },
        edges
      );

      setEdges(newEdges);
      updateParent(nodes, newEdges);
    },
    [edges, nodes, readOnly, selectedCable, setEdges, updateParent]
  );

  const onNodesChangeInternal = useCallback(
    (changes) => {
      onNodesChange(changes);
      setTimeout(() => {
        setNodes((nds) => {
          updateParent(nds, edges);
          return nds;
        });
      }, 0);
    },
    [onNodesChange, edges, setNodes, updateParent]
  );
  
  const checkAllWarnings = useCallback((currentNodes, currentEdges) => {
    const warnings = [];

    currentEdges.forEach((edge) => {
      const sourceNode = currentNodes.find((n) => n.id === edge.source);
      const targetNode = currentNodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const sourceType = sourceNode.data?.type;
      const targetType = targetNode.data?.type;
      const cableType = edge.data?.cableType || "utp";

      const result = validateConnection(sourceType, targetType, cableType);

      if (!result.valid) {
        warnings.push({
          edgeId: edge.id,
          message: result.message,
        });
      }
    });

    setConnectionWarnings(warnings);
  }, []);

  useEffect(() => {
    checkAllWarnings(nodes, edges);
  }, [nodes, edges, checkAllWarnings]);


  const getEdgeStyle = (edge, warnings) => {
    const isInvalid = warnings.some((w) => w.edgeId === edge.id);
    const cable = CABLE_TYPES.find((c) => c.id === edge.data?.cableType) || CABLE_TYPES[0];

    return {
      stroke: isInvalid ? "#ef4444" : cable.color, // merah jika invalid
      strokeWidth: isInvalid ? 3 : 2.5,
      strokeDasharray:
        cable.style === "dashed"
          ? "6 4"
          : cable.style === "dotted"
          ? "2 3"
          : undefined,
    };
  };

  useEffect(() => {
    checkAllWarnings(nodes, edges);

    // Update warna edge yang invalid
    setEdges((eds) =>
      eds.map((e) => {
        const isInvalid = connectionWarnings.some((w) => w.edgeId === e.id);
        // Kita pakai functional update yang lebih aman
        return e;
      })
    );
  }, [nodes, edges]);

  const onEdgesChangeInternal = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setTimeout(() => {
        setEdges((eds) => {
          updateParent(nodes, eds);
          return eds;
        });
      }, 0);
    },
    [onEdgesChange, nodes, setEdges, updateParent]
  );

  const onEdgeClick = useCallback(
    (_, edge) => {
      if (readOnly) return;
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    [readOnly]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      const newEdges = edges.filter((e) => !deleted.find((d) => d.id === e.id));
      setEdges(newEdges);
      setSelectedEdge(null);
      updateParent(nodes, newEdges);
    },
    [edges, nodes, setEdges, updateParent]
  );

  const deleteSelectedEdge = () => {
    if (!selectedEdge) return;
    const newEdges = edges.filter((e) => e.id !== selectedEdge.id);
    setEdges(newEdges);
    setSelectedEdge(null);
    updateParent(nodes, newEdges);
  };

  const changeCableType = (cable) => {
    if (!selectedEdge) return;

    const newEdges = edges.map((e) => {
      if (e.id !== selectedEdge.id) return e;

      return {
        ...e,
        animated: cable.id === "wireless" || cable.id === "fiber",
        style: {
          stroke: cable.color,
          strokeWidth: 2.5,
          strokeDasharray:
            cable.style === "dashed"
              ? "6 4"
              : cable.style === "dotted"
              ? "2 3"
              : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: cable.color,
        },
        label: cable.label,
        labelStyle: { fill: cable.color, fontSize: 10, fontWeight: 600 },
        data: { cableType: cable.id },
      };
    });

    setEdges(newEdges);
    setSelectedEdge(newEdges.find((e) => e.id === selectedEdge.id));
    updateParent(nodes, newEdges);
  };

  const addHardware = (hw) => {
    if (readOnly || !reactFlowInstance) return;

    const id = `node-${Date.now()}`;
    const position = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: 300,
    });

    const newNode = {
      id,
      type: "hardware",
      position,
      data: {
        label: hw.type,
        type: hw.type,
        icon: hw.icon,
        note: "",
      },
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    updateParent(newNodes, edges);
  };

  const onNodeClick = (_, node) => {
    if (readOnly) return;
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const exportToPng = async () => {
    const viewport = reactFlowWrapper.current?.querySelector(".react-flow__viewport");
    if (!viewport) {
      alert("Canvas belum siap");
      return;
    }

    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: "#ffffff",
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `topology-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Gagal export PNG");
    }
  };

  const updateLabel = (label) => {
    if (!selectedNode) return;
    const newNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? { ...n, data: { ...n.data, label: label || n.data.type } }
        : n
    );
    setNodes(newNodes);
    setSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, label: label || selectedNode.data.type },
    });
    updateParent(newNodes, edges);
  };

  const updateNote = (note) => {
    if (!selectedNode) return;
    const newNodes = nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, data: { ...n.data, note } } : n
    );
    setNodes(newNodes);
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, note } });
    updateParent(newNodes, edges);
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
    updateParent(newNodes, newEdges);
  };

  const isInteractive = !readOnly && mode !== "review";
  const showSidePanels = isInteractive && (selectedNode || selectedEdge);

  return (
    <div className="space-y-3">
      {/* ===== TOOLBAR ===== */}
      {showToolbar && isInteractive && (
        <div className="space-y-2">
          {/* Hardware */}
          <div className="grid grid-cols-8 items-center gap-2">
            {/* <span className="text-xs font-medium text-gray-500">Hardware:</span> */}
            {availableHardware.map((hw) => (
              <button
                key={hw.type}
                type="button"
                onClick={() => addHardware(hw)}
                className="inline-flex w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium transition hover:border-accent hover:text-accent dark:border-white/10 dark:bg-white/5"
              >
                <hw.icon size={14} />
                {hw.type}
              </button>
            ))}
          </div>

          {/* Cable Type */}
          <div className="flex flex-wrap items-center gap-2">
            {/* <span className="text-xs font-medium text-gray-500">Jenis Kabel:</span> */}
            {availableCables.map((cable) => (
              <button
                key={cable.id}
                type="button"
                onClick={() => setSelectedCable(cable)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  selectedCable.id === cable.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cable.color }}
                />
                {cable.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== WARNING LIST ===== */}
      {connectionWarnings.length > 0 && (
        <div className="space-y-2">
          {connectionWarnings.map((w) => (
            <div
              key={w.edgeId}
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {/* Canvas */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"
          style={{ height: `${height}px` }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isInteractive ? onNodesChangeInternal : undefined}
            onEdgesChange={isInteractive ? onEdgesChangeInternal : undefined}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, minZoom: 0.4, maxZoom: 1.2 }}
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{ type: "smoothstep" }}
            attributionPosition="bottom-left"
            nodesDraggable={isInteractive}
            nodesConnectable={isInteractive}
            elementsSelectable={isInteractive}
            edgesUpdatable={isInteractive}
            edgesReconnectable={isInteractive}
            reconnectRadius={20}
            deleteKeyCode={isInteractive ? ["Backspace", "Delete"] : null}
          >
            <Background 
              variant="dots" 
              gap={16} 
              size={1.2} 
              color="#64748b" 
              className="opacity-40"
            />
            {/* <Controls showInteractive={isInteractive} /> */}
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="!bg-gray-50 dark:!bg-gray-900"
            />
          </ReactFlow>
        </div>

        {/* Side panel - Node */}
        {showSidePanels && selectedNode && (
          <div className="w-56 shrink-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Edit Device</p>
              <button
                type="button"
                onClick={deleteSelected}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <label className="mb-1 block text-xs font-medium text-gray-500">
              Nama Device
            </label>
            <input
              type="text"
              value={selectedNode.data.label || ""}
              onChange={(e) => updateLabel(e.target.value)}
              placeholder={selectedNode.data.type}
              className="input-field mb-3 text-xs"
            />

            <label className="mb-1 block text-xs font-medium text-gray-500">
              Note / Keterangan
            </label>
            <textarea
              value={selectedNode.data.note || ""}
              onChange={(e) => updateNote(e.target.value)}
              placeholder="Contoh: Port 1 ke switch utama..."
              className="input-field h-24 resize-none text-xs"
            />
          </div>
        )}

        {/* Side panel - Edge/Kabel */}
        {showSidePanels && selectedEdge && (
          <div className="w-56 shrink-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Kabel</p>
              <button
                type="button"
                onClick={deleteSelectedEdge}
                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <p className="mb-2 text-xs text-gray-500">
              {selectedEdge.label || "Kabel"}
            </p>

            <div className="space-y-1">
              {availableCables.map((cable) => (
                <button
                  key={cable.id}
                  type="button"
                  onClick={() => changeCableType(cable)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                    selectedEdge.data?.cableType === cable.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-gray-200 hover:border-gray-300 dark:border-white/10"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cable.color }}
                  />
                  {cable.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* {showToolbar && (
        <button
          type="button"
          onClick={exportToPng}
          className="btn-secondary inline-flex items-center gap-1.5 text-xs"
        >
          <Download size={14} />
          Export PNG
        </button>
      )} */}
    </div>
  );
}