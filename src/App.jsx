import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const TERRAIN_SIZE = 50;
const SEGMENTS = 64;

const keywordMap = {
  montanha: { height: 8 },
  montanhas: { height: 8 },
  planicie: { height: 1 },
  reta: { height: 0.5 },
  rio: { river: true },
  floresta: { trees: true },
};

function parsePrompt(prompt) {
  const words = prompt.toLowerCase().split(/\s+/);
  const settings = {
    baseHeight: 2,
    river: false,
    trees: false,
  };
  for (let word of words) {
    if (keywordMap[word]?.height !== undefined) settings.baseHeight = keywordMap[word].height;
    if (keywordMap[word]?.river) settings.river = true;
    if (keywordMap[word]?.trees) settings.trees = true;
  }
  return settings;
}

function generateHeightMap(seed, baseHeight) {
  const noise2D = createNoise2D(() => seed * 0.00001);
  const data = [];

  for (let x = 0; x <= SEGMENTS; x++) {
    data[x] = [];
    for (let y = 0; y <= SEGMENTS; y++) {
      const nx = x / SEGMENTS - 0.5;
      const ny = y / SEGMENTS - 0.5;
      const e = noise2D(nx * 2, ny * 2);
      data[x][y] = e * baseHeight;
    }
  }

  return data;
}

function Terrain({ seed, settings }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState();

  useEffect(() => {
    const heightMap = generateHeightMap(seed, settings.baseHeight);
    const geom = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      SEGMENTS,
      SEGMENTS
    );
    geom.rotateX(-Math.PI / 2);

    const verts = geom.attributes.position;
    for (let i = 0; i < verts.count; i++) {
      const x = i % (SEGMENTS + 1);
      const y = Math.floor(i / (SEGMENTS + 1));
      let h = heightMap[x]?.[y] || 0;

      // Simula rio
      if (settings.river && Math.abs(y - SEGMENTS / 2) < 2) h = -0.5;

      verts.setY(i, h);
    }

    verts.needsUpdate = true;
    geom.computeVertexNormals();
    setGeometry(geom);
  }, [seed, settings]);

  return geometry ? (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#88bb88" flatShading />
    </mesh>
  ) : null;
}

function App() {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000));
  const [prompt, setPrompt] = useState('montanhas com rio');
  const [settings, setSettings] = useState(parsePrompt(prompt));

  useEffect(() => {
    setSettings(parsePrompt(prompt));
  }, [prompt]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '280px',
          height: '100%',
          background: '#1c1c1c',
          color: 'white',
          padding: '24px 16px',
          zIndex: 10,
          fontFamily: 'monospace',
          borderRight: '1px solid #333',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>🧠 MUNDRIX</h2>

        <label>Scene Prompt</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: montanhas com rio"
          style={{
            marginTop: 6,
            marginBottom: 12,
            padding: '8px',
            width: '100%',
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '6px',
          }}
        />

        <button
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          🔁 Regenerate
        </button>
      </div>

      <Canvas
        shadows
        camera={{ position: [30, 20, 30], fov: 45 }}
        style={{
          marginLeft: '280px',
          width: 'calc(100vw - 280px)',
          height: '100vh',
          background: '#000',
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[30, 50, 20]}
          castShadow
          intensity={1.2}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Terrain seed={seed} settings={settings} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;