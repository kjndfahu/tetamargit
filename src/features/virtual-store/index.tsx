'use client';

import { useEffect, useRef, useState } from 'react';
import { VirtualStore } from './virtual-store';
import { StoreUI } from './store-ui';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/lib/products';

export function VirtualStoreSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [storeInstance, setStoreInstance] = useState<VirtualStore | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  
  // Получаем продукты для отображения в магазине
  const { products, loading: productsLoading } = useProducts(
    { inStock: true, featured: true }, 
    { field: 'created_at', direction: 'desc' }, 
    12
  );

  useEffect(() => {
    if (!containerRef.current || productsLoading || products.length === 0) return;

    const store = new VirtualStore(containerRef.current, products);
    setStoreInstance(store);

    // Обработчики событий
    const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
    };

    const handleSectionChange = (section: number) => {
      setCurrentSection(section);
    };

    const handleLoadingComplete = () => {
      setIsLoading(false);
    };

    store.on('productClick', handleProductClick);
    store.on('sectionChange', handleSectionChange);
    store.on('loadingComplete', handleLoadingComplete);

    // Инициализация магазина
    store.init().then(() => {
      console.log('Virtual store initialized');
    });

    return () => {
      store.dispose();
    };
  }, [products, productsLoading]);

  if (productsLoading) {
    return (
      <section className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C] mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем продукты...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EE4C7C] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Загружаем виртуальный магазин</h3>
            <p className="text-gray-300">Подготавливаем 3D модели продуктов...</p>
          </div>
        </div>
      )}

      {/* Store UI Overlay */}
      <StoreUI
        selectedProduct={selectedProduct}
        onCloseProduct={() => setSelectedProduct(null)}
        currentSection={currentSection}
        totalSections={Math.ceil(products.length / 4)}
        onNavigateToSection={(section) => storeInstance?.navigateToSection(section)}
      />

      {/* Instructions */}
      {!isLoading && (
        <div className="absolute bottom-6 left-6 text-white/80 text-sm">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 space-y-2">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EE4C7C] rounded-full"></span>
              Прокрутите мышью для перемещения по магазину
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EE4C7C] rounded-full"></span>
              Кликните на продукт для подробной информации
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#EE4C7C] rounded-full"></span>
              Используйте мышь для поворота камеры
            </p>
          </div>
        </div>
      )}
    </section>
  );
}