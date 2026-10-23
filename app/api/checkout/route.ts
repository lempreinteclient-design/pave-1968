import { NextResponse } from "next/server";
import { getProduct, imageFor, isDemo } from "@/lib/catalog";
import { siteUrl, stripe, stripeConfigured } from "@/lib/stripe";

const MAX_LINES = 10;
const COUNTRIES = ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL", "PT", "AT", "IE"] as const;

type Line = { productId: string; variantId: number; quantity: number };

export async function POST(req: Request) {
  if (isDemo() || !stripeConfigured()) {
    return NextResponse.json(
      { error: "Mode démo : le paiement sera actif une fois Printify et Stripe configurés." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as { items?: Line[] } | null;
  const items = (body?.items ?? []).filter(
    (i) => typeof i.productId === "string" && Number.isInteger(i.variantId) && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 20,
  );
  if (!items.length) return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  if (items.length > MAX_LINES) return NextResponse.json({ error: `Maximum ${MAX_LINES} articles différents` }, { status: 400 });

  // Les prix viennent toujours de Printify, jamais du navigateur
  const lineItems = [];
  for (const item of items) {
    const product = await getProduct(item.productId, { fresh: true });
    const variant = product?.variants.find((v) => v.id === item.variantId && v.available);
    if (!product || !variant) {
      return NextResponse.json({ error: "Un article du panier n'est plus disponible" }, { status: 409 });
    }
    const image = imageFor(product, variant.id);
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "eur",
        unit_amount: variant.price,
        product_data: {
          name: `${product.title} (${variant.title})`,
          ...(image.startsWith("https://") ? { images: [image] } : {}),
        },
      },
    });
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: [...COUNTRIES] },
    phone_number_collection: { enabled: true },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Livraison standard",
          fixed_amount: { amount: Number(process.env.SHIPPING_CENTS ?? 490), currency: "eur" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 4 },
            maximum: { unit: "business_day", value: 9 },
          },
        },
      },
    ],
    // Le webhook relit le panier ici pour créer la commande Printify (limite Stripe : 500 caractères)
    metadata: { cart: JSON.stringify(items.map((i) => [i.productId, i.variantId, i.quantity])) },
    success_url: `${siteUrl()}/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/panier`,
  });

  return NextResponse.json({ url: session.url });
}
