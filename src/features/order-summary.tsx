'use client';

import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { OrderSuccessModal } from '@/components/order-success-modal';
import { DeliveryType } from '@/types/delivery';
import { formatPrice } from '@/utils/currency';
import { asyncWithErrorHandling, logError } from '@/utils/error';

interface OrderSummaryProps {
  subtotal: number;
  deliveryCost: number;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTime: string;
}

export function OrderSummary({ subtotal, deliveryCost, deliveryType, deliveryDate, deliveryTime }: OrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const total = subtotal + deliveryCost;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Имитация отправки заказа
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);
      setIsCompleted(true);
    } catch (error) {
      logError(error, 'handlePlaceOrder');
      setIsProcessing(false);
      // Здесь можно добавить отображение ошибки пользователю
    }
  };

  const handleCloseModal = () => {
    setIsCompleted(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Súhrn objednávky</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Medzisúčet:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>
            {deliveryType === 'pickup' ? 'Samovyzdvihnutie' : 'Doručenie domov'}:
          </span>
          <span>{deliveryCost === 0 ? 'Zadarmo' : formatPrice(deliveryCost)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Celková suma:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Detaily doručenia</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Spôsob:</strong> {deliveryType === 'pickup' ? 'Samovyzdvihnutie v predajni' : 'Doručenie na adresu'}</p>
          <p><strong>Dátum:</strong> {deliveryDate}</p>
          <p><strong>Čas:</strong> {deliveryTime}</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Bezpečné platobné údaje</p>
            <p>Všetky vaše údaje sú chránené a bezpečné. Platba sa uskutoční až po potvrdení objednávky.</p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={isProcessing}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Spracovávam objednávku...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center cursor-pointer space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Potvrdiť objednávku</span>
          </div>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Kliknutím na tlačidlo "Potvrdiť objednávku" súhlasíte s našimi podmienkami a spracovaním vašich údajov.
      </p>
    </div>

    // {/* Модальное окно успешного заказа */}
    // <OrderSuccessModal
    //   isOpen={isCompleted}
    //   onClose={handleCloseModal}
    //   deliveryType={deliveryType}
    //   deliveryDate={deliveryDate}
    //   deliveryTime={deliveryTime}
    // />
  );
}
