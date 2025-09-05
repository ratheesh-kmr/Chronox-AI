import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

function SpinningBox() {
  return (
    <mesh rotation={[0.4, 0.2, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#8F87F1" />
    </mesh>
  );
}

export default function ThreeDModelSpinner() {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        height: "200px",
        background: "linear-gradient(135deg, #F0EFFF, #E9A5F1)",
      }}
    >
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <SpinningBox />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
