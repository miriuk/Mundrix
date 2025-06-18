import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';

function BoxStructure({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c4a484" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.7, 1, 4]} />
        <meshStandardMaterial color="#84563c" />
      </mesh>
    </group>
  );
}

function Tower({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 3, 12]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
}

function Scene({ prompt, seed, sceneRef }) {
  const elements = [];
  const lower = prompt.toLowerCase();
  let x = -5 + (seed % 10);

  if (lower.includes('village')) {
    for (let i = 0; i < 5; i++) {
      elements.push(<BoxStructure key={`village-${i}`} position={[x + i * 2, 0.5, 0]} />);
    }
    x += 11;
  }

  if (lower.includes('castle')) {
    for (let i = 0; i < 3; i++) {
      elements.push(<BoxStructure key={`castle-${i}`} position={[x + i * 2.5, 0.5, 0]} />);
    }
    x += 9;
  }

  if (lower.includes('tower')) {
    elements.push(<Tower key="tower" position={[x, 1.5, 0]} />);
    x += 3;
  }

  if (lower.includes('mountain')) {
    elements.push(
      <mesh key="mountain" position={[x, 1.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[2, 3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    );
  }

  return (
    <>
      <group ref={sceneRef}>{elements}</group>

      <ambientLight intensity={0.3} />
      <directionalLight castShadow position={[10, 10, 10]} intensity={1.2} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      <OrbitControls />
    </>
  );
}

function generateSeed() {
  return Math.floor(Math.random() * 1000);
}

function App() {
  const [prompt, setPrompt] = useState('a medieval village with a tower');
  const [seed, setSeed] = useState(generateSeed());
  const sceneRef = useRef();

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
      {/* Menu lateral */}
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
          placeholder="e.g. a castle with towers"
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

      {/* Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 5, 10], fov: 50 }}
        style={{ marginLeft: '280px', height: '100vh', width: 'calc(100vw - 280px)' }}
      >
        <Scene prompt={prompt} seed={seed} sceneRef={sceneRef} />
      </Canvas>
    </div>
  );
}

export default App;