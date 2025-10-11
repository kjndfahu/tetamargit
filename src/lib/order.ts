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

    // Generate unique order number
    const orderNumber = this.generateOrderNumber();
    
    try {
      // Send email to admin only
      await this.sendAdminEmail(orderData, orderNumber);
      
    } catch (error) {
      console.error('Error sending order email:', error);
      throw new Error('Nepodarilo sa odoslať objednávku. Skúste to znova.');
    }
  }

  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `TM-${timestamp.slice(-6)}${random}`;
  }

  private static async sendAdminEmail(orderData: OrderData, orderNumber: string): Promise<void> {
    const {
      cartSummary,
      deliveryMethod,
      paymentMethod,
      deliveryAddress,
      userEmail
    } = orderData;

    const deliveryFee = deliveryMethod === 'courier' ? 4.99 : 0;
    const total = cartSummary.subtotal + deliveryFee;
    const customerEmail = deliveryAddress.email || userEmail;

    // Format products list for email
    const productsList = cartSummary.items.map(item => ({
      name: item.product?.name || 'Neznámy produkt',
      quantity: item.quantity,
      price: item.price.toFixed(2),
      total: (item.price * item.quantity).toFixed(2)
    }));

    const templateParams = {
      // Order details
      order_number: orderNumber,
      order_date: new Date().toLocaleDateString('sk-SK'),
      
      // Customer information
      customer_name: deliveryAddress.fullName || 'Zákazník',
      customer_email: customerEmail,
      customer_phone: deliveryAddress.phone || '',
      
      // Products - formatted as HTML table
      products_html: this.formatProductsAsHTML(productsList),
      products_text: this.formatProductsAsText(productsList),
      
      // Pricing
      subtotal: cartSummary.subtotal.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      items_count: cartSummary.itemCount,
      
      // Delivery & Payment
      delivery_method: deliveryMethod === 'pickup' ? 'Osobný odber' : 'Doručenie kuriérom',
      payment_method: paymentMethod === 'card' ? 'Platba kartou' : 'Platba v hotovosti',
      
      // Address (only for courier)
      delivery_address: deliveryMethod === 'courier' ? 
        `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}` : 
        'Osobný odber v predajni',
      delivery_note: deliveryAddress.note || '',
      
      // Email routing - only to admin
      to_email: 'teta.margit.tech@gmail.com',
      from_name: 'Teta Márgit - Nová objednávka'
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_ORDER_TEMPLATE_ID || '',
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    );
  }

  private static formatProductsAsHTML(products: any[]): string {
    return `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #8B4513; color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Produkt</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Množstvo</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Cena/ks</th>
            <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Spolu</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">${product.name}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">${product.quantity}x</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${product.price}€</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${product.total}€</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private static formatProductsAsText(products: any[]): string {
    return products.map(product => 
      `• ${product.name} - ${product.quantity}x - ${product.price}€ = ${product.total}€`
    ).join('\n');
  }
}
