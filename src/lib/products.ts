export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  category_id: string;
  image_url?: string;
  image_path?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number;
  unit: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  image_path?: string;
  parent_id?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
  parent?: Category;
}

export interface ProductFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
}

export interface ProductSort {
  field: 'name' | 'price' | 'created_at' | 'popularity';
  direction: 'asc' | 'desc';
}

import { supabase } from '@/config/supabase';

export class ProductService {
  // Get all products with optional filtering and sorting
  static async getProducts(
    filters?: ProductFilters,
    sort?: ProductSort,
    limit?: number,
    offset?: number
  ): Promise<{ products: Product[]; total: number }> {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }

    if (filters?.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.inStock) {
      query = query.gt('stock_quantity', 0);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Add image URLs from storage
    const productsWithImages = data?.map(product => ({
      ...product,
      image_url: product.image_path 
        ? supabase.storage.from('Products').getPublicUrl(product.image_path).data.publicUrl
        : null
    })) || [];

    return {
      products: productsWithImages,
      total: count || 0
    };
  }

  // Get single product by ID
  static async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Product not found
      }
      throw error;
    }

    // Add image URL from storage
    const productWithImage = {
      ...data,
      image_url: data.image_path 
        ? supabase.storage.from('Products').getPublicUrl(data.image_path).data.publicUrl
        : null
    };

    return productWithImage;
  }

  // Get featured products
  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const { products } = await this.getProducts(
      { featured: true, inStock: true },
      { field: 'created_at', direction: 'desc' },
      limit
    );

    return products;
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string, limit?: number): Promise<Product[]> {
    const { products } = await this.getProducts(
      { category: categoryId, inStock: true },
      { field: 'name', direction: 'asc' },
      limit
    );

    return products;
  }

  // Search products
  static async searchProducts(query: string, limit = 20): Promise<Product[]> {
    const { products } = await this.getProducts(
      { search: query, inStock: true },
      { field: 'name', direction: 'asc' },
      limit
    );

    return products;
  }

  // Get all categories
  static async getCategories(includeChildren = true): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        parent:categories!parent_id(*),
        children:categories!parent_id(*)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    // Add image URLs from storage
    const categoriesWithImages = data?.map(category => ({
      ...category,
      image_url: category.image_path 
        ? supabase.storage.from('Categories').getPublicUrl(category.image_path).data.publicUrl
        : null,
      children: category.children?.map((child: any) => ({
        ...child,
        image_url: child.image_path 
          ? supabase.storage.from('Categories').getPublicUrl(child.image_path).data.publicUrl
          : null
      })) || []
    })) || [];

    if (includeChildren) {
      // Return only parent categories with their children
      return categoriesWithImages.filter(cat => !cat.parent_id);
    }
    
    return categoriesWithImages;
  }

  // Get parent categories only
  static async getParentCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    const categoriesWithImages = data?.map(category => ({
      ...category,
      image_url: category.image_path 
        ? supabase.storage.from('Categories').getPublicUrl(category.image_path).data.publicUrl
        : null
    })) || [];

    return categoriesWithImages;
  }

  // Get child categories by parent ID
  static async getChildCategories(parentId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .eq('parent_id', parentId)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    const categoriesWithImages = data?.map(category => ({
      ...category,
      image_url: category.image_path 
        ? supabase.storage.from('Categories').getPublicUrl(category.image_path).data.publicUrl
        : null
    })) || [];

    return categoriesWithImages;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Category not found
      }
      throw error;
    }

    // Add image URL from storage
    const categoryWithImage = {
      ...data,
      image_url: data.image_path 
        ? supabase.storage.from('Categories').getPublicUrl(data.image_path).data.publicUrl
        : null
    };

    return categoryWithImage;
  }

  // Update product stock (for cart operations)
  static async updateProductStock(productId: string, quantity: number): Promise<void> {
    const { error } = await supabase.rpc('update_product_stock', {
      product_id: productId,
      quantity_change: -quantity
    });

    if (error) {
      throw error;
    }
  }

  // Check product availability
  static async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return false;
    }

    return data.stock_quantity >= quantity;
  }
}