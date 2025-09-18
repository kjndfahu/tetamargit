import { useState, useEffect } from 'react';
import { ProductService, type Product, type Category, type ProductFilters, type ProductSort } from '@/lib/products';

export function useProducts(
  filters?: ProductFilters,
  sort?: ProductSort,
  limit?: number,
  includeSubcategories?: boolean
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If we have a category filter and includeSubcategories is true, use the special method
      if (filters?.category && includeSubcategories) {
        const products = await ProductService.getProductsByCategory(
          filters.category, 
          limit, 
          true
        );
        setProducts(products);
        setTotal(products.length);
      } else {
        const result = await ProductService.getProducts(filters, sort, limit);
        setProducts(result.products);
        setTotal(result.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Nepodarilo sa načítať produkty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, sort, limit, includeSubcategories]);

  return {
    products,
    total,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ProductService.getProduct(id);
        setProduct(result);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Nepodarilo sa načítať produkt');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allCategories, parents] = await Promise.all([
          ProductService.getCategories(true),
          ProductService.getParentCategories()
        ]);
        
        setCategories(allCategories);
        setParentCategories(parents);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Nepodarilo sa načítať kategórie');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    parentCategories,
    loading,
    error
  };
}

export function useFeaturedProducts(limit = 6) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ProductService.getFeaturedProducts(limit);
        setProducts(result);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Nepodarilo sa načítať odporúčané produkty');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]);

  return {
    products,
    loading,
    error
  };
}