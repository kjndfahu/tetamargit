'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

function StoreModel({ scrollProgress }: { scrollProgress: number }) {
  const gltf = useLoader(GLTFLoader, '/models/store.glb');
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Плавное вращение модели
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Приближение камеры при скролле
      const camera = state.camera;
      const targetZ = 5 - scrollProgress * 3; // От 5 до 2
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
      
      // Небольшое движение модели при скролле
      meshRef.current.position.y = Math.sin(scrollProgress * Math.PI) * 0.5;
    }
  });

  return (
    <group ref={meshRef} scale={[2, 2, 2]} position={[0, -1, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C]"></div>
        <p className="text-white mt-4 text-lg">Načítavanie 3D modelu...</p>
      </div>
    </Html>
  );
}

export function Store3D() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Вычисляем прогресс скролла для этого блока
        const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Вызываем сразу для инициализации

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <StoreModel scrollProgress={scrollProgress} />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Vitajte v našom obchode
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md max-w-2xl mx-auto">
            Preskúmajte náš 3D model obchodu. Skrolujte nadol pre priblíženie a použite myš pre otáčanie.
          </p>
          <div className="flex flex-col items-center">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className="text-sm text-gray-300 mt-2">Skrolujte pre priblíženie</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#EE4C7C] transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <p className="text-white text-xs text-center mt-2">
          Priblíženie: {Math.round(scrollProgress * 100)}%
        </p>
      </div>

      {/* Interactive Hints */}
      <div className="absolute top-8 right-8 text-white text-sm bg-black/30 backdrop-blur-sm rounded-lg p-4">
        <h3 className="font-semibold mb-2">Ovládanie:</h3>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Ťahanie myšou - otáčanie</li>
          <li>🔍 Koliesko myši - zoom</li>
          <li>📜 Skrolovanie - automatické priblíženie</li>
        </ul>
      </div>
    </section>
  );
}