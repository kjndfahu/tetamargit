'use client';

import { useState } from 'react';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';

const recentlyViewedProducts = [
  {
    id: 1,
    name: 'Čerstvé paradajky',
    category: 'Zelenina',
    price: 2.50,
    oldPrice: 3.20,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop',
    isFavorite: false,
    isInCart: false
  },
  {
    id: 2,
    name: 'Avokádo Hass',
    category: 'Ovocie',
    price: 3.50,
    oldPrice: 4.20,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop',
    isFavorite: true,
    isInCart: false
  },
  {
    id: 3,
    name: 'Hovädzie sviečkové',
    category: 'Mäso',
    price: 15.90,
    oldPrice: 18.50,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1616ee7?w=300&h=300&fit=crop',
    isFavorite: false,
    isInCart: true
  },
  {
    id: 4,
    name: 'Dedinské mlieko',
    category: 'Mliečne',
    price: 1.80,
    oldPrice: 2.10,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
    isFavorite: false,
    isInCart: false
  },
  {
    id: 5,
    name: 'Banány',
    category: 'Ovocie',
    price: 2.20,
    oldPrice: 2.80,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop',
    isFavorite: true,
    isInCart: false
  },
  {
    id: 6,
    name: 'Čerstvá zelenina',
    category: 'Zelenina',
    price: 1.50,
    oldPrice: 1.90,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop',
    isFavorite: false,
    isInCart: false
  }
];

export function RecentlyViewed() {
  const [products, setProducts] = useState(recentlyViewedProducts);

  const toggleFavorite = (productId: number) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isFavorite: !product.isFavorite }
        : product
    ));
  };

  const toggleCart = (productId: number) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isInCart: !product.isInCart }
        : product
    ));
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-orange-500 font-medium mb-2">
                  {product.category}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-black">
                      {product.price}€
                    </span>
                    {product.oldPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.oldPrice}€
                      </span>
                    )}
                  </div>
                  
                  <button className="bg-orange-500 hover:bg-[#f5f5f5] cursor-pointer text-white hover:text-gray-600 hover:border-[1px] hover:border-gray-600 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Do košíka
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-orange-500 hover:from-yellow-500 hover:to-orange-600 cursor-pointer text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Zobraziť všetky produkty
          </button>
        </div>
      </div>
    </section>
  );
}


