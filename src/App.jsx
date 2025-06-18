import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

function Scene({ prompt }) {
  const blocks = [];

  const words = prompt.toLowerCase().split(' ');
  let x = -5;

  words.forEach((word) => {
    const item = keywordMap[word];
    if (item) {
      for (let i = 0; i < item.count; i++) {
        blocks.push(
          <Box
            key={`${word}-${i}`}
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

function App() {
  const [prompt, setPrompt] = useState('castle village');

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your world..."
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '8px 12px',
          zIndex: 10,
          borderRadius: '8px',
          fontSize: '16px',
          background: '#1f1f1f',
          color: '#fff',
          border: '1px solid #444',
        }}
      />
      <Canvas shadows camera={{ position: [10, 5, 10], fov: 50 }}>
        <Scene prompt={prompt} />
      </Canvas>
    </div>
  );
}

export default App;