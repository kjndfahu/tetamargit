'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function StoreModel() {
  try {
    const { scene } = useGLTF('/models/store.glb');
    return <primitive object={scene} scale={[1, 1, 1]} position={[0, 0, 0]} />;
  } catch (error) {
    // Fallback - простая 3D модель из геометрии
    return (
      <group>
        {/* Основное здание */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 3, 3]} />
          <meshStandardMaterial color="#EE4C7C" />
        </mesh>
        
        {/* Крыша */}
        <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[3, 1.5, 4]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        
        {/* Дверь */}
        <mesh position={[0, -0.5, 1.51]}>
          <boxGeometry args={[0.8, 2, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Окна */}
        <mesh position={[-1, 0.5, 1.51]}>
          <boxGeometry args={[0.8, 0.8, 0.05]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        <mesh position={[1, 0.5, 1.51]}>
          <boxGeometry args={[0.8, 0.8, 0.05]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        
        {/* Вывеска */}
        <mesh position={[0, 2.5, 1.6]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>
    );
  }
}

export function Store3DModel() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ 
          position: [15, 50, 50], 
          fov: 10 
        }}
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <StoreModel />
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={12}
          maxDistance={50}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

// Предзагрузка модели
useGLTF.preload('/models/store.glb');