'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types/delivery';
import { calculateSubtotal, calculateDiscount, formatPrice } from '@/utils/currency';

const sampleCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Čerstvé paradajky',
    price: 2.50,
    oldPrice: 3.20,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    quantity: 2,
    category: 'Zelenina'
  },
  {
    id: 2,
    name: 'Domáce jogurty',
    price: 1.80,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    quantity: 3,
    category: 'Mliečne'
  },
  {
    id: 3,
    name: 'Čerstvý chlieb',
    price: 2.20,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    quantity: 1,
    category: 'Pečivo'
  }
];

interface CartSummaryProps {
  onSubtotalChange?: (subtotal: number) => void;
}

export function CartSummary({ onSubtotalChange }: CartSummaryProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(sampleCartItems);

  const updateQuantity = useCallback((id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  }, []);

  const subtotal = useMemo(() => calculateSubtotal(cartItems), [cartItems]);
  const discount = useMemo(() => calculateDiscount(cartItems), [cartItems]);

  // Уведомляем родительский компонент об изменении суммы
  useEffect(() => {
    onSubtotalChange?.(subtotal);
  }, [subtotal, onSubtotalChange]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vaša objednávka</h2>
      
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <div className="flex items-center space-x-2 mt-2">
                {item.oldPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {item.oldPrice}€
                  </span>
                )}
                <span className="font-semibold text-gray-900">
                  {item.price}€
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

                          <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Medzisúčet:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Zľava:</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Celková suma:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
