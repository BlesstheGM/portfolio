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

/**
 * Personalized sender: a customer named "Thabo" gets their confirmation from
 * thabo@blessinghlongwane.xyz. Falls back to the default FROM when there's no
 * name (or no custom domain to build on).
 */
function buildFrom(customerName?: string | null): string {
  const domainMatch = FROM.match(/@([^>\s]+)/);
  if (!customerName || !domainMatch) return FROM;

  const local = customerName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .trim()
    .split(/\s+/)[0] // first name only
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

  if (!local) return FROM;
  return `Shop Agent <${local}@${domainMatch[1]}>`;
}

type OrderDetails = {
  orderId: string;
  productTitle: string;
  price: number | null;
  currency: string | null;
  quantity: number;
};

/** Sent to the customer — always attempted, this is the guaranteed-delivery channel. */
export async function sendOrderConfirmationEmail(
  to: string,
  order: OrderDetails,
  customerName?: string | null,
): Promise<void> {
  // Resend's SDK returns { data, error } instead of throwing — check it,
  // otherwise a rejected send (e.g. unverified domain) looks like success.
  const { error } = await getClient().emails.send({
    from: buildFrom(customerName),
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
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Sent only to the site owner — the customer never sees this and it's never
 * mentioned in the chat. Best-effort: failures here must never block an order.
 */
export async function notifyAdminOfNewOrder(order: OrderDetails & { customerEmail: string; whatsappNumber?: string | null }): Promise<void> {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return;

  const { error } = await getClient().emails.send({
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
  if (error) throw new Error(`Resend: ${error.message}`);
}
