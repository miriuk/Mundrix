import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const TERRAIN_SIZE = 50;
const SEGMENTS = 64;

function generateHeightMap(seed) {
  const noise2D = createNoise2D(() => seed * 0.00001);
  const data = [];

  for (let x = 0; x <= SEGMENTS; x++) {
    data[x] = [];
    for (let y = 0; y <= SEGMENTS; y++) {
      const nx = x / SEGMENTS - 0.5;
      const ny = y / SEGMENTS - 0.5;
      const e = noise2D(nx * 2, ny * 2); // escala
      data[x][y] = e;
    }
  }

  return data;
}

function Terrain({ seed }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState();

  useEffect(() => {
    const heightMap = generateHeightMap(seed);
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
      const height = heightMap[x]?.[y] || 0;
      verts.setY(i, height * 5); // altura do relevo
    }

    verts.needsUpdate = true;
    geom.computeVertexNormals();
    setGeometry(geom);
  }, [seed]);

  return geometry ? (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors={false}
        color="#88bb88"
        flatShading={true}
      />
    </mesh>
  ) : null;
}

function App() {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000));

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
          background: '#1c1c1c',
          color: 'white',
          padding: '24px 16px',
          zIndex: 10,
          fontFamily: 'monospace',
          borderRight: '1px solid #333',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>🧠 MUNDRIX</h2>
        <p>
          <strong>Seed:</strong> {seed}
        </p>
        <button
          onClick={() => setSeed(Math.floor(Math.random() * 100000))}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          🔁 Regenerate Terrain
        </button>
      </div>

      {/* Canvas 3D */}
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
        <Terrain seed={seed} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
