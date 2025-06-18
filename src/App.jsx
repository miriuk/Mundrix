
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>

<input
  type="text"
  placeholder="Describe your world..."
  style={{
    position: 'absolute',
    top: 20,
    left: 20,
    padding: '8px 12px',
    zIndex: 10,
    borderRadius: '8px'
  }}
/>

      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]}>
          <meshStandardMaterial color="hotpink" />
        </Box>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
