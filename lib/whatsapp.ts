import twilio from 'twilio';

/**
 * Outbound WhatsApp notifications only — used for opt-in order updates.
 * (Inbound handling lives separately in app/api/whatsapp/route.ts.)
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!sid || !token || !from) throw new Error('Twilio env vars missing');

  const digits = to.replace(/[^0-9+]/g, '');
  const client = twilio(sid, token);

  await client.messages.create({
    from,
    to: `whatsapp:${digits}`,
    body,
  });
  return true;
}
