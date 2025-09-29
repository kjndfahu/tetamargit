'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Modal } from './ui/modal';
import { DeliveryType } from '@/types/delivery';
import { formatCountdown } from '@/utils/localization';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryTime: string;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  deliveryType,
  deliveryDate,
  deliveryTime
}: OrderSuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Обратный отсчёт и автоматическое перенаправление
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, router]);

  // Сброс счётчика при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
    }
  }, [isOpen]);

  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      size="md"
      className="text-center"
    >
      <div className="space-y-6">
        {/* Иконка успеха */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* Заголовок */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Objednávka bola úspešne odoslaná!
          </h2>
          <p className="text-gray-600">
            Ďakujeme za vašu objednávku. Potvrdenie sme odoslali na váš email.
          </p>
        </div>

        {/* Детали заказа */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <p>
            <strong>Číslo objednávky:</strong> #{orderNumber}
          </p>
          <p>
            <strong>Spôsob doručenia:</strong>{' '}
            {deliveryType === 'pickup' ? 'Samovyzdvihnutie' : 'Doručenie domov'}
          </p>
          <p>
            <strong>Dátum:</strong> {deliveryDate}
          </p>
          <p>
            <strong>Čas:</strong> {deliveryTime}
          </p>
        </div>

        {/* Счётчик до перенаправления */}
        <div className="text-sm text-gray-500">
          <p>
            Presmerovanie na hlavnú stránku za{' '}
            <span className="font-bold text-orange-500">{countdown}</span>{' '}
            {formatCountdown(countdown)}...
          </p>
        </div>

        {/* Кнопка ручного перенаправления */}
        <button
          onClick={() => router.push('/')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          type="button"
        >
          Prejsť na hlavnú stránku
        </button>
      </div>
    </Modal>
  );
}
