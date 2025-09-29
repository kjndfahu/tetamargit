export type DeliveryType = 'pickup' | 'delivery';

export interface DeliveryOption {
  id: DeliveryType;
  title: string;
  description: string;
  icon: any;
  price: number;
  time: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  notes: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  category: string;
}

