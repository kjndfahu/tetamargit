'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollRotationState } from '../types';

export function useScrollRotation() {
  const [scrollState, setScrollState] = useState<ScrollRotationState>({
    rotation: 0,
    progress: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Вычисляем прогресс скролла через контейнер
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight - rect.top) / (windowHeight + containerHeight)
      ));

      // Конвертируем прогресс в градусы вращения (полный оборот = 360°)
      const rotation = scrollProgress * 360;

      setScrollState({
        rotation,
        progress: scrollProgress
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Инициализация

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollState, containerRef };
}