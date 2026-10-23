import type { Product, ShippingAddress } from "./types";

const API = "https://api.printify.com/v1";

function token() {
  const value = process.env.PRINTIFY_API_TOKEN;
  if (!value) throw new Error("PRINTIFY_API_TOKEN est requis");
  return value;
}

export function printifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN);
}

let detectedShopId: string | null = null;

/** PRINTIFY_SHOP_ID si défini, sinon la boutique API du compte (ou à défaut la première) */
async function shopId(): Promise<string> {
  if (process.env.PRINTIFY_SHOP_ID) return process.env.PRINTIFY_SHOP_ID;
  if (detectedShopId) return detectedShopId;
  const shops = await call<{ id: number; title: string; sales_channel: string }[]>("/shops.json", { revalidate: 3600 });
  const shop = shops.find((s) => s.sales_channel === "custom_integration") ?? shops[0];
  if (!shop) throw new Error("Aucune boutique trouvée sur le compte Printify");
  detectedShopId = String(shop.id);
  return detectedShopId;
}

async function call<T>(path: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  const { revalidate, ...rest } = init;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token()}`,
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
  is_locked?: boolean;
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
  const shop = await shopId();
  const res = await call<{ data: RawProduct[] }>(`/shops/${shop}/products.json?limit=50`, { revalidate: 300 });
  // Un produit sur lequel tu as cliqué "Publish" reste "Publishing" (verrouillé) dans Printify
  // tant que le site n'a pas confirmé la publication : on la confirme ici.
  const publishing = res.data.filter((p) => p.is_locked);
  await Promise.all(publishing.map((p) => confirmPublished(p.id).catch((err) => console.error(err))));
  return res.data.filter((p) => p.visible || p.is_locked).map(normalize);
}

async function confirmPublished(productId: string) {
  const shop = await shopId();
  await call(`/shops/${shop}/products/${productId}/publishing_succeeded.json`, {
    method: "POST",
    body: JSON.stringify({ external: { id: productId, handle: `/produit/${productId}` } }),
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  const shop = await shopId();
  try {
    return normalize(await call<RawProduct>(`/shops/${shop}/products/${encodeURIComponent(id)}.json`, { revalidate: 300 }));
  } catch {
    return null;
  }
}

/** Version non mise en cache, utilisée pour fixer les prix au moment du paiement */
export async function getProductFresh(id: string): Promise<Product | null> {
  const shop = await shopId();
  try {
    return normalize(await call<RawProduct>(`/shops/${shop}/products/${encodeURIComponent(id)}.json`));
  } catch {
    return null;
  }
}

export async function createOrder(order: {
  externalId: string;
  lineItems: { product_id: string; variant_id: number; quantity: number }[];
  address: ShippingAddress;
}) {
  const shop = await shopId();
  const created = await call<{ id: string }>(`/shops/${shop}/orders.json`, {
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
    await call(`/shops/${shop}/orders/${created.id}/send_to_production.json`, { method: "POST" });
  }
  return created;
}
