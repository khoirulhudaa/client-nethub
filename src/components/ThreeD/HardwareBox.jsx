import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";

// A single 3D "card": a thin box whose front face is textured with the
// uploaded 2D hardware image (router, switch, cable, etc). Click focuses it,
// hover gives a tactile lift + slow spin — echoes the app's micro-interactions.
const HardwareBox = ({ imageUrl, label, position = [0, 0, 0], rotationY = 0, onSelect, selected }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(imageUrl);

  const BOX_SIZE = 2.6; 

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = rotationY + (hovered ? 0.12 : 0); // dulu 0.4 — muter hover diperkecil
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * Math.min(delta * 4, 1);
    const targetScale = selected ? 1.12 : hovered ? 1.05 : 1;
    meshRef.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale },
      Math.min(delta * 6, 1)
    );
  });

  // Box face order in three.js: [+x, -x, +y, -y, +z, -z]. We put the image on
  // the front (+z) face and a soft neutral material everywhere else.
  const neutral = "#E5E5EA";

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <boxGeometry args={[BOX_SIZE, BOX_SIZE, 0.16]} />
        <meshStandardMaterial attach="material-0" color={neutral} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={neutral} roughness={0.6} />
        <meshStandardMaterial attach="material-2" color={neutral} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color={neutral} roughness={0.6} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.4} />
        <meshStandardMaterial attach="material-5" color="#D1D1D6" roughness={0.6} />
      </mesh>
      <Text
        position={[0, -1.05, 0]}
        fontSize={0.16}
        color={selected ? "#007AFF" : "#8E8E93"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

export default HardwareBox;
