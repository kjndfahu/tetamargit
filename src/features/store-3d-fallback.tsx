'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

function SimpleStoreModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Плавное вращение модели
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      // Приближение камеры при прогрессе
      const camera = state.camera;
      const targetZ = 10 - progress * 8; // От 10 до 2
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
      
      // Движение модели
      groupRef.current.position.y = Math.sin(progress * Math.PI) * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[1, 1, 1]} position={[0, -1, 0]}>
      {/* Основание магазина */}
      <Box args={[4, 0.2, 3]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Стены магазина */}
      <Box args={[4, 2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#EE4C7C" />
      </Box>
      
      {/* Крыша */}
      <Box args={[4.5, 0.3, 3.5]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#9A1750" />
      </Box>
      
      {/* Дверь */}
      <Box args={[0.8, 1.5, 0.1]} position={[0, -0.25, 1.51]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Окна */}
      <Box args={[0.8, 0.6, 0.1]} position={[-1.2, 0.3, 1.51]}>
        <meshStandardMaterial color="#87CEEB" />
      </Box>
      <Box args={[0.8, 0.6, 0.1]} position={[1.2, 0.3, 1.51]}>
        <meshStandardMaterial color="#87CEEB" />
      </Box>
      
      {/* Вывеска */}
      <Box args={[2, 0.4, 0.1]} position={[0, 1.8, 1.51]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
    </group>
  );
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C]"></div>
        <p className="text-white mt-4 text-lg">Загружаем 3D магазин...</p>
      </div>
    </Html>
  );
}

export function Store3D() {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
        if (entry.isIntersecting) {
          // Блокируем скролл страницы
          document.body.style.overflow = 'hidden';
        } else {
          // Разблокируем скролл страницы
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

  // Автоматический выход из блока при достижении 100%
  useEffect(() => {
    if (progress >= 1) {
      setTimeout(() => {
        setIsActive(false);
        document.body.style.overflow = 'auto';
        // Скроллим к следующему блоку
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
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingSpinner />}>
          <SimpleStoreModel progress={progress} />
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center text-white">
          <h2 
            className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg transition-all duration-1000"
            style={{
              opacity: progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5
            }}
          >
            Vitajte v našom obchode
          </h2>
          <p 
            className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md max-w-2xl mx-auto transition-all duration-1000"
            style={{
              opacity: progress < 0.6 ? 1 : 1 - (progress - 0.6) * 2.5
            }}
          >
            Použite koliesko myši alebo šípky pre vstup do obchodu
          </p>
          
          {progress < 0.2 && (
            <div className="flex flex-col items-center animate-bounce">
              <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
              </div>
              <span className="text-sm text-gray-300 mt-2">Skrolujte pre vstup</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-white text-sm text-center mt-2">
          Vstup do obchodu: {Math.round(progress * 100)}%
        </p>
        {progress >= 1 && (
          <p className="text-green-400 text-sm text-center mt-1 animate-pulse">
            Vstupujete do obchodu...
          </p>
        )}
      </div>

      {/* Controls Hint */}
      <div className="absolute top-8 right-8 text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg p-4 z-20">
        <h3 className="font-semibold mb-2 text-[#EE4C7C]">Ovládanie:</h3>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Koliesko myši - vstup/výstup</li>
          <li>⌨️ ↑↓ šípky - vstup/výstup</li>
          <li>🖱️ Ťahanie - otáčanie pohľadu</li>
          <li>⎋ Escape - opustiť režim</li>
        </ul>
      </div>

      {/* Exit hint */}
      {progress > 0.8 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-20 animate-fade-in">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2 text-[#EE4C7C]">Vitajte v obchode!</h3>
            <p className="text-lg">Pokračujte v skrolovaní pre vstup...</p>
          </div>
        </div>
      )}
    </section>
  );
}