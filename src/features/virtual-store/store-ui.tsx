'use client';

import { X, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/products';
import { useState } from 'react';

interface StoreUIProps {
  selectedProduct: Product | null;
  onCloseProduct: () => void;
  currentSection: number;
  totalSections: number;
  onNavigateToSection: (section: number) => void;
}

export function StoreUI({ 
  selectedProduct, 
  onCloseProduct, 
  currentSection, 
  totalSections, 
  onNavigateToSection 
}: StoreUIProps) {
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    
    try {
      setAddingToCart(true);
      // Mock add to cart functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Added to cart:', selectedProduct.name);
      onCloseProduct();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const getSectionName = (index: number) => {
    if (index === 0) return 'Обзор';
    return `Продукт ${index}`;
  };
  return (
    <>
      {/* Navigation Controls */}
      <div className="absolute top-6 right-6 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
          <button
            onClick={() => onNavigateToSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-white font-medium px-3 text-center min-w-[120px]">
            <div className="text-sm">{getSectionName(currentSection)}</div>
            <div className="text-xs opacity-75">{currentSection + 1} / {totalSections}</div>
          </div>
          
          <button
            onClick={() => onNavigateToSection(Math.min(totalSections - 1, currentSection + 1))}
            disabled={currentSection === totalSections - 1}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Section Indicators */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
          {Array.from({ length: totalSections }, (_, i) => (
            <button
              key={i}
              onClick={() => onNavigateToSection(i)}
              title={getSectionName(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSection
                  ? 'bg-[#EE4C7C] scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCloseProduct} />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-xl font-semibold mb-1">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {selectedProduct.category?.name || 'Без категории'}
                  </p>
                </div>
                <button
                  onClick={onCloseProduct}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              {/* Product Details */}
              <div className="space-y-2 mb-6">
                {selectedProduct.weight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Вес:</span>
                    <span className="text-gray-900">
                      {selectedProduct.weight} {selectedProduct.unit}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">В наличии:</span>
                  <span className="text-gray-900">
                    {selectedProduct.stock_quantity} шт.
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-black">
                    {selectedProduct.price}€
                  </span>
                  {selectedProduct.old_price && selectedProduct.old_price > selectedProduct.price && (
                    <span className="text-lg text-gray-500 line-through">
                      {selectedProduct.old_price}€
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || selectedProduct.stock_quantity === 0}
                className="w-full bg-[#EE4C7C] hover:bg-[#9A1750] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'Добавляем...' : 
                 selectedProduct.stock_quantity === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}