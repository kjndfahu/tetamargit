'use client';

import { Product3DCard } from './Product3DCard';
import { useScrollRotation } from '../hooks/useScrollRotation';
import { Product3D } from '../types';

// Моковые данные товаров
const mockProducts: Product3D[] = [
  {
    id: '1',
    name: 'Домашний хлеб',
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop',
    category: 'Выпечка',
    description: 'Свежий домашний хлеб, выпеченный по традиционному рецепту'
  },
  {
    id: '2',
    name: 'Фермерское молоко',
    price: 1.80,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    category: 'Молочные',
    description: 'Натуральное молоко от местных фермеров'
  },
  {
    id: '3',
    name: 'Свежие овощи',
    price: 3.20,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
    category: 'Овощи',
    description: 'Сезонные овощи с собственного огорода'
  },
  {
    id: '4',
    name: 'Домашний сыр',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
    category: 'Молочные',
    description: 'Ароматный сыр домашнего приготовления'
  },
  {
    id: '5',
    name: 'Мясные деликатесы',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1616ee7?w=400&h=400&fit=crop',
    category: 'Мясо',
    description: 'Качественные мясные изделия от проверенных поставщиков'
  },
  {
    id: '6',
    name: 'Сезонные фрукты',
    price: 2.90,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef4644b9?w=400&h=400&fit=crop',
    category: 'Фрукты',
    description: 'Спелые и сочные фрукты прямо с дерева'
  }
];

export function Products3DCarousel() {
  const { scrollState, containerRef } = useScrollRotation();

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Фоновые элементы */}
      <div className="absolute inset-0">
        {/* Анимированные частицы */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#EE4C7C] rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#9A1750] rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-[#EE4C7C] rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-[#E3AFBC] rounded-full animate-pulse opacity-70"></div>
        
        {/* Градиентные круги */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#EE4C7C]/10 to-[#9A1750]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-[#E3AFBC]/15 to-[#EE4C7C]/15 rounded-full blur-3xl"></div>
      </div>

      {/* Заголовок секции */}
      <div className="relative z-10 text-center pt-20 mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Наши <span className="text-gradient">3D товары</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Прокрутите страницу, чтобы увидеть наши товары в 3D пространстве
        </p>
        
        {/* Индикатор прогресса */}
        <div className="mt-8 flex justify-center">
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] transition-all duration-300 ease-out"
              style={{ width: `${scrollState.progress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3D Контейнер */}
      <div className="relative flex items-center justify-center h-96">
        <div 
          className="relative preserve-3d"
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          {mockProducts.map((product, index) => (
            <Product3DCard
              key={product.id}
              product={product}
              index={index}
              rotation={scrollState.rotation}
              totalProducts={mockProducts.length}
            />
          ))}
        </div>
      </div>

      {/* Инструкция для пользователя */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="animate-bounce">⬇️</span>
            Прокрутите для вращения товаров
            <span className="animate-bounce">⬇️</span>
          </p>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#EE4C7C]/20 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-[#9A1750]/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
      </div>
    </section>
  );
}