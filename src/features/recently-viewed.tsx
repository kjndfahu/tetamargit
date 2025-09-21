'use client';

import { useFeaturedProducts } from '@/hooks/useProducts';


export function RecentlyViewed() {
  const { products, loading, error } = useFeaturedProducts(6);

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

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
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop'}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-orange-500 font-medium mb-2">
                  {product.category?.name || 'Bez kategórie'}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                  {product.name}
                </h3>

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
                    <button className="bg-[#EE4C7C] hover:bg-[#f5f5f5] cursor-pointer text-white hover:text-gray-600 hover:border-[1px] hover:border-gray-600 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Do košíka
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Žiadne odporúčané produkty</p>
          </div>
        )}

        <div className="text-center mt-12">
          <button className="bg-[#EE4C7C] hover:bg-[#9A1750] cursor-pointer text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Zobraziť všetky produkty
          </button>
        </div>
      </div>
    </section>
  );
}


