import { getSupabaseAdmin } from './supabase';

export type ChatRole = 'user' | 'assistant';
export type Channel = 'web' | 'whatsapp';

type ConversationRow = { role: ChatRole; content: string; created_at: string };

export async function getHistory(channel: Channel, externalId: string, limit = 20): Promise<ConversationRow[]> {
  // Fetch the MOST RECENT messages (descending + limit), then flip back to
  // chronological order. Ascending + limit would return the oldest 20 forever,
  // silently dropping the current message once a session outgrows the window.
  const { data, error } = await getSupabaseAdmin()
    .from('conversations')
    .select('*')
    .eq('channel', channel)
    .eq('external_id', externalId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as ConversationRow[]).reverse();
}

export async function saveMessage(channel: Channel, externalId: string, role: ChatRole, content: string) {
  const { error } = await getSupabaseAdmin()
    .from('conversations')
    .insert({ channel, external_id: externalId, role, content });
  if (error) throw error;
}

function newShortId() {
  return `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function createOrder(input: {
  customerName?: string;
  customerEmail: string;
  productTitle: string;
  price: number | null;
  currency: string | null;
  quantity?: number;
  productUrl?: string | null;
  whatsappNumber?: string | null;
}) {
  const shortId = newShortId();
  const { error } = await getSupabaseAdmin()
    .from('orders')
    .insert({
      short_id: shortId,
      customer_name: input.customerName ?? null,
      customer_email: input.customerEmail,
      product_title: input.productTitle,
      price: input.price,
      currency: input.currency ?? 'ZAR',
      quantity: input.quantity ?? 1,
      product_url: input.productUrl ?? null,
      whatsapp_number: input.whatsappNumber ?? null,
      status: 'processing',
      eta: '3-5 business days',
    });
  if (error) throw error;
  return shortId;
}

export type Order = {
  short_id: string;
  customer_name: string | null;
  customer_email: string | null;
  product_title: string;
  price: number | null;
  currency: string | null;
  quantity: number;
  product_url: string | null;
  status: string;
  eta: string | null;
  created_at: string;
};

export async function getOrderByShortId(shortId: string): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('orders')
    .select('*')
    .ilike('short_id', shortId.trim())
    .maybeSingle();
  if (error) throw error;
  return data as Order | null;
}
