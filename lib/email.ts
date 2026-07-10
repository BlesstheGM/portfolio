import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY env var missing');
  client = new Resend(key);
  return client;
}

const FROM = process.env.RESEND_FROM || 'Shop Agent <onboarding@resend.dev>';

type OrderDetails = {
  orderId: string;
  productTitle: string;
  price: number | null;
  currency: string | null;
  quantity: number;
};

/** Sent to the customer — always attempted, this is the guaranteed-delivery channel. */
export async function sendOrderConfirmationEmail(to: string, order: OrderDetails): Promise<void> {
  await getClient().emails.send({
    from: FROM,
    to,
    subject: `Order confirmed — ${order.orderId}`,
    html: `
      <p>Your demo order is confirmed!</p>
      <p><strong>${order.productTitle}</strong><br/>
      ${order.quantity} x ${order.currency ?? ''} ${order.price ?? 'N/A'}</p>
      <p>Order ID: <strong>${order.orderId}</strong><br/>
      Status: processing · ETA 3-5 business days</p>
      <p style="color:#64748b;font-size:13px;">This is a demo storefront — no real payment was taken.</p>
    `,
  });
}

/**
 * Sent only to the site owner — the customer never sees this and it's never
 * mentioned in the chat. Best-effort: failures here must never block an order.
 */
export async function notifyAdminOfNewOrder(order: OrderDetails & { customerEmail: string; whatsappNumber?: string | null }): Promise<void> {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return;

  await getClient().emails.send({
    from: FROM,
    to: admin,
    subject: `New demo order — ${order.orderId}`,
    html: `
      <p>New order placed on shop.agent.</p>
      <p><strong>${order.productTitle}</strong><br/>
      ${order.quantity} x ${order.currency ?? ''} ${order.price ?? 'N/A'}</p>
      <p>Order ID: ${order.orderId}<br/>
      Customer email: ${order.customerEmail}<br/>
      WhatsApp: ${order.whatsappNumber || '(not provided)'}</p>
    `,
  });
}
