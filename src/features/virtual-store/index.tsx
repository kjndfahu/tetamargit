'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { VirtualStore } from './virtual-store';
import { StoreUI } from './store-ui';
import { Product } from '@/lib/products';

// Mock data for testing when Supabase is not available
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Salámová paštéta originál',
    description: 'Tradičná salámová paštéta s výraznou chuťou',
    price: 2.99,
    category_id: 'salamova-pasteta',
    stock_quantity: 50,
    is_active: true,
    is_featured: true,
    weight: 100,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'salamova-pasteta', name: 'Salámová paštéta', slug: 'salamova-pasteta', is_active: true, display_order: 1, created_at: '', updated_at: '' }
  },
  {
    id: '2',
    name: 'Margit-chmeľáčik',
    description: 'Osviežujúci nápoj s príchuťou maliny',
    price: 1.49,
    category_id: 'margit-chmelacik-malinovka',
    stock_quantity: 100,
    is_active: true,
    is_featured: true,
    weight: 330,
    unit: 'ml',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'margit-chmelacik-malinovka', name: 'Margit-chmeľáčik (Malinovka)', slug: 'margit-chmelacik-malinovka', is_active: true, display_order: 2, created_at: '', updated_at: '' }
  },
  {
    id: '3',
    name: 'Paštéta Bolognese',
    description: 'Lahodná paštéta v štýle Bolognese',
    price: 3.29,
    category_id: 'pasteta-bolognese',
    stock_quantity: 40,
    is_active: true,
    is_featured: true,
    weight: 100,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'pasteta-bolognese', name: 'Paštéta Bolognese', slug: 'pasteta-bolognese', is_active: true, display_order: 3, created_at: '', updated_at: '' }
  },
  {
    id: '4',
    name: 'Pivnica Radošina - Biele víno',
    description: 'Kvalitné biele víno z Pivnice Radošina',
    price: 8.99,
    category_id: 'pivnica-radosina-margit-vino',
    stock_quantity: 30,
    is_active: true,
    is_featured: true,
    weight: 750,
    unit: 'ml',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'pivnica-radosina-margit-vino', name: 'Pivnica Radošina (Margit-víno)', slug: 'pivnica-radosina-margit-vino', is_active: true, display_order: 4, created_at: '', updated_at: '' }
  },
  {
    id: '5',
    name: 'Margit-káva Espresso',
    description: 'Prémiová káva espresso z kolekcie Margit',
    price: 5.99,
    category_id: 'margit-kava-kolekcia',
    stock_quantity: 60,
    is_active: true,
    is_featured: true,
    weight: 250,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'margit-kava-kolekcia', name: 'Margit-káva kolekcia', slug: 'margit-kava-kolekcia', is_active: true, display_order: 5, created_at: '', updated_at: '' }
  },
  {
    id: '6',
    name: 'Pečeňová paštéta klasická',
    description: 'Jemná pečeňová paštéta podľa tradičného receptu',
    price: 2.79,
    category_id: 'pecenova-pasteta',
    stock_quantity: 45,
    is_active: true,
    is_featured: true,
    weight: 100,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'pecenova-pasteta', name: 'Pečeňová paštéta', slug: 'pecenova-pasteta', is_active: true, display_order: 6, created_at: '', updated_at: '' }
  }
];

function VirtualStoreSectionComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [storeInstance, setStoreInstance] = useState<VirtualStore | null>(null);
  const initializingRef = useRef(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [hasEnteredStore, setHasEnteredStore] = useState(false);
  const [products] = useState<Product[]>(mockProducts);
  const productsLoading = false;

  useEffect(() => {
    if (!containerRef.current || productsLoading || products.length === 0 || initializingRef.current || storeInstance) return;

    initializingRef.current = true;
    setLoadingError(null);
    
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

    const handleExitStore = () => {
      setHasEnteredStore(false);
      setCurrentSection(0);
    };

    store.on('productClick', handleProductClick);
    store.on('sectionChange', handleSectionChange);
    store.on('storeEntered', handleStoreEntered);
    store.on('loadingComplete', handleLoadingComplete);
    store.on('exitStore', handleExitStore);

    // Инициализация магазина
    store.init().then(() => {
      console.log('Store instance created successfully');
      setStoreInstance(store);
    }).catch((error) => {
      console.error('Failed to initialize virtual store:', error);
      setLoadingError('Nepodarilo sa načítať 3D model obchodu. Skontrolujte internetové pripojenie.');
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
    <section className="relative w-full min-h-[50vh] h-[70vh] md:h-[70vh] lg:h-[90vh] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C] mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Načítavame virtuálny obchod</h3>
            <p className="text-gray-300"></p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadingError && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="text-center text-white max-w-md mx-4">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Chyba načítania</h3>
            <p className="text-gray-300 mb-4">{loadingError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#EE4C7C] hover:bg-[#9A1750] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Skúsiť znova
            </button>
          </div>
        </div>
      )}

      {/* Store UI Overlay */}
      {!loadingError && (
        <StoreUI
          selectedProduct={selectedProduct}
          onCloseProduct={() => setSelectedProduct(null)}
          currentSection={currentSection}
          hasEnteredStore={hasEnteredStore}
          totalSections={products.length}
          onNavigateToSection={(section) => storeInstance?.navigateToSection(section)}
          onEnterStore={() => storeInstance?.enterStore()}
          onExitStore={() => storeInstance?.exitStore()}
        />
      )}
    </section>
  );
}

export const VirtualStoreSection = memo(VirtualStoreSectionComponent);