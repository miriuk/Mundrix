import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createNoise2D } from 'simplex-noise';
import * as THREE from 'three';

const TERRAIN_SIZE = 50;
const SEGMENTS = 64;

function generateHeightMap(seed, controls) {
  const noise2D = createNoise2D(() => seed * 0.00001);
  const data = [];

  for (let x = 0; x <= SEGMENTS; x++) {
    data[x] = [];
    for (let y = 0; y <= SEGMENTS; y++) {
      const nx = x / SEGMENTS - 0.5;
      const ny = y / SEGMENTS - 0.5;
      let height = noise2D(nx * controls.noiseScale, ny * controls.noiseScale);

      const zone = y < SEGMENTS / 3 ? 'north' : y > (SEGMENTS * 2) / 3 ? 'south' : 'center';
      if (zone === 'north' || zone === 'south') {
        height *= controls.mountainHeight;
      } else {
        height *= controls.plainHeight;
      }

      // rio com transição suave
      const riverFalloff = Math.exp(-Math.pow((y - SEGMENTS / 2) / controls.riverWidth, 2));
      height = THREE.MathUtils.lerp(height, -0.8, riverFalloff);

      // lago circular com transição suave
      const dx = x - SEGMENTS / 2;
      const dy = y - SEGMENTS / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < controls.lakeRadius) {
        const influence = 1 - dist / controls.lakeRadius;
        height = THREE.MathUtils.lerp(height, controls.lakeDepth, influence);
      }

      data[x][y] = height;
    }
  }
  return data;
}

function Terrain({ seed, controls }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = useState();

  useEffect(() => {
    const heightMap = generateHeightMap(seed, controls);
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
      verts.setY(i, isNaN(h) ? 0 : h);
    }

    verts.needsUpdate = true;
    geom.computeVertexNormals();
    setGeometry(geom);
  }, [seed, controls]);

  return geometry ? (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#88bb88" flatShading />
    </mesh>
  ) : null;
}

function App() {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000));
  const [controls, setControls] = useState({
    mountainHeight: 8,
    riverWidth: 2,
    lakeDepth: -1,
    lakeRadius: 5,
    plainHeight: 1,
    noiseScale: 2,
  });

  const handleChange = (key, value) => {
    setControls((prev) => ({ ...prev, [key]: parseFloat(value) }));
  };

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
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>🧠 MUNDRIX</h2>

        {[
          { label: 'Montanha Altura', key: 'mountainHeight', min: 0, max: 20 },
          { label: 'Planície Altura', key: 'plainHeight', min: 0, max: 5 },
          { label: 'Ruído (Noise)', key: 'noiseScale', min: 0.1, max: 5, step: 0.1 },
          { label: 'Largura do Rio', key: 'riverWidth', min: 0, max: 10 },
          { label: 'Raio do Lago', key: 'lakeRadius', min: 0, max: 20 },
          { label: 'Profundidade Lago', key: 'lakeDepth', min: -5, max: 0, step: 0.1 },
        ].map(({ label, key, min, max, step = 1 }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label>{label}: {controls[key]}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={controls[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        ))}

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
        <Terrain seed={seed} controls={controls} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
