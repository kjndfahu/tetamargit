import emailjs from '@emailjs/browser';
import { CartSummary } from '@/lib/cart';
import { DeliveryAddress } from '@/features/cart/delivery-section';

export interface OrderData {
  cartSummary: CartSummary;
  deliveryMethod: 'pickup' | 'courier';
  paymentMethod: 'card' | 'cash';
  deliveryAddress: DeliveryAddress;
  userEmail: string;
}

export class OrderService {
  static async sendOrderEmails(orderData: OrderData): Promise<void> {
    const {
      cartSummary,
      deliveryMethod,
      paymentMethod,
      deliveryAddress,
      userEmail
    } = orderData;

    // Prepare order details
    const orderDetails = this.formatOrderDetails(orderData);
    
    try {
      // Send email to service (admin)
      await this.sendServiceEmail(orderDetails);
      
      // Send confirmation email to client
      await this.sendClientEmail(orderDetails, deliveryAddress.email || userEmail);
      
    } catch (error) {
      console.error('Error sending order emails:', error);
      throw new Error('Nepodarilo sa odoslať objednávku. Skúste to znova.');
    }
  }

  private static formatOrderDetails(orderData: OrderData): string {
    const {
      cartSummary,
      deliveryMethod,
      paymentMethod,
      deliveryAddress
    } = orderData;

    const deliveryFee = deliveryMethod === 'courier' ? 4.99 : 0;
    const total = cartSummary.subtotal + deliveryFee;

    let details = `
=== NOVÁ OBJEDNÁVKA ===

PRODUKTY:
${cartSummary.items.map(item => 
  `• ${item.product?.name || 'Neznámy produkt'} - ${item.quantity}x - ${item.price.toFixed(2)}€ = ${(item.price * item.quantity).toFixed(2)}€`
).join('\n')}

SÚHRN:
• Produkty: ${cartSummary.subtotal.toFixed(2)}€
• Doručenie: ${deliveryFee.toFixed(2)}€
• CELKOM: ${total.toFixed(2)}€

SPÔSOB DORUČENIA: ${deliveryMethod === 'pickup' ? 'Osobný odber' : 'Doručenie kuriérom'}
SPÔSOB PLATBY: ${paymentMethod === 'card' ? 'Kartou' : 'V hotovosti'}
`;

    if (deliveryMethod === 'courier') {
      details += `
ADRESA DORUČENIA:
• Meno: ${deliveryAddress.fullName}
• Telefón: ${deliveryAddress.phone}
• Email: ${deliveryAddress.email}
• Adresa: ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}
${deliveryAddress.note ? `• Poznámka: ${deliveryAddress.note}` : ''}
`;
    } else {
      details += `
KONTAKTNÉ ÚDAJE:
• Email: ${deliveryAddress.email}
`;
    }

    return details;
  }

  private static async sendServiceEmail(orderDetails: string): Promise<void> {
    const templateParams = {
      to_email: 'teta.margit.tech@gmail.com',
      subject: 'Nová objednávka - Teta Márgit',
      message: orderDetails,
      from_name: 'Teta Márgit - Objednávkový systém'
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    );
  }

  private static async sendClientEmail(orderDetails: string, clientEmail: string): Promise<void> {
    const clientMessage = `Ďakujeme za vašu objednávku!

${orderDetails}

Vaša objednávka bola úspešne prijatá a bude spracovaná v najkratšom možnom čase.

S pozdravom,
Tím Teta Márgit
`;

    const templateParams = {
      to_email: clientEmail,
      subject: 'Potvrdenie objednávky - Teta Márgit',
      message: clientMessage,
      from_name: 'Teta Márgit'
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    );
  }
}