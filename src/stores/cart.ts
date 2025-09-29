import { create } from 'zustand';
import { CartService, type AddToCartData } from '@/lib/cart';

type CartState = {
  lastError: string | null;
  isAdding: boolean;
  itemCount: number;
  addToCart: (data: AddToCartData, userId?: string) => Promise<void>;
  incrementItemCount: () => void;
  setItemCount: (count: number) => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  lastError: null,
  isAdding: false,
  itemCount: 0,
  addToCart: async (data: AddToCartData, userId?: string) => {
    try {
      set({ isAdding: true, lastError: null });
      const isAvailable = await CartService.checkProductAvailability(data.product_id, data.quantity);
      if (!isAvailable) {
        throw new Error('Produkt nie je dostupný v požadovanom množstve');
      }
      await CartService.addToCart(data, userId);
      // Увеличиваем счетчик товаров в корзине
      set(state => ({ itemCount: state.itemCount + data.quantity }));
    } catch (err: any) {
      set({ lastError: err?.message || 'Nepodarilo sa pridať produkt do košíka' });
      throw err;
    } finally {
      set({ isAdding: false });
    }
  },
  incrementItemCount: () => {
    set(state => ({ itemCount: state.itemCount + 1 }));
  },
  setItemCount: (count: number) => {
    set({ itemCount: count });
  }
}));


