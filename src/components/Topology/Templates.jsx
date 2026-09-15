export const TOPOLOGY_TEMPLATES = [
  {
    id: "kantor-kecil",
    name: "Kantor Kecil",
    description: "Router + Switch + beberapa PC",
    data: {
      nodes: [
        {
          id: "router-1",
          type: "hardware",
          position: { x: 250, y: 0 },
          data: { label: "Router", type: "Router", note: "Gateway ke ISP" },
        },
        {
          id: "switch-1",
          type: "hardware",
          position: { x: 250, y: 150 },
          data: { label: "Switch 24 Port", type: "Switch", note: "" },
        },
        {
          id: "pc-1",
          type: "hardware",
          position: { x: 100, y: 300 },
          data: { label: "PC Admin", type: "PC", note: "" },
        },
        {
          id: "pc-2",
          type: "hardware",
          position: { x: 250, y: 300 },
          data: { label: "PC Staff", type: "PC", note: "" },
        },
        {
          id: "pc-3",
          type: "hardware",
          position: { x: 400, y: 300 },
          data: { label: "PC Kasir", type: "PC", note: "" },
        },
      ],
      edges: [
        {
          id: "e1",
          source: "router-1",
          target: "switch-1",
          type: "smoothstep",
          label: "UTP / LAN",
          style: { stroke: "#22c55e", strokeWidth: 2.5 },
          data: { cableType: "utp" },
        },
        {
          id: "e2",
          source: "switch-1",
          target: "pc-1",
          type: "smoothstep",
          label: "UTP / LAN",
          style: { stroke: "#22c55e", strokeWidth: 2.5 },
          data: { cableType: "utp" },
        },
        {
          id: "e3",
          source: "switch-1",
          target: "pc-2",
          type: "smoothstep",
          label: "UTP / LAN",
          style: { stroke: "#22c55e", strokeWidth: 2.5 },
          data: { cableType: "utp" },
        },
        {
          id: "e4",
          source: "switch-1",
          target: "pc-3",
          type: "smoothstep",
          label: "UTP / LAN",
          style: { stroke: "#22c55e", strokeWidth: 2.5 },
          data: { cableType: "utp" },
        },
      ],
    },
  },
  {
    id: "cctv",
    name: "Sistem CCTV",
    description: "NVR + beberapa kamera",
    data: {
      nodes: [
        {
          id: "nvr-1",
          type: "hardware",
          position: { x: 250, y: 50 },
          data: { label: "NVR", type: "NVR", note: "Rekaman 24 jam" },
        },
        {
          id: "cam-1",
          type: "hardware",
          position: { x: 50, y: 220 },
          data: { label: "CCTV Depan", type: "CCTV", note: "" },
        },
        {
          id: "cam-2",
          type: "hardware",
          position: { x: 200, y: 220 },
          data: { label: "CCTV Dalam", type: "CCTV", note: "" },
        },
        {
          id: "cam-3",
          type: "hardware",
          position: { x: 350, y: 220 },
          data: { label: "CCTV Gudang", type: "CCTV", note: "" },
        },
        {
          id: "cam-4",
          type: "hardware",
          position: { x: 500, y: 220 },
          data: { label: "CCTV Parkir", type: "CCTV", note: "" },
        },
      ],
      edges: [
        { id: "c1", source: "nvr-1", target: "cam-1", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
        { id: "c2", source: "nvr-1", target: "cam-2", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
        { id: "c3", source: "nvr-1", target: "cam-3", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
        { id: "c4", source: "nvr-1", target: "cam-4", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
      ],
    },
  },
  {
    id: "hotspot",
    name: "Hotspot / Warnet",
    description: "MikroTik + AP + client",
    data: {
      nodes: [
        { id: "mikrotik", type: "hardware", position: { x: 250, y: 0 }, data: { label: "MikroTik", type: "MikroTik", note: "RB750 / hAP" } },
        { id: "ap-1", type: "hardware", position: { x: 100, y: 180 }, data: { label: "AP Lantai 1", type: "Access Point", note: "" } },
        { id: "ap-2", type: "hardware", position: { x: 400, y: 180 }, data: { label: "AP Lantai 2", type: "Access Point", note: "" } },
      ],
      edges: [
        { id: "h1", source: "mikrotik", target: "ap-1", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
        { id: "h2", source: "mikrotik", target: "ap-2", type: "smoothstep", label: "UTP / LAN", style: { stroke: "#22c55e", strokeWidth: 2.5 }, data: { cableType: "utp" } },
      ],
    },
  },
];