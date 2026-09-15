import { useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { UploadCloud, Trash2, RotateCcw, Boxes } from "lucide-react";
import HardwareBox from "./HardwareBox.jsx";

const GRID_GAP = 3.2; // disesuaikan dengan box yang sekarang lebih besar
const PER_ROW = 3;

// Menyusun ulang seluruh mesh dalam grid yang SELALU di-center di sekitar
// (0,0,0) — baik horizontal (x) maupun depth (z). Ini memastikan titik
// pusat rotasi OrbitControls (target default-nya 0,0,0) selalu berada
// tepat di tengah gambar/kumpulan gambar, bukan bergeser ke kiri seperti
// grid berbasis index sebelumnya.
const relayout = (list) => {
  const totalRows = Math.ceil(list.length / PER_ROW);
  return list.map((mesh, i) => {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const itemsInRow = Math.min(PER_ROW, list.length - row * PER_ROW);
    const x = (col - (itemsInRow - 1) / 2) * GRID_GAP;
    const z = (row - (totalRows - 1) / 2) * GRID_GAP;
    return { ...mesh, position: { x, y: 0, z } };
  });
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Interactive 3D canvas: uploaded 2D hardware images (router/switch photos,
 * diagrams, etc.) are mapped onto textured 3D boxes arranged in a grid.
 * Authors can add/remove pieces while drafting a post; the resulting
 * `hardwareMeshes` array is submitted alongside the post content.
 */
const HardwareCanvas = ({ meshes, onChange, readOnly = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const addImages = useCallback(
    async (files) => {
      const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
      const additions = dataUrls.map((imageUrl, i) => ({
        label: `Device ${meshes.length + i + 1}`,
        imageUrl,
        position: { x: 0, y: 0, z: 0 }, // posisi sementara, langsung di-relayout di bawah
        rotationY: 0,
      }));
      onChange(relayout([...meshes, ...additions]));
    },
    [meshes, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  };

  const removeMesh = (index) => {
    onChange(relayout(meshes.filter((_, i) => i !== index)));
    setSelectedIndex(null);
  };

  const renameMesh = (index, label) => {
    onChange(meshes.map((m, i) => (i === index ? { ...m, label } : m)));
  };

  return (
    <div className="overflow-hidden rounded-card border border-border-light dark:border-border-dark">
      <div className="relative h-80 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-white/[0.03] dark:to-white/[0.06]">
        {meshes.length === 0 ? (
          readOnly ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-300 dark:text-white/10">
              <Boxes size={32} strokeWidth={1.4} />
              <p className="text-sm">No 3D hardware scene for this guide</p>
            </div>
          ) : (
            <label
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-400 transition-colors hover:text-accent"
            >
              <Boxes size={32} strokeWidth={1.4} />
              <p className="text-sm font-medium">Drop hardware photos to build the 3D scene</p>
              <p className="text-xs">PNG or JPG · mapped automatically onto 3D cards</p>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => e.target.files?.length && addImages(e.target.files)}
              />
            </label>
          )
        ) : (
          <Canvas camera={{ position: [0, 1.8, 7.5], fov: 42 }} shadows>
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 5, 4]} intensity={1.1} castShadow />
            <Suspense fallback={null}>
              {meshes.map((mesh, i) => (
                <HardwareBox
                  key={i}
                  imageUrl={mesh.imageUrl}
                  label={mesh.label}
                  position={[mesh.position.x, mesh.position.y, mesh.position.z]}
                  rotationY={mesh.rotationY}
                  selected={selectedIndex === i}
                  onSelect={() => setSelectedIndex(i)}
                />
              ))}
              <Environment preset="city" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={14} blur={2} />
            </Suspense>
            <OrbitControls
              target={[0, 0, 0]}
              enablePan={false}
              enableDamping
              dampingFactor={0.12}
              rotateSpeed={0.45}
              minDistance={4}
              maxDistance={12}
              // Batasi putaran vertikal & drag-nya biar nggak terasa "lebar" /
              // sampai kebalik/lepas kendali saat di-drag.
              minPolarAngle={Math.PI / 3.2}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Canvas>
        )}
      </div>

      {meshes.length > 0 && !readOnly && (
        <div className="flex flex-col gap-2 border-t border-border-light bg-white/60 p-3 dark:border-border-dark dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <label className="btn-secondary cursor-pointer px-3 py-1.5 text-xs">
              <UploadCloud size={13} />
              Add more
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => e.target.files?.length && addImages(e.target.files)}
              />
            </label>
            <button
              onClick={() => onChange([])}
              className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500"
            >
              <RotateCcw size={12} />
              Clear scene
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {meshes.map((mesh, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-control border px-2 py-1.5 text-xs ${
                  selectedIndex === i
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-light dark:border-border-dark"
                }`}
              >
                <img src={mesh.imageUrl} alt="" className="h-6 w-6 rounded object-cover" />
                <input
                  value={mesh.label}
                  onChange={(e) => renameMesh(i, e.target.value)}
                  className="w-24 bg-transparent outline-none"
                />
                <button onClick={() => removeMesh(i)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HardwareCanvas;