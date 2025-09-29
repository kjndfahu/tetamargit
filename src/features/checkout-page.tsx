'use client';

import { useState, useCallback, useMemo } from 'react';
import { CartSummary } from './cart-summary';
import { DeliveryOptions } from './delivery-options';
import { ContactForm } from './contact-form';
import { OrderSummary } from './order-summary';
import { DeliveryType } from '@/types/delivery';
import { PRICING } from '@/constants/pricing';

export function CheckoutPage() {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [subtotal, setSubtotal] = useState(10.90);

  const deliveryCost = useMemo(() => 
    deliveryType === 'pickup' ? 0 : PRICING.DELIVERY_COST, 
    [deliveryType]
  );

  const handleDeliveryTypeChange = useCallback((type: DeliveryType) => {
    setDeliveryType(type);
    setDeliveryDate('');
    setDeliveryTime('');
  }, []);

  const handleDateTimeChange = useCallback((date: string, time: string) => {
    setDeliveryDate(date);
    setDeliveryTime(time);
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dokončenie objednávky
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vyplňte potrebné údaje a potvrďte svoju objednávku
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DeliveryOptions 
              selectedOption={deliveryType}
              onOptionChange={handleDeliveryTypeChange}
            />

            <ContactForm 
              deliveryType={deliveryType}
              onDateTimeChange={handleDateTimeChange}
            />
          </div>

          <div className="space-y-8">
            <CartSummary onSubtotalChange={setSubtotal} />

            <OrderSummary
              subtotal={subtotal}
              deliveryCost={deliveryCost}
              deliveryType={deliveryType}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
