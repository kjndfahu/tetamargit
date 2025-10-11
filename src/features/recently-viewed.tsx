'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { useState } from 'react';


export function RecentlyViewed() {
  const { recentProducts, loading } = useRecentlyViewed();
  const addToCart = useCartStore(s => s.addToCart);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, price: number) => {
    try {
      setAddingToCart(productId);
      await addToCart({
        product_id: productId,
        quantity: 1,
        price: price
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (!loading && recentProducts.length === 0) {
    return null;
  }

  return (
    <section className=" bg-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-20">
        <div className="text-center mb-25">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Naposledy zobrazené
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vráťte sa k produktom, ktoré vás zaujali. Možno je teraz ten správny čas si ich objednať!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {recentProducts.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs text-[#8B4513] font-medium mb-2">
                    {product.category?.name || 'Bez kategórie'}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#8B4513] transition-colors">
                    {product.name}
                  </h3>
                </div>
              </Link>

              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-black">
                      {product.price}€
                    </span>
                    {product.old_price && product.old_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.old_price}€
                      </span>
                    )}
                  </div>
                    <button 
                      onClick={() => handleAddToCart(product.id, product.price)}
                      disabled={addingToCart === product.id}
                      className="bg-[#8B4513] hover:bg-[#2C1810] cursor-pointer text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      {addingToCart === product.id ? 'Pridávam...' : 'Do košíka'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}


