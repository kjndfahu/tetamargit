'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Правильный способ загрузки GLTF модели
function StoreModel({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Используем useGLTF из @react-three/drei вместо прямого useLoader
  const { scene, error } = useGLTF('/models/store.glb', true);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Плавное вращение модели
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Приближение камеры при прогрессе
      const camera = state.camera;
      const targetZ = 10 - progress * 8;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
      
      // Движение модели
      meshRef.current.position.y = Math.sin(progress * Math.PI) * 0.5;
    }
  });

  // Обработка ошибок загрузки
  if (error) {
    console.error('Ошибка загрузки GLB модели:', error);
    return (
      <group ref={meshRef}>
        {/* Fallback модель из простых форм */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 2, 3]} />
          <meshStandardMaterial color="#EE4C7C" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[4.5, 0.3, 3.5]} />
          <meshStandardMaterial color="#9A1750" />
        </mesh>
        <Html center>
          <div className="text-white text-center bg-red-500/80 p-2 rounded">
            Модель не найдена<br/>
            Используется fallback
          </div>
        </Html>
      </group>
    );
  }

  if (!scene) {
    return (
      <Html center>
        <div className="text-white">Загрузка модели...</div>
      </Html>
    );
  }

  return (
    <group ref={meshRef} scale={[1, 1, 1]} position={[0, -1, 0]}>
      <primitive object={scene.clone()} />
    </group>
  );
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C]"></div>
        <p className="text-white mt-4 text-lg">Загружаем 3D модель...</p>
      </div>
    </Html>
  );
}

export function Store3D() {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [modelExists, setModelExists] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Проверяем существование модели
  useEffect(() => {
    fetch('/models/store.glb', { method: 'HEAD' })
      .then(response => {
        setModelExists(response.ok);
        if (!response.ok) {
          console.warn('GLB модель не найдена по пути /models/store.glb');
        }
      })
      .catch(() => {
        setModelExists(false);
        console.warn('Не удалось проверить существование GLB модели');
      });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
        if (entry.isIntersecting) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.05 : -0.05;
      setProgress(prev => Math.max(0, Math.min(1, prev + delta)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setProgress(prev => Math.min(1, prev + 0.1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setProgress(prev => Math.max(0, prev - 0.1));
      } else if (e.key === 'Escape') {
        setIsActive(false);
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  useEffect(() => {
    if (progress >= 1) {
      setTimeout(() => {
        setIsActive(false);
        document.body.style.overflow = 'auto';
        const nextSection = containerRef.current?.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }
  }, [progress]);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center"
    >
      {/* Debug Info */}
      <div className="absolute top-4 left-4 text-white text-xs bg-black/70 p-3 rounded z-30">
        <div>Модель существует: {modelExists === null ? 'проверяем...' : modelExists ? '✅' : '❌'}</div>
        <div>Прогресс: {Math.round(progress * 100)}%</div>
        <div>Активен: {isActive ? '✅' : '❌'}</div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        className="absolute inset-0"
        onError={(error) => {
          console.error('Canvas error:', error);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <StoreModel progress={progress} />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            {modelExists === false ? 'Модель не найдена' : 'Vitajte v našom obchode'}
          </h2>
          <p className="text-xl text-gray-200 mb-8 drop-shadow-md max-w-2xl mx-auto">
            {modelExists === false 
              ? 'Используется fallback версия' 
              : 'Použite koliesko myši pre vstup do obchodu'
            }
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-white text-sm text-center mt-2">
          Vstup: {Math.round(progress * 100)}%
        </p>
      </div>
    </section>
  );
}

// Предзагрузка модели
useGLTF.preload('/models/store.glb');