'use client';

import { useCallback } from 'react';
import { Truck, Store, MapPin, Clock, Phone } from 'lucide-react';
import { DELIVERY_OPTIONS, STORE_INFO, DELIVERY_INFO } from '@/constants/delivery';
import { DeliveryOption, DeliveryType } from '@/types/delivery';
import { PRICING } from '@/constants/pricing';

interface DeliveryOptionsProps {
  selectedOption: DeliveryType;
  onOptionChange: (option: DeliveryType) => void;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: DELIVERY_OPTIONS.PICKUP.id,
    title: DELIVERY_OPTIONS.PICKUP.title,
    description: DELIVERY_OPTIONS.PICKUP.description,
    icon: Store,
    price: DELIVERY_OPTIONS.PICKUP.price,
    time: DELIVERY_OPTIONS.PICKUP.time
  },
  {
    id: DELIVERY_OPTIONS.DELIVERY.id,
    title: DELIVERY_OPTIONS.DELIVERY.title,
    description: DELIVERY_OPTIONS.DELIVERY.description,
    icon: Truck,
    price: PRICING.DELIVERY_COST,
    time: DELIVERY_OPTIONS.DELIVERY.time
  }
];

export function DeliveryOptions({ selectedOption, onOptionChange }: DeliveryOptionsProps) {

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Spôsob doručenia</h2>
      
      <div className="space-y-4 mb-6">
        {deliveryOptions.map((option) => (
          <div
            key={option.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedOption === option.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-300'
            }`}
            onClick={() => onOptionChange(option.id)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                selectedOption === option.id ? 'bg-orange-500' : 'bg-gray-100'
              }`}>
                <option.icon className={`w-6 h-6 ${
                  selectedOption === option.id ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{option.title}</h3>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {option.price === 0 ? 'Zadarmo' : `${option.price}€`}
                    </div>
                    <div className="text-sm text-gray-500">{option.time}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOption === 'pickup' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Store className="w-5 h-5 mr-2 text-orange-500" />
            Informácie o predajni
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
                         <div className="flex items-center">
               <MapPin className="w-4 h-4 mr-2 text-gray-400" />
               <span>{STORE_INFO.address}</span>
             </div>
             <div className="flex items-center">
               <Clock className="w-4 h-4 mr-2 text-gray-400" />
               <span>{STORE_INFO.workingHours}</span>
             </div>
             <div className="flex items-center">
               <Phone className="w-4 h-4 mr-2 text-gray-400" />
               <span>{STORE_INFO.phone}</span>
             </div>
          </div>
        </div>
      )}

      {selectedOption === 'delivery' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-orange-500" />
            Informácie o doručení
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
                         <div className="flex items-center">
               <Clock className="w-4 h-4 mr-2 text-gray-400" />
               <span>Doručenie v čase {DELIVERY_INFO.timeRange}</span>
             </div>
             <div className="flex items-center">
               <MapPin className="w-4 h-4 mr-2 text-gray-400" />
               <span>Doručujeme v rámci {DELIVERY_INFO.area}</span>
             </div>
             <div className="flex items-center">
               <Phone className="w-4 h-4 mr-2 text-gray-400" />
               <span>{DELIVERY_INFO.contactNote}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
