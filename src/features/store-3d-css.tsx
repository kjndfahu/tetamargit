'use client';

import { useState, useEffect, useRef } from 'react';
import { Store3DModel } from './store-3d-model';

export function Store3D() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.intersectionRatio > 0.3;
        setIsActive(isIntersecting);
        setIsFullscreen(isIntersecting);
        
        if (isIntersecting) {
          // Блокируем скролл и делаем блок на весь экран
          document.body.style.overflow = 'hidden';
          if (container) {
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '1000';
          }
        } else {
          // Возвращаем нормальное состояние
          document.body.style.overflow = 'auto';
          if (container) {
            container.style.position = 'relative';
            container.style.top = 'auto';
            container.style.left = 'auto';
            container.style.width = 'auto';
            container.style.height = '100vh';
            container.style.zIndex = 'auto';
          }
        }
      },
      { threshold: [0, 0.3, 0.7, 1] }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      document.body.style.overflow = 'auto';
      // Сбрасываем стили при размонтировании
      if (container) {
        container.style.position = 'relative';
        container.style.top = 'auto';
        container.style.left = 'auto';
        container.style.width = 'auto';
        container.style.height = '100vh';
        container.style.zIndex = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? 0.05 : -0.05;
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + delta)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        setScrollProgress(prev => Math.min(1, prev + 0.1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setScrollProgress(prev => Math.max(0, prev - 0.1));
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
    if (scrollProgress >= 1) {
      setTimeout(() => {
        setIsActive(false);
        setIsFullscreen(false);
        document.body.style.overflow = 'auto';
        const container = containerRef.current;
        if (container) {
          container.style.position = 'relative';
          container.style.top = 'auto';
          container.style.left = 'auto';
          container.style.width = 'auto';
          container.style.height = '100vh';
          container.style.zIndex = 'auto';
        }
      }, 1000);
    }
  }, [scrollProgress]);

  return (
    <section 
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 transition-all duration-500 ${
        isFullscreen ? 'fixed top-0 left-0 w-screen h-screen z-[1000]' : ''
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-[#EE4C7C]/20 to-[#9A1750]/20 transition-all duration-1000"
          style={{
            transform: `scale(${1 + scrollProgress * 0.5})`,
            opacity: 0.3 + scrollProgress * 0.4
          }}
        />
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                transform: `translateZ(${scrollProgress * 200}px)`
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Store Model */}
      <div className="absolute inset-0">
        <Store3DModel />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white z-10 px-4">
          <h2 
            className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg transition-all duration-1000"
            style={{
              transform: `translateY(${-scrollProgress * 50}px) translateZ(${scrollProgress * 100}px)`,
              opacity: 1 - scrollProgress * 0.7
            }}
          >
            Vitajte v našom obchode
          </h2>
          <p 
            className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md max-w-2xl mx-auto transition-all duration-1000"
            style={{
              transform: `translateY(${-scrollProgress * 30}px) translateZ(${scrollProgress * 80}px)`,
              opacity: 1 - scrollProgress * 0.5
            }}
          >
            Skrolujte kolieskom myši pre vstup do 3D obchodu
          </p>
          
          {scrollProgress < 0.3 && (
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
        <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <p className="text-white text-sm text-center mt-2 drop-shadow-md">
          Vstup do obchodu: {Math.round(scrollProgress * 100)}%
        </p>
        {scrollProgress >= 1 && (
          <p className="text-green-400 text-sm text-center mt-1 animate-pulse drop-shadow-md">
            Vstupujete do obchodu...
          </p>
        )}
      </div>

      {/* Controls Hint */}
      <div className={`absolute top-8 right-8 text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg p-4 z-20 border border-white/20 transition-opacity duration-500 ${
        isFullscreen ? 'opacity-100' : 'opacity-70'
      }`}>
        <h3 className="font-semibold mb-2 text-[#EE4C7C]">🎮 Ovládanie:</h3>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Koliesko myši - priblíženie</li>
          <li>🖱️ Ľavé tlačidlo - otáčanie</li>
          <li>⌨️ ↑↓ šípky - priblíženie</li>
          <li>⎋ Escape - opustiť režim</li>
          {isFullscreen && <li className="text-[#EE4C7C]">🔒 Režim na celú obrazovku</li>}
        </ul>
      </div>

      {/* Entry Effect */}
      {scrollProgress > 0.7 && (
        <div 
          className="absolute inset-0 bg-white transition-opacity duration-1000 pointer-events-none"
          style={{ opacity: (scrollProgress - 0.7) * 0.3 }}
        />
      )}

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      
      {/* Exit hint when fullscreen */}
      {isFullscreen && (
        <div className="absolute top-1/2 left-8 transform -translate-y-1/2 text-white text-sm bg-black/70 backdrop-blur-sm rounded-lg p-3 z-20 animate-pulse">
          <p className="text-[#EE4C7C] font-semibold">Režim na celú obrazovku</p>
          <p className="text-xs mt-1">Stlačte ESC pre návrat</p>
        </div>
      )}
    </section>
  );
}