import type { Product, ShippingAddress } from "./types";

const API = "https://api.printify.com/v1";

function config() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shopId) throw new Error("PRINTIFY_API_TOKEN et PRINTIFY_SHOP_ID sont requis");
  return { token, shopId };
}

export function printifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN && process.env.PRINTIFY_SHOP_ID);
}

async function call<T>(path: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  const { token } = config();
  const { revalidate, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "pave-1968",
      ...rest.headers,
    },
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" }),
  });
  if (!res.ok) {
    throw new Error(`Printify ${res.status} sur ${path} : ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type RawProduct = {
  id: string;
  title: string;
  description: string;
  visible: boolean;
  images: { src: string; variant_ids: number[]; is_default: boolean }[];
  options: { name: string; type: string; values: { id: number; title: string; colors?: string[] }[] }[];
  variants: { id: number; title: string; price: number; is_enabled: boolean; is_available?: boolean; options: number[] }[];
};

function normalize(p: RawProduct): Product {
  const variants = p.variants
    .filter((v) => v.is_enabled)
    .map((v) => ({
      id: v.id,
      title: v.title,
      price: v.price,
      available: v.is_available !== false,
      options: v.options,
    }));
  // On ne garde que les valeurs d'option utilisées par au moins une variante active
  const used = new Set(variants.flatMap((v) => v.options));
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    images: p.images.map((i) => ({ src: i.src, variantIds: i.variant_ids, isDefault: i.is_default })),
    options: p.options.map((o) => ({ ...o, values: o.values.filter((v) => used.has(v.id)) })),
    variants,
  };
}

export async function listProducts(): Promise<Product[]> {
  const { shopId } = config();
  const res = await call<{ data: RawProduct[] }>(`/shops/${shopId}/products.json?limit=50`, { revalidate: 300 });
  return res.data.filter((p) => p.visible !== false).map(normalize);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { shopId } = config();
  try {
    return normalize(await call<RawProduct>(`/shops/${shopId}/products/${encodeURIComponent(id)}.json`, { revalidate: 300 }));
  } catch {
    return null;
  }
}

/** Version non mise en cache, utilisée pour fixer les prix au moment du paiement */
export async function getProductFresh(id: string): Promise<Product | null> {
  const { shopId } = config();
  try {
    return normalize(await call<RawProduct>(`/shops/${shopId}/products/${encodeURIComponent(id)}.json`));
  } catch {
    return null;
  }
}

export async function createOrder(order: {
  externalId: string;
  lineItems: { product_id: string; variant_id: number; quantity: number }[];
  address: ShippingAddress;
}) {
  const { shopId } = config();
  const created = await call<{ id: string }>(`/shops/${shopId}/orders.json`, {
    method: "POST",
    body: JSON.stringify({
      external_id: order.externalId,
      label: `Pavé 1968 ${order.externalId.slice(-8)}`,
      line_items: order.lineItems,
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: order.address,
    }),
  });

  if (process.env.PRINTIFY_AUTO_PRODUCTION === "true") {
    await call(`/shops/${shopId}/orders/${created.id}/send_to_production.json`, { method: "POST" });
  }
  return created;
}
