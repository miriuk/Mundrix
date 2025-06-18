import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

const TERRAIN_SIZE = 50;
const SEGMENTS = 64;

function generateHeightMap(seed) {
  const simplex = new SimplexNoise(seed.toString());
  const heights = [];

  for (let x = 0; x <= SEGMENTS; x++) {
    for (let y = 0; y <= SEGMENTS; y++) {
      const nx = x / SEGMENTS - 0.5;
      const ny = y / SEGMENTS - 0.5;
      const value = simplex.noise2D(nx * 4, ny * 4);
      heights.push(value);
    }
  }

  return heights;
}

function Terrain({ seed, sceneRef }) {
  const ref = useRef();
  const [heights, setHeights] = useState([]);

  useEffect(() => {
    const newHeights = generateHeightMap(seed);
    setHeights(newHeights);
  }, [seed]);

  useEffect(() => {
    if (ref.current && heights.length > 0) {
      const positions = ref.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const h = heights[i];
        positions.setY(i, h * 5); // escala vertical
      }
      positions.needsUpdate = true;
      ref.current.geometry.computeVertexNormals();
    }
  }, [heights]);

  return (
    <>
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        ref={sceneRef}
      >
        <planeGeometry args={[TERRAIN_SIZE, TERRAIN_SIZE, SEGMENTS, SEGMENTS]} />
        <meshStandardMaterial vertexColors={false} color="#2e8b57" />
      </mesh>

      {/* Simulação de rio */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TERRAIN_SIZE * 0.8, 2]} />
        <meshStandardMaterial color="#3399ff" opacity={0.8} transparent />
      </mesh>
    </>
  );
}

function generateSeed() {
  return Math.floor(Math.random() * 1000);
}

function App() {
  const [seed, setSeed] = useState(generateSeed());
  const terrainRef = useRef();

  const handleExport = () => {
    const exporter = new GLTFExporter();
    exporter.parse(
      terrainRef.current,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mundrix_landscape_${seed}.glb`;
        a.click();
        URL.revokeObjectURL(url);
      },
      { binary: true }
    );
  };

  const saveWorld = () => {
    const geo = terrainRef.current.geometry.attributes.position;
    const data = [];

    for (let i = 0; i < geo.count; i++) {
      data.push({
        x: geo.getX(i),
        y: geo.getY(i),
        z: geo.getZ(i),
      });
    }

    console.log("🌍 World saved:", {
      seed,
      terrain: data,
    });

    // Aqui você pode trocar por chamada de API
    // fetch('/api/save', { method: 'POST', body: JSON.stringify({ seed, terrain: data }) })
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Lateral */}
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
        <h2>Mundrix Landscape</h2>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          Seed: <strong>{seed}</strong>
        </div>

        <button
          onClick={() => setSeed(generateSeed())}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          🔁 Regenerate Terrain
        </button>

        <button
          onClick={handleExport}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        >
          ⬇️ Export .GLB
        </button>

        <button
          onClick={saveWorld}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#00d1b2',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          💾 Save World (JSON)
        </button>
      </div>

      {/* Canvas */}
      <Canvas
        shadows
        camera={{ position: [20, 15, 20], fov: 45 }}
        style={{
          marginLeft: '280px',
          height: '100vh',
          width: 'calc(100vw - 280px)',
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <Terrain seed={seed} sceneRef={terrainRef} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
