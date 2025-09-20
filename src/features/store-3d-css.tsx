'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function Store3D() {
  const [scrollProgress, setScrollProgress] = useState(0);
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
        document.body.style.overflow = 'auto';
        // Скроллим к следующему блоку
        const nextSection = containerRef.current?.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }
  }, [scrollProgress]);

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative transition-all duration-1000 ease-out"
          style={{
            transform: `
              perspective(1000px) 
              rotateX(${-10 + scrollProgress * 30}deg) 
              rotateY(${scrollProgress * 180}deg) 
              scale(${0.3 + scrollProgress * 2.5})
              translateZ(${scrollProgress * 300}px)
            `,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Store Building - Main Structure */}
          <div 
            className="relative w-96 h-72 bg-gradient-to-b from-[#EE4C7C] to-[#9A1750] rounded-lg shadow-2xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front Wall */}
            <div className="absolute inset-x-6 bottom-6 top-12 bg-white/90 rounded-lg backdrop-blur-sm">
              {/* Windows Grid */}
              <div className="grid grid-cols-4 gap-3 p-6 h-full">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-gradient-to-br from-blue-200 to-blue-400 rounded opacity-80 animate-pulse shadow-inner"
                    style={{ 
                      animationDelay: `${i * 0.3}s`,
                      transform: `translateZ(${5 + scrollProgress * 10}px)`
                    }}
                  />
                ))}
              </div>
              
              {/* Main Door */}
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg shadow-lg"
                style={{ transform: `translateX(-50%) translateZ(${10 + scrollProgress * 15}px)` }}
              >
                <div className="absolute right-2 top-8 w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                <div className="absolute inset-x-2 bottom-2 h-1 bg-amber-900 rounded"></div>
              </div>
            </div>

            {/* Roof */}
            <div 
              className="absolute -top-6 left-0 right-0 h-12 bg-gradient-to-r from-red-600 via-red-700 to-red-800 shadow-xl"
              style={{
                clipPath: 'polygon(10% 100%, 50% 0, 90% 100%)',
                transform: `translateZ(${scrollProgress * 20}px)`
              }}
            />

            {/* Store Sign */}
            <div 
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-lg shadow-xl border-2 border-[#EE4C7C]"
              style={{ transform: `translateX(-50%) translateZ(${20 + scrollProgress * 25}px)` }}
            >
              <span className="text-[#EE4C7C] font-bold text-lg">Teta Márgit</span>
            </div>

            {/* Side Walls Effect */}
            <div 
              className="absolute -right-4 top-0 bottom-0 w-8 bg-gradient-to-r from-[#9A1750] to-[#5D001E] opacity-80"
              style={{ 
                transform: `rotateY(90deg) translateZ(4px)`,
                transformOrigin: 'left center'
              }}
            />
            <div 
              className="absolute -left-4 top-0 bottom-0 w-8 bg-gradient-to-l from-[#9A1750] to-[#5D001E] opacity-80"
              style={{ 
                transform: `rotateY(-90deg) translateZ(4px)`,
                transformOrigin: 'right center'
              }}
            />
          </div>

          {/* Floating Elements Around Store */}
          <div className="absolute -top-16 -left-16 w-8 h-8 bg-yellow-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s', transform: `translateZ(${scrollProgress * 50}px)` }} />
          <div className="absolute -top-12 -right-12 w-6 h-6 bg-green-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.5s', transform: `translateZ(${scrollProgress * 40}px)` }} />
          <div className="absolute -bottom-10 -left-10 w-7 h-7 bg-blue-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s', transform: `translateZ(${scrollProgress * 45}px)` }} />
          <div className="absolute -bottom-8 -right-8 w-5 h-5 bg-purple-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1.5s', transform: `translateZ(${scrollProgress * 35}px)` }} />

          {/* Ground/Base */}
          <div 
            className="absolute -bottom-8 -left-12 -right-12 h-4 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-full opacity-60 blur-sm"
            style={{ transform: `translateZ(-10px) scale(${1 + scrollProgress * 0.5})` }}
          />
        </div>
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
      <div className="absolute top-8 right-8 text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg p-4 z-20 border border-white/20">
        <h3 className="font-semibold mb-2 text-[#EE4C7C]">🎮 Ovládanie:</h3>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Koliesko myši - vstup/výstup</li>
          <li>⌨️ ↑↓ šípky - vstup/výstup</li>
          <li>⎋ Escape - opustiť režim</li>
          <li>📱 Mobilné zariadenia - dotyk</li>
        </ul>
      </div>

      {/* Entry Effect */}
      {scrollProgress > 0.7 && (
        <div 
          className="absolute inset-0 bg-white transition-opacity duration-1000 pointer-events-none"
          style={{ opacity: (scrollProgress - 0.7) * 0.3 }}
        />
      )}

      {/* Welcome Message */}
      {scrollProgress > 0.8 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30 animate-fade-in">
          <div className="bg-black/80 backdrop-blur-md rounded-xl p-8 border border-[#EE4C7C]/50 shadow-2xl">
            <h3 className="text-3xl font-bold mb-3 text-[#EE4C7C] drop-shadow-lg">
              🏪 Vitajte v obchode!
            </h3>
            <p className="text-xl text-white mb-4">Vstupujete do sveta čerstvých produktov...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE4C7C]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </section>
  );
}