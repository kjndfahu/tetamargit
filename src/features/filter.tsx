'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductFilters, ProductSort } from '@/lib/products';

const priceRanges = [
  { id: 'low', name: 'Do 2€', min: 0, max: 2 },
  { id: 'medium', name: '2€ - 10€', min: 2, max: 10 },
  { id: 'high', name: '10€ - 20€', min: 10, max: 20 },
  { id: 'premium', name: 'Od 20€', min: 20, max: Infinity }
];

export function Filter() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>({ field: 'created_at', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { categories, parentCategories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading, error } = useProducts(filters, sort, 50);

  // Helper function to get all child category IDs for a parent category
  const getChildCategoryIds = (parentId: string): string[] => {
    const parentCategory = categories.find(cat => cat.id === parentId);
    if (parentCategory?.children) {
      return parentCategory.children.map(child => child.id);
    }
    return [];
  };

  // Helper function to check if a category is a parent category
  const isParentCategory = (categoryId: string): boolean => {
    return categories.some(cat => cat.id === categoryId && cat.children && cat.children.length > 0);
  };

  useEffect(() => {
    const newFilters: ProductFilters = {};
    
    if (selectedCategories.length > 0) {
      const selectedCategoryId = selectedCategories[0];
      
      // Check if selected category is a parent category
      if (isParentCategory(selectedCategoryId)) {
        // Get all child category IDs
        const childIds = getChildCategoryIds(selectedCategoryId);
        // Include both parent and all child categories
        newFilters.categories = [selectedCategoryId, ...childIds];
      } else {
        // Single category selection
        newFilters.category = selectedCategoryId;
      }
    }
    
    if (selectedPriceRange) {
      const range = priceRanges.find(r => r.id === selectedPriceRange);
      if (range) {
        newFilters.priceMin = range.min;
        newFilters.priceMax = range.max === Infinity ? undefined : range.max;
      }
    }
    
    if (searchQuery.trim()) {
      newFilters.search = searchQuery.trim();
    }
    
    newFilters.inStock = true; // Only show products in stock
    
    setFilters(newFilters);
  }, [selectedCategories, selectedPriceRange, searchQuery, categories]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(categoryId);
      
      if (isSelected) {
        // Deselect category
        return prev.filter(id => id !== categoryId);
      } else {
        // Select category (only allow one at a time)
        // If it's a parent category, also expand it
        if (isParentCategory(categoryId)) {
          setExpandedCategories(prevExpanded => 
            prevExpanded.includes(categoryId) 
              ? prevExpanded 
              : [...prevExpanded, categoryId]
          );
        }
        return [categoryId];
      }
    });
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange('');
    setSearchQuery('');
    setSort({ field: 'created_at', direction: 'desc' });
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case 'price-asc':
        setSort({ field: 'price', direction: 'asc' });
        break;
      case 'price-desc':
        setSort({ field: 'price', direction: 'desc' });
        break;
      case 'name-asc':
        setSort({ field: 'name', direction: 'asc' });
        break;
      case 'created_at-desc':
        setSort({ field: 'created_at', direction: 'desc' });
        break;
      default:
        setSort({ field: 'created_at', direction: 'desc' });
    }
  };

  return (
    <section className="bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
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
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block cursor-pointer text-xs font-medium text-gray-700 mb-1">
                  Zoradenie
                </label>
                <select
                  value={`${sort.field}-${sort.direction}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full py-2 px-2 cursor-pointer text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
                >
                  <option className="cursor-pointer" value="created_at-desc">Najnovšie</option>
                  <option className="cursor-pointer" value="price-asc">Cena ↑</option>
                  <option className="cursor-pointer" value="price-desc">Cena ↓</option>
                  <option className="cursor-pointer" value="name-asc">Názov</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cena
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full py-2 cursor-pointer px-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] focus:border-transparent"
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
                  {categoriesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EE4C7C] mx-auto"></div>
                    </div>
                  ) : (
                    categories.map(category => (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleCategory(category.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleCategory(category.id);
                              }
                            }}
                            className={`flex-1 p-2 rounded-lg border transition-all cursor-pointer duration-200 text-xs ${
                              selectedCategories.includes(category.id)
                                ? 'border-[#EE4C7C] bg-[#E3AFBC]/20 text-[#9A1750]'
                                : 'border-gray-200 hover:border-[#EE4C7C] hover:bg-[#E3AFBC]/10'
                            } text-left`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{category.name}</span>
                              {category.children && category.children.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategoryExpansion(category.id);
                                  }}
                                  className="text-gray-400 hover:text-[#EE4C7C] hover:bg-gray-100 rounded px-2 py-1 ml-2 min-w-[24px] h-6 flex items-center justify-center text-base font-bold transition-all duration-200"
                                >
                                  {expandedCategories.includes(category.id) ? '−' : '+'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {expandedCategories.includes(category.id) && category.children && (
                          <div className="ml-4 space-y-1">
                            {category.children.map(child => (
                              <button
                                key={child.id}
                                onClick={() => toggleCategory(child.id)}
                                className={`w-full p-2 rounded-lg border transition-all cursor-pointer duration-200 text-xs ${
                                  selectedCategories.includes(child.id)
                                    ? 'border-[#EE4C7C] bg-[#E3AFBC]/20 text-[#9A1750]'
                                    : 'border-gray-200 hover:border-[#EE4C7C] hover:bg-[#E3AFBC]/10'
                                }`}
                              >
                                <span className="font-medium">{child.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
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
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img
                      src={product.image_url || 'products.svg'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="text-xs text-[#EE4C7C] font-medium mb-2">
                      {product.category?.name || 'Bez kategórie'}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#EE4C7C] transition-colors">
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
            
            {!productsLoading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Žiadne produkty neboli nájdené</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#EE4C7C] hover:underline"
                >
                  Vymazať filtre
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
