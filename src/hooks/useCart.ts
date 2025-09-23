import { useState, useEffect } from 'react';
import { CartService, type CartItem, type CartSummary, type AddToCartData } from '@/lib/cart';
import { useAuth } from '@/hooks/useAuth';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const summary = await CartService.getCartSummary(user?.id);
      setCartSummary(summary);
      setCartItems(summary.items);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Nepodarilo sa načítať košík');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.id]);

  // Merge anonymous cart when user logs in
  useEffect(() => {
    const mergeCart = async () => {
      if (user?.id) {
        try {
          await CartService.mergeAnonymousCart(user.id);
          await fetchCart(); // Refresh cart after merge
        } catch (err) {
          console.error('Error merging cart:', err);
        }
      }
    };

    mergeCart();
  }, [user?.id]);

  const addToCart = async (data: AddToCartData) => {
    try {
      setError(null);
      
      // Check product availability
      const isAvailable = await CartService.checkProductAvailability(data.product_id, data.quantity);
      if (!isAvailable) {
        throw new Error('Produkt nie je dostupný v požadovanom množstve');
      }

      await CartService.addToCart(data, user?.id);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Nepodarilo sa pridať produkt do košíka');
      throw err;
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setError(null);
      
      if (quantity > 0) {
        // Check availability for the new quantity
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
          const isAvailable = await CartService.checkProductAvailability(item.product_id, quantity);
          if (!isAvailable) {
            throw new Error('Produkt nie je dostupný v požadovanom množstve');
          }
        }
      }

      await CartService.updateCartItem(itemId, quantity);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.message || 'Nepodarilo sa aktualizovať košík');
      throw err;
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      setError(null);
      await CartService.removeCartItem(itemId);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Error removing cart item:', err);
      setError(err.message || 'Nepodarilo sa odstrániť produkt z košíka');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await CartService.clearCart(user?.id);
      await fetchCart(); // Refresh cart
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Nepodarilo sa vyprázdniť košík');
      throw err;
    }
  };

  const getCartItemCount = async (): Promise<number> => {
    try {
      return await CartService.getCartItemCount(user?.id);
    } catch (err) {
      console.error('Error getting cart item count:', err);
      return 0;
    }
  };

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartItemCount,
    refetch: fetchCart
  };
}

export function useCartItemCount() {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItemCount = async () => {
    try {
      setLoading(true);
      const count = await CartService.getCartItemCount(user?.id);
      setItemCount(count);
    } catch (err) {
      console.error('Error fetching cart item count:', err);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemCount();
  }, [user?.id]);

  // Set up interval to refresh cart count periodically
  useEffect(() => {
    const interval = setInterval(fetchItemCount, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user?.id]);
  return {
    itemCount,
    loading,
    refetch: fetchItemCount
  };
}