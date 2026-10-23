import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createOrder } from "@/lib/printify";
import { stripe } from "@/lib/stripe";
import type { ShippingAddress } from "@/lib/types";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    return NextResponse.json({ error: `Signature invalide : ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true });

  try {
    const cart = JSON.parse(session.metadata?.cart ?? "[]") as [string, number, number][];
    const order = await createOrder({
      externalId: session.id,
      lineItems: cart.map(([product_id, variant_id, quantity]) => ({ product_id, variant_id, quantity })),
      address: toAddress(session),
    });
    console.log(`Commande Printify ${order.id} créée pour la session ${session.id}`);
  } catch (err) {
    // Une erreur 500 fait réessayer Stripe automatiquement
    console.error("Échec de création de la commande Printify", err);
    return NextResponse.json({ error: "Création de commande échouée" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function toAddress(session: Stripe.Checkout.Session): ShippingAddress {
  // Selon la version d'API Stripe, l'adresse est dans collected_information ou shipping_details
  const legacy = (session as unknown as { shipping_details?: { name?: string; address?: Stripe.Address } }).shipping_details;
  const shipping = session.collected_information?.shipping_details ?? legacy;
  const address = shipping?.address ?? session.customer_details?.address;
  const fullName = (shipping?.name ?? session.customer_details?.name ?? "").trim();
  const [first, ...rest] = fullName.split(/\s+/);

  return {
    first_name: first ?? "",
    last_name: rest.join(" ") || first || "",
    email: session.customer_details?.email ?? "",
    phone: session.customer_details?.phone ?? "",
    country: address?.country ?? "FR",
    region: address?.state ?? "",
    address1: address?.line1 ?? "",
    address2: address?.line2 ?? "",
    city: address?.city ?? "",
    zip: address?.postal_code ?? "",
  };
}
