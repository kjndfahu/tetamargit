'use client';

import { useState } from 'react';
import { Filter as FilterIcon, Search, Star, ShoppingCart, Heart } from 'lucide-react';

const categories = [
  { id: 'vegetables', name: 'Zelenina' },
  { id: 'fruits', name: 'Ovocie' },
  { id: 'meat', name: 'Mäso' },
  { id: 'dairy', name: 'Mliečne' },
  { id: 'bakery', name: 'Pečivo' }
];

const priceRanges = [
  { id: 'low', name: 'Do 2€', min: 0, max: 2 },
  { id: 'medium', name: '2€ - 10€', min: 2, max: 10 },
  { id: 'high', name: '10€ - 20€', min: 10, max: 20 },
  { id: 'premium', name: 'Od 20€', min: 20, max: Infinity }
];

const sampleProducts = [
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

export function Filter() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [products] = useState(sampleProducts);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange('');
    setSearchQuery('');
    setSortBy('popular');
  };

  const applyFilters = () => {
    console.log('Aplikujeme filtre:', {
      categories: selectedCategories,
      priceRange: selectedPriceRange,
      search: searchQuery,
      sort: sortBy
    });
  };

  return (
    <section className="bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-25">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Naše produkty
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vyberte si z našej širokej ponuky čerstvých a kvalitných produktov
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/5">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filtre</h3>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Vyhľadávanie
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Názov..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block cursor-pointer text-xs font-medium text-gray-700 mb-1">
                  Zoradenie
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2 px-2 cursor-pointer text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option className="cursor-pointer" value="popular">Popularita</option>
                  <option className="cursor-pointer" value="price-low">Cena ↑</option>
                  <option className="cursor-pointer" value="price-high">Cena ↓</option>
                  <option className="cursor-pointer" value="name">Názov</option>
                  <option className="cursor-pointer" value="new">Nové</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cena
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full py-2 cursor-pointer px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Všetky</option>
                  {priceRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Kategórie
                </label>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full p-2 rounded-lg border transition-all cursor-pointer duration-200 text-xs ${
                        selectedCategories.includes(category.id)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={applyFilters}
                  className="w-full cursor-pointer bg-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Aplikovať
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
                >
                  Resetovať
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-4/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      </div>
    </section>
  );
}


