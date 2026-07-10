/**
 * Real product search via RapidAPI's "Real-Time Product Search" (Google Shopping data).
 * Returns real listings with real prices — not seeded/fake data.
 *
 * The response shape from third-party RapidAPI wrappers varies by field naming, so this
 * normalizes defensively across the common key variants rather than trusting one shape.
 */

export type Product = {
  id: string;
  title: string;
  price: number | null;
  rawPrice: string | null;
  currency: string | null;
  image: string | null;
  url: string | null;
  source: string | null;
};

function parsePrice(raw: unknown): { value: number | null; raw: string | null } {
  if (raw == null) return { value: null, raw: null };
  const str = String(raw);
  let cleaned = str.replace(/[^0-9.,]/g, '');

  // "R 299,00" — comma is a decimal separator, not a thousands separator.
  if (/,\d{2}$/.test(cleaned) && cleaned.indexOf('.') < cleaned.lastIndexOf(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // "$1,299.00" — comma is a thousands separator.
    cleaned = cleaned.replace(/,/g, '');
  }

  const num = parseFloat(cleaned);
  return { value: Number.isFinite(num) ? num : null, raw: str };
}

function firstOf<T>(...vals: (T | undefined | null)[]): T | null {
  for (const v of vals) if (v !== undefined && v !== null) return v;
  return null;
}

function normalize(raw: any, i: number): Product {
  const offer = raw.offer ?? raw.offers?.[0] ?? {};
  const priceRaw = firstOf(offer.price, raw.product_price, raw.price, raw.typical_price_range?.[0]);
  const { value, raw: rawPrice } = parsePrice(priceRaw);
  const image = firstOf<string>(
    raw.product_photos?.[0],
    raw.thumbnail,
    raw.image,
    raw.product_photo,
  );
  const url = firstOf<string>(offer.offer_page_url, raw.product_page_url, raw.link, raw.url);

  return {
    id: String(firstOf(raw.product_id, raw.id, `p${i}`)),
    title: String(firstOf(raw.product_title, raw.title, 'Unknown product')),
    price: value,
    rawPrice,
    currency: firstOf<string>(offer.currency, raw.currency, 'ZAR'),
    image,
    url,
    source: firstOf<string>(raw.store_name, offer.store_name, raw.source, raw.store),
  };
}

export async function searchProducts(
  query: string,
  opts: { country?: string; limit?: number } = {},
): Promise<Product[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const host = process.env.RAPIDAPI_HOST || 'real-time-product-search.p.rapidapi.com';
  if (!apiKey) throw new Error('RAPIDAPI_KEY env var missing');

  const country = opts.country ?? 'za';
  const limit = opts.limit ?? 5;

  const params = new URLSearchParams({
    q: query,
    country,
    language: 'en',
    page: '1',
  });

  const res = await fetch(`https://${host}/search?${params.toString()}`, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': host,
    },
    // Product search results change; avoid Next.js caching stale prices.
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Product search failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const items: any[] = json.data?.products ?? json.data ?? json.products ?? [];

  return items.slice(0, limit).map(normalize);
}
