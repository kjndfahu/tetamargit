'use client';

import { X, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/products';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface StoreUIProps {
  selectedProduct: Product | null;
  onCloseProduct: () => void;
  currentSection: number;
  hasEnteredStore: boolean;
  totalSections: number;
  onNavigateToSection: (section: number) => void;
  onEnterStore: () => void;
  onExitStore: () => void;
}

export function StoreUI({
  selectedProduct,
  onCloseProduct,
  currentSection,
  hasEnteredStore,
  totalSections,
  onNavigateToSection,
  onEnterStore,
  onExitStore
}: StoreUIProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      setAddingToCart(true);
      setCartError(null);

      await addToCart({
        product_id: selectedProduct.id,
        quantity: 1,
        price: selectedProduct.price
      });

      console.log('Added to cart:', selectedProduct.name);
      onCloseProduct();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartError(error.message || 'Nepodarilo sa pridať produkt do košíka');
    } finally {
      setAddingToCart(false);
    }
  };

  const getSectionName = (index: number) => {
    const productNames = [
      'Salámová paštéta',
      'Margit-chmeľáčik (Malinovka)',
      'Paštéta Bolognese',
      'Pivnica Radošina (Margit-víno)',
      'Margit-káva kolekcia',
      'Pečeňová paštéta'
    ];
    return productNames[index] || `Produkt ${index + 1}`;
  };

  const getSectionSide = (index: number) => {
    if (index <= 2) {
      return 'Ľavá strana';
    } else {
      return 'Pravá strana';
    }
  };
  return (
    <>
      {/* Exit Button - Fixed position */}
      {hasEnteredStore && (
        <button
          onClick={onExitStore}
          className="absolute top-4 right-4 md:top-2 md:right-2 z-20 bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm rounded-lg p-1 text-white transition-colors cursor-pointer w-9 h-9 md:w-8 md:h-8 flex items-center justify-center"
          title="Opustiť simulátor"
        >
          <X className="w-5 h-5 md:w-4 md:h-4" />
        </button>
      )}

      {/* Navigation Controls */}
      {hasEnteredStore && (
        <div className="absolute top-16 right-4 md:top-12 md:right-2 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 md:p-3 flex items-center gap-2 md:gap-3">
          <button
            onClick={() => {
              const newSection = currentSection === 0 ? totalSections - 1 : currentSection - 1;
              onNavigateToSection(newSection);
            }}
            className="p-1.5 md:p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="text-white font-medium px-2 md:px-3 text-center min-w-[100px] md:min-w-[120px]">
            <div className="text-xs md:text-sm">{getSectionName(currentSection)}</div>
            <div className="text-[10px] md:text-xs opacity-75">{getSectionSide(currentSection)}</div>
          </div>

          <button
            onClick={() => {
              const newSection = currentSection === totalSections - 1 ? 0 : currentSection + 1;
              onNavigateToSection(newSection);
            }}
            className="p-1.5 md:p-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
        </div>
      )}

      {/* Section Indicators - Hidden on mobile */}
      {hasEnteredStore && (
        <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 md:p-3 flex items-center gap-1.5 md:gap-2">
          {Array.from({ length: totalSections }, (_, i) => (
            <button
              key={i}
              onClick={() => onNavigateToSection(i)}
              title={getSectionName(i)}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                i === currentSection
                  ? 'bg-[#EE4C7C] scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
        </div>
      )}

      {/* Welcome Message */}
      {!hasEnteredStore && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer px-4"
          onClick={onEnterStore}
        >
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Vitajte v obchode Teta Márgit!</h2>
            <p className="text-base md:text-xl mb-4 md:mb-6">Kliknite pre vstup do obchodu</p>
            <div className="animate-bounce">
              <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white rounded-full mx-auto">
                <div className="w-1 h-2 md:h-3 bg-white rounded-full mx-auto mt-1.5 md:mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {hasEnteredStore && (
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white/80 text-xs md:text-sm">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 md:p-4 space-y-1.5 md:space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#EE4C7C] rounded-full flex-shrink-0"></span>
              <span className="hidden md:inline">Rolujte myšou pre prezeranie produktov</span>
              <span className="md:hidden">Swipe pre prezeranie</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#EE4C7C] rounded-full flex-shrink-0"></span>
              Kliknite na produkt
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#EE4C7C] rounded-full flex-shrink-0"></span>
              <span className="hidden md:inline">Použite šípky alebo bodky pre navigáciu</span>
              <span className="md:hidden">Šípky alebo bodky</span>
            </p>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCloseProduct} />

          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EE4C7C] to-[#9A1750] p-3 md:p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-1">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-white/90 text-xs md:text-sm">
                    {selectedProduct.category?.name || 'Bez kategórie'}
                  </p>
                </div>
                <button
                  onClick={onCloseProduct}
                  className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {/* Product Image */}
              <div className="w-full h-40 md:h-48 bg-gray-100 rounded-lg mb-3 md:mb-4 overflow-hidden">
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
                <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
              )}

              {/* Product Details */}
              <div className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                {selectedProduct.weight && (
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-500">Hmotnosť:</span>
                    <span className="text-gray-900">
                      {selectedProduct.weight} {selectedProduct.unit}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-500">Na sklade:</span>
                  <span className="text-gray-900">
                    {selectedProduct.stock_quantity} ks
                  </span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl md:text-2xl font-bold text-black">
                    {selectedProduct.price}€
                  </span>
                  {selectedProduct.old_price && selectedProduct.old_price > selectedProduct.price && (
                    <span className="text-base md:text-lg text-gray-500 line-through">
                      {selectedProduct.old_price}€
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {cartError && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-xs md:text-sm">
                  {cartError}
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || selectedProduct.stock_quantity === 0}
                className="w-full bg-[#EE4C7C] hover:bg-[#9A1750] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 md:py-3 px-4 md:px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                {addingToCart ? 'Pridávam...' :
                 selectedProduct.stock_quantity === 0 ? 'Nie je na sklade' : 'Pridať do košíka'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}