'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bannerSlides = [
  {
    id: 1,
    title: 'Banner 1',
    subtitle: 'Vitajte v našej obchode s čerstvými produktmi'
  },
  {
    id: 2,
    title: 'Banner 2',
    subtitle: 'Tradičné recepty našej tety Márgit'
  },
  {
    id: 3,
    title: 'Banner 3',
    subtitle: 'Kvalitné potraviny pre vašu rodinu'
  },
  {
    id: 4,
    title: 'Banner 4',
    subtitle: 'Domáce produkty priamo od farmárov'
  }
];

export function ImageBanner() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentSlideIndex((prev) => 
      prev === 0 ? bannerSlides.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  return (
    <section className="relative h-96 overflow-hidden bg-gray-600">
      {bannerSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlideIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200">
                {slide.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={goToPrevious}
        className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlideIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
