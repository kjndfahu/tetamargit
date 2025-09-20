'use client';

import { useState } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product3D } from '../types';

interface Product3DCardProps {
  product: Product3D;
  index: number;
  rotation: number;
  totalProducts: number;
}

export function Product3DCard({ product, index, rotation, totalProducts }: Product3DCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Вычисляем позицию карточки в круговой карусели
  const angleOffset = (360 / totalProducts) * index;
  const currentAngle = rotation + angleOffset;
  const radius = 280; // Радиус окружности

  // Позиционирование в 2D с эффектом глубины
  const x = Math.sin((currentAngle * Math.PI) / 180) * radius;
  const z = Math.cos((currentAngle * Math.PI) / 180) * radius;

  // Определяем видимость и масштаб карточки
  const visibility = Math.cos((currentAngle * Math.PI) / 180);
  const opacity = Math.max(0.4, (visibility + 1) / 2);
  const scale = Math.max(0.6, (visibility + 1) / 2);

  return (
    <div
      className="absolute transition-all duration-300 ease-out"
      style={{
        transform: `translateX(${x}px) translateZ(${z}px) scale(${isHovered ? scale * 1.1 : scale})`,
        opacity: opacity,
        zIndex: Math.round(z + 300),
        left: '50%',
        top: '50%',
        marginLeft: '-128px', // половина ширины карточки
        marginTop: '-160px',  // половина высоты карточки
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-64 h-80 transition-all duration-300 hover:shadow-3xl">
        {/* Изображение товара */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Категория */}
          <div className="absolute top-3 left-3">
            <span className="bg-[#EE4C7C] text-white text-xs px-2 py-1 rounded-full font-medium">
              {product.category}
            </span>
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-[#EE4C7C]">
              {product.price}€
            </span>
            
            {/* Кнопки действий */}
            <div className={`flex gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <button className="p-2 bg-gray-100 hover:bg-[#EE4C7C] hover:text-white rounded-lg transition-colors duration-200">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 bg-[#EE4C7C] hover:bg-[#9A1750] text-white rounded-lg transition-colors duration-200">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}