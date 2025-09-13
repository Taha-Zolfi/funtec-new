'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import dynamic from 'next/dynamic';

const FerrisWheel = dynamic(() => import('./FerrisWheel'), {
  ssr: false,
  loading: () => null
});

export default function Scene3D() {
  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        camera={{
          position: [0, 0, 2.5],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            color="#ffffff"
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffb527" />
          <pointLight position={[10, 10, 10]} intensity={0.3} color="#13c8ff" />
          <Environment preset="night" />
          <group
            scale={[1.4, 1.4, 1.4]}
            position={[0.5, 1, 0]}
          >
            <FerrisWheel />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
