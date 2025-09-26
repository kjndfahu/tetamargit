import { supabase } from '@/config/supabase';
import { ProductService, type Product } from '@/lib/products';

export interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
  price: number;
}

export class CartService {
  // Get session ID for anonymous users
  private static getSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }

  // Add item to cart
  static async addToCart(data: AddToCartData, userId?: string): Promise<CartItem> {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || userId;
    const sessionId = currentUserId ? null : this.getSessionId();

    // Check if item already exists in cart
    let query = supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', data.product_id);

    if (currentUserId) {
      query = query.eq('user_id', currentUserId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: existingItems, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (existingItems && existingItems.length > 0) {
      // Update existing item
      const existingItem = existingItems[0];
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + data.quantity,
          price: data.price, // Update price in case it changed
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return updatedItem;
    } else {
      // Insert new item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: currentUserId,
          session_id: sessionId,
          product_id: data.product_id,
          quantity: data.quantity,
          price: data.price
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return newItem;
    }
  }

  // Get cart items
  static async getCartItems(userId?: string): Promise<CartItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || userId;
    const sessionId = currentUserId ? null : this.getSessionId();

    let query = supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (currentUserId) {
      query = query.eq('user_id', currentUserId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Add image URLs to products
    const itemsWithImages = data?.map(item => ({
      ...item,
      product: item.product ? {
        ...item.product,
        image_url: item.product.image_path 
          ? supabase.storage.from('Products').getPublicUrl(item.product.image_path).data.publicUrl
          : null
      } : null
    })) || [];

    return itemsWithImages;
  }

  // Update cart item quantity
  static async updateCartItem(itemId: string, quantity: number): Promise<CartItem | null> {
    if (quantity <= 0) {
      await this.removeCartItem(itemId);
      return null;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // Remove item from cart
  static async removeCartItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }
  }

  // Clear entire cart
  static async clearCart(userId?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || userId;
    const sessionId = currentUserId ? null : this.getSessionId();

    let query = supabase.from('cart_items').delete();

    if (currentUserId) {
      query = query.eq('user_id', currentUserId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }
  }

  // Get cart summary
  static async getCartSummary(userId?: string): Promise<CartSummary> {
    const items = await this.getCartItems(userId);
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      items,
      subtotal,
      total: subtotal, // Can add taxes, shipping, etc. here
      itemCount
    };
  }

  // Merge anonymous cart with user cart on login
  static async mergeAnonymousCart(userId: string): Promise<void> {
    const sessionId = this.getSessionId();
    
    // Get anonymous cart items
    const { data: anonymousItems, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('session_id', sessionId);

    if (fetchError || !anonymousItems || anonymousItems.length === 0) {
      return;
    }

    // Get existing user cart items
    const { data: userItems, error: userFetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    if (userFetchError) {
      throw userFetchError;
    }

    // Merge items
    for (const anonymousItem of anonymousItems) {
      const existingUserItem = userItems?.find(item => item.product_id === anonymousItem.product_id);
      
      if (existingUserItem) {
        // Update existing user item quantity
        await supabase
          .from('cart_items')
          .update({
            quantity: existingUserItem.quantity + anonymousItem.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUserItem.id);
      } else {
        // Create new user item
        await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: anonymousItem.product_id,
            quantity: anonymousItem.quantity,
            price: anonymousItem.price
          });
      }
    }

    // Delete anonymous cart items
    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    // Clear session ID
    localStorage.removeItem('cart_session_id');
  }

  // Check product availability before adding to cart
  static async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    return ProductService.checkProductAvailability(productId, quantity);
  }

  // Get cart item count (for header badge)
  static async getCartItemCount(userId?: string): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || userId;
    const sessionId = currentUserId ? null : this.getSessionId();

    let query = supabase
      .from('cart_items')
      .select('quantity');

    if (currentUserId) {
      query = query.eq('user_id', currentUserId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      return 0;
    }

    return data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}