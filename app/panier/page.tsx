"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, total, setQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })) }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Paiement indisponible");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <section className="page">
        <h1>Ton panier est vide</h1>
        <Link href="/#collection" className="btn">
          Voir la collection
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Panier</h1>
      <ul className="cart">
        {items.map((item) => (
          <li key={`${item.productId}-${item.variantId}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {item.image && <img src={item.image} alt="" />}
            <div className="info">
              <strong>{item.title}</strong>
              <span>{item.variantTitle}</span>
            </div>
            <input
              type="number"
              min={0}
              max={20}
              value={item.quantity}
              aria-label="Quantité"
              onChange={(e) => setQuantity(item.variantId, item.productId, Math.min(20, Number(e.target.value) || 0))}
            />
            <span className="line-total">{formatPrice(item.price * item.quantity)}</span>
            <button className="remove" onClick={() => setQuantity(item.variantId, item.productId, 0)} aria-label="Retirer">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="summary">
        <p>
          Sous-total <strong>{formatPrice(total)}</strong>
        </p>
        <p className="note">Livraison calculée à l&apos;étape suivante.</p>
        <button className="btn" onClick={checkout} disabled={loading}>
          {loading ? "Redirection…" : "Payer"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  );
}
