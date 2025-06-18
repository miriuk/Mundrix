import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';

const keywordMap = {
  village: { color: '#c4a484', count: 5, size: [1, 1, 1] },
  castle: { color: '#808080', count: 3, size: [2, 2, 2] },
  mountain: { color: '#8b8b7a', count: 2, size: [3, 2, 2] },
  tower: { color: '#555555', count: 2, size: [0.5, 3, 0.5] },
};

function Box({ position, color, size }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene({ prompt, seed }) {
  const blocks = [];
  const words = prompt.toLowerCase().split(' ');
  let x = -5 + seed;

  words.forEach((word) => {
    const item = keywordMap[word];
    if (item) {
      for (let i = 0; i < item.count; i++) {
        blocks.push(
          <Box
            key={`${word}-${i}-${seed}`}
            position={[x + i * 1.5, item.size[1] / 2, 0]}
            size={item.size}
            color={item.color}
          />
        );
      }
      x += item.count * 1.5 + 1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight castShadow position={[10, 10, 10]} intensity={1.2} />
      {blocks}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      <OrbitControls />
    </>
  );
}

function generateSeed() {
  return Math.floor(Math.random() * 1000);
}

function App() {
  const [prompt, setPrompt] = useState('village castle');
  const [seed, setSeed] = useState(generateSeed());
  const sceneRef = useRef();

  const wordCount = prompt
    .toLowerCase()
    .split(' ')
    .filter((w) => keywordMap[w])?.length || 0;

  const blockCount = prompt
    .toLowerCase()
    .split(' ')
    .reduce((total, w) => {
      return total + (keywordMap[w]?.count || 0);
    }, 0);

  const handleExport = () => {
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mundrix_seed${seed}.glb`;
        a.click();
        URL.revokeObjectURL(url);
      },
      { binary: true }
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Interface lateral */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '280px',
          height: '100%',
          background: '#121212',
          padding: '24px 16px',
          color: 'white',
          zIndex: 20,
          fontFamily: 'monospace',
          borderRight: '1px solid #333',
        }}
      >
        <h2 style={{ marginBottom: '16px' }}>🧠 MUNDRIX</h2>

        <label style={{ fontSize: '13px' }}>World Prompt</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. castle village"
          style={{
            marginTop: '4px',
            marginBottom: '16px',
            padding: '8px',
            width: '100%',
            borderRadius: '6px',
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
          }}
        />

        <div style={{ marginBottom: '12px', fontSize: '13px' }}>
          <strong>Seed:</strong> {seed}
        </div>
        <div style={{ marginBottom: '12px', fontSize: '13px' }}>
          <strong>Keywords:</strong> {wordCount}
        </div>
        <div style={{ marginBottom: '20px', fontSize: '13px' }}>
          <strong>Blocks Generated:</strong> {blockCount}
        </div>

        <button
          onClick={() => setSeed(generateSeed())}
          style={{
            width: '100%',
            padding: '8px 0',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            marginBottom: '8px',
            cursor: 'pointer',
          }}
        >
          🔁 Regenerate
        </button>

        <button
          onClick={handleExport}
          style={{
            width: '100%',
            padding: '8px 0',
            background: '#00d1b2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ⬇️ Export .glb
        </button>
      </div>

      {/* Canvas 3D */}
      <Canvas
        shadows
        camera={{ position: [10, 5, 10], fov: 50 }}
        onCreated={({ sce
