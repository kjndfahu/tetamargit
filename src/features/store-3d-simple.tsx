'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Store Mockup */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative transition-all duration-1000 ease-out"
          style={{
            transform: `
              perspective(1000px) 
              rotateX(${-10 + scrollProgress * 20}deg) 
              rotateY(${scrollProgress * 360}deg) 
              scale(${0.5 + scrollProgress * 1.5})
              translateZ(${scrollProgress * 200}px)
            `
          }}
        >
          {/* Store Building */}
          <div className="relative w-80 h-60 bg-gradient-to-b from-[#EE4C7C] to-[#9A1750] rounded-lg shadow-2xl">
            {/* Store Front */}
            <div className="absolute inset-x-4 bottom-4 top-8 bg-white/90 rounded-lg backdrop-blur-sm">
              {/* Windows */}
              <div className="grid grid-cols-3 gap-2 p-4 h-full">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-gradient-to-br from-blue-200 to-blue-400 rounded opacity-80 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg">
                <div className="absolute right-1 top-6 w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
            </div>

            {/* Roof */}
            <div 
              className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded-t-lg"
              style={{
                clipPath: 'polygon(0 100%, 50% 0, 100% 100%)'
              }}
            />

            {/* Sign */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded shadow-lg">
              <span className="text-[#EE4C7C] font-bold text-sm">Teta Márgit</span>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-10 -left-10 w-6 h-6 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute -top-8 -right-8 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-6 -left-6 w-5 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white z-10 px-4">
          <h2 
            className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg transition-all duration-1000"
            style={{
              transform: `translateY(${-scrollProgress * 50}px)`,
              opacity: 1 - scrollProgress * 0.5
            }}
          >
            Vitajte v našom obchode
          </h2>
          <p 
            className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md max-w-2xl mx-auto transition-all duration-1000"
            style={{
              transform: `translateY(${-scrollProgress * 30}px)`,
              opacity: 1 - scrollProgress * 0.3
            }}
          >
            Skrolujte nadol a vstúpte do sveta čerstvých produktov
          </p>
          
          {scrollProgress < 0.5 && (
            <div className="flex flex-col items-center animate-bounce">
              <ChevronDown className="w-8 h-8 text-white mb-2" />
              <span className="text-sm text-gray-300">Skrolujte pre vstup</span>
            </div>
          )}
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
          Vstup do obchodu: {Math.round(scrollProgress * 100)}%
        </p>
      </div>

      {/* Interactive Hints */}
      <div className="absolute top-8 right-8 text-white text-sm bg-black/30 backdrop-blur-sm rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-[#EE4C7C]">Interaktívny obchod:</h3>
        <ul className="space-y-1 text-xs">
          <li>📜 Skrolovanie - vstup do obchodu</li>
          <li>🏪 3D animácia budovy</li>
          <li>✨ Interaktívne efekty</li>
        </ul>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </section>
  );
}