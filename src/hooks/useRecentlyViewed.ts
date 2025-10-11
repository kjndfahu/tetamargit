import { useState, useEffect } from 'react';
import { Product } from '@/lib/products';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        setRecentProducts(products);
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecentProduct = (product: Product) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let products: Product[] = stored ? JSON.parse(stored) : [];

      products = products.filter(p => p.id !== product.id);

      products.unshift(product);

      if (products.length > MAX_ITEMS) {
        products = products.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      setRecentProducts(products);
    } catch (error) {
      console.error('Error adding recently viewed product:', error);
    }
  };

  return {
    recentProducts,
    loading,
    addRecentProduct
  };
}
