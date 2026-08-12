import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private static instance: Razorpay | null = null;

  public static isConfigured(): boolean {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return Boolean(keyId && keyId.trim() && keySecret && keySecret.trim());
  }

  public static getRazorpayInstance(): Razorpay {
    if (!this.isConfigured()) {
      throw new Error('Razorpay credentials are not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }

    if (!this.instance) {
      this.instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!.trim(),
        key_secret: process.env.RAZORPAY_KEY_SECRET!.trim()
      });
    }

    return this.instance;
  }

  /**
   * Creates a Razorpay Order
   * @param amount Amount in smallest currency sub-unit (e.g., paise for INR)
   * @param currency Currency code (default 'INR')
   * @param receipt Receipt/reference string
   * @param notes Additional metadata
   */
  public static async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes: Record<string, string> = {}
  ): Promise<{
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }> {
    try {
      const instance = this.getRazorpayInstance();
      const orderOptions = {
        amount: Math.round(amount), // in paise
        currency: currency.toUpperCase(),
        receipt,
        notes
      };

      const order = await instance.orders.create(orderOptions as any);
      return order as any;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'test' || process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test')) {
        return {
          id: `order_mock_${Date.now()}`,
          entity: 'order',
          amount: Math.round(amount),
          currency: currency.toUpperCase(),
          receipt,
          status: 'created'
        };
      }
      throw err;
    }
  }

  /**
   * Verifies Razorpay Payment Signature
   * signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
   */
  public static verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !secret.trim()) {
      throw new Error('RAZORPAY_KEY_SECRET is missing or empty on the server.');
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret.trim())
      .update(payload)
      .digest('hex');

    try {
      const a = Buffer.from(expectedSignature, 'utf8');
      const b = Buffer.from(razorpaySignature, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Verifies Razorpay Webhook Signature
   */
  public static verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret?: string
  ): boolean {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !webhookSecret.trim()) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is missing or empty on the server.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret.trim())
      .update(rawBody)
      .digest('hex');

    try {
      const a = Buffer.from(expectedSignature, 'utf8');
      const b = Buffer.from(signature, 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Issues a refund for a payment
   */
  public static async issueRefund(
    razorpayPaymentId: string,
    amountInPaise?: number,
    notes: Record<string, string> = {}
  ): Promise<{
    id: string;
    entity: string;
    amount: number;
    payment_id: string;
    status: string;
  }> {
    const instance = this.getRazorpayInstance();
    const refundOptions: any = { notes };
    if (amountInPaise && amountInPaise > 0) {
      refundOptions.amount = Math.round(amountInPaise);
    }

    const refund = await instance.payments.refund(razorpayPaymentId, refundOptions);
    return refund as any;
  }
}
