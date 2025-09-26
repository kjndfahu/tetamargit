'use client';

import { useEffect, useRef, useState } from 'react';
import { VirtualStore } from './virtual-store';
import { StoreUI } from './store-ui';
import { Product } from '@/lib/products';

// Mock data for testing when Supabase is not available
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Домашняя колбаса',
    description: 'Традиционная домашняя колбаса из качественного мяса',
    price: 8.50,
    old_price: 10.00,
    category_id: 'meat',
    stock_quantity: 15,
    is_active: true,
    is_featured: true,
    weight: 500,
    unit: 'г',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'meat', name: 'Мясные изделия', slug: 'meat', is_active: true, display_order: 1, created_at: '', updated_at: '' }
  },
  {
    id: '2',
    name: 'Домашний сыр',
    description: 'Свежий домашний сыр из натурального молока',
    price: 6.20,
    category_id: 'dairy',
    stock_quantity: 8,
    is_active: true,
    is_featured: true,
    weight: 300,
    unit: 'г',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'dairy', name: 'Молочные продукты', slug: 'dairy', is_active: true, display_order: 2, created_at: '', updated_at: '' }
  },
  {
    id: '3',
    name: 'Свежий хлеб',
    description: 'Домашний хлеб, выпеченный по традиционному рецепту',
    price: 2.80,
    category_id: 'bakery',
    stock_quantity: 20,
    is_active: true,
    is_featured: true,
    weight: 400,
    unit: 'г',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'bakery', name: 'Хлебобулочные изделия', slug: 'bakery', is_active: true, display_order: 3, created_at: '', updated_at: '' }
  },
  {
    id: '4',
    name: 'Свежие овощи',
    description: 'Сезонные овощи с нашего огорода',
    price: 4.50,
    category_id: 'vegetables',
    stock_quantity: 25,
    is_active: true,
    is_featured: true,
    weight: 1000,
    unit: 'г',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'vegetables', name: 'Овощи', slug: 'vegetables', is_active: true, display_order: 4, created_at: '', updated_at: '' }
  },
  {
    id: '5',
    name: 'Домашнее варенье',
    description: 'Варенье из свежих ягод по бабушкиному рецепту',
    price: 5.90,
    category_id: 'preserves',
    stock_quantity: 12,
    is_active: true,
    is_featured: true,
    weight: 500,
    unit: 'г',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'preserves', name: 'Консервы', slug: 'preserves', is_active: true, display_order: 5, created_at: '', updated_at: '' }
  },
  {
    id: '6',
    name: 'Свежее молоко',
    description: 'Натуральное коровье молоко от местных фермеров',
    price: 3.20,
    category_id: 'dairy',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    weight: 1000,
    unit: 'мл',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'dairy', name: 'Молочные продукты', slug: 'dairy', is_active: true, display_order: 2, created_at: '', updated_at: '' }
  }
];

export function VirtualStoreSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [storeInstance, setStoreInstance] = useState<VirtualStore | null>(null);
  const initializingRef = useRef(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [hasEnteredStore, setHasEnteredStore] = useState(false);
  const [products] = useState<Product[]>(mockProducts);
  const productsLoading = false;

  useEffect(() => {
    if (!containerRef.current || productsLoading || products.length === 0 || initializingRef.current || storeInstance) return;

    initializingRef.current = true;
    
    const store = new VirtualStore(containerRef.current, products);

    // Обработчики событий
    const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
    };

    const handleSectionChange = (section: number) => {
      setCurrentSection(section);
    };

    const handleStoreEntered = () => {
      setHasEnteredStore(true);
    };

    const handleLoadingComplete = () => {
      setIsLoading(false);
      initializingRef.current = false;
    };

    store.on('productClick', handleProductClick);
    store.on('sectionChange', handleSectionChange);
    store.on('storeEntered', handleStoreEntered);
    store.on('loadingComplete', handleLoadingComplete);

    // Инициализация магазина
    store.init().then(() => {
      setStoreInstance(store);
      console.log('Virtual store initialized');
    }).catch((error) => {
      console.error('Failed to initialize virtual store:', error);
      initializingRef.current = false;
      setIsLoading(false);
    });

    return () => {
      initializingRef.current = false;
      if (store) {
        store.dispose();
      }
    };
  }, [products, productsLoading]);

  // Отдельный useEffect для очистки при размонтировании
  useEffect(() => {
    return () => {
      if (storeInstance) {
        storeInstance.dispose();
        setStoreInstance(null);
      }
    };
  }, []);

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
        hasEnteredStore={hasEnteredStore}
        totalSections={products.length}
        onNavigateToSection={(section) => storeInstance?.navigateToSection(section)}
      />
    </section>
  );
}