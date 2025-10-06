'use client';

import { useState, useCallback, useMemo } from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { TIME_SLOTS } from '@/constants/delivery';
import { ContactFormData, DeliveryType } from '@/types/delivery';
import { getToday, getTomorrow } from '@/utils/date';

interface ContactFormProps {
  deliveryType: DeliveryType;
  onDateTimeChange: (date: string, time: string) => void;
}

export function ContactForm({ deliveryType, onDateTimeChange }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    pickupDate: '',
    pickupTime: '',
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  });

  const handleInputChange = useCallback((field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const today = useMemo(() => getToday(), []);
  const tomorrow = useMemo(() => getTomorrow(), []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktné údaje</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meno *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Vaše meno"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priezvisko *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Vaše priezvisko"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="vas@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefón *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="+421 123 456 789"
            />
          </div>
        </div>
      </div>

      {deliveryType === 'delivery' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
            Adresa doručenia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ulica a číslo *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Hlavná 123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesto *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Bratislava"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PSČ *
              </label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-orange-500" />
          {deliveryType === 'pickup' ? 'Čas vyzdvihnutia' : 'Čas doručenia'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dátum *
            </label>
            <input
              type="date"
              required
              min={deliveryType === 'pickup' ? today : tomorrow}
              value={deliveryType === 'pickup' ? formData.pickupDate : formData.deliveryDate}
              onChange={(e) => {
                const date = e.target.value;
                if (deliveryType === 'pickup') {
                  handleInputChange('pickupDate', date);
                } else {
                  handleInputChange('deliveryDate', date);
                }
                // Уведомляем родительский компонент об изменении даты
                const time = deliveryType === 'pickup' ? formData.pickupTime : formData.deliveryTime;
                onDateTimeChange(date, time);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Čas *
            </label>
            <select
              required
              value={deliveryType === 'pickup' ? formData.pickupTime : formData.deliveryTime}
              onChange={(e) => {
                const time = e.target.value;
                if (deliveryType === 'pickup') {
                  handleInputChange('pickupTime', time);
                } else {
                  handleInputChange('deliveryTime', time);
                }
                // Уведомляем родительский компонент об изменении времени
                const date = deliveryType === 'pickup' ? formData.pickupDate : formData.deliveryDate;
                onDateTimeChange(date, time);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Vyberte čas</option>
              {deliveryType === 'pickup' ? (
                <>
                  {TIME_SLOTS.PICKUP.map((slot, index) => (
                    <option key={index} value={slot.split(' - ')[0]}>
                      {slot}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  {TIME_SLOTS.DELIVERY.map((slot, index) => (
                    <option key={index} value={slot.split(' - ')[0]}>
                      {slot}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poznámky k objednávke
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Špeciálne požiadavky, pokyny pre kuriera..."
        />
      </div>
    </div>
  );
}
