import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const TERRAIN_SIZE = 50;
const SEGMENTS = 64;

function parsePrompt(prompt) {
  const zones = {
    north: { height: 2 },
    center: { height: 2 },
    south: { height: 2 },
    river: null,
    lake: null,
  };

  const lower = prompt.toLowerCase();

  if (lower.includes('montanha') && lower.includes('norte')) zones.north.height = 8;
  if (lower.includes('montanha') && lower.includes('sul')) zones.south.height = 8;
  if (lower.includes('montanha') && lower.includes('centro')) zones.center.height = 8;
  if (lower.includes('reta') || lower.includes('plano') || lower.includes('planicie')) zones.center.height = 1;

  if (lower.includes('rio')) zones.river = { width: 3 };
  if (lower.includes('rio fino')) zones.river = { width: 1 };
  if (lower.includes('lago')) zones.lake = { radius: 5, depth: -1 };

  return zones;
}

function generateHeightMap(seed, zones) {
  const noise2D = createNoise2D(() => seed * 0.00001);
  const data = [];

  for (let x = 0; x <= SEGMENTS; x++) {
    data[x] = [];
    for (let y = 0; y <= SEGMENTS; y++) {
      const nx = x / SEGMENTS - 0.5;
      const ny = y / SEGMENTS - 0.5;
      let height = noise2D(nx * 2, ny * 2);

      const zone = y < SEGMENTS / 3 ? 'north' : y > (SEGMENTS * 2) / 3 ? 'south' : 'center';
      height *= zones[zone].height;

      // rio horizontal cortando o centro
      if (zones.river && Math.abs(y - SEGMENTS / 2) < zones.river.width) height = -0.5;

      // lago no centro
      const dx = x - SEGMENTS / 2;
      const dy = y - SEGMENTS / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (zones.lake && dist < zones.lake.radius) height = zones.lake.depth;

      data[x][y] = height;
    }
  }
  return data;
}

function Terrain({ seed, zones }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState();

  useEffect(() => {
    const heightMap = generateHeightMap(seed, zones);
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
      const h = heightMap[x][y];
      verts.setY(i, h);
    }

    verts.needsUpdate = true;
    geom.computeVertexNormals();
    setGeometry(geom);
  }, [seed, zones]);

  return geometry ? (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#88bb88" flatShading />
    </mesh>
  ) : null;
}

function App() {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000));
  const [prompt, setPrompt] = useState('montanhas ao norte, planície no centro, rio largo cortando o sul, lago pequeno no meio');
  const [zones, setZones] = useState(parsePrompt(prompt));

  useEffect(() => {
    setZones(parsePrompt(prompt));
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
          placeholder="Ex: montanhas ao norte, lago no centro, rio fino"
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
        <Terrain seed={seed} zones={zones} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;